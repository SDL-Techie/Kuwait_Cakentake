"""
Blog management routes.

ASSUMPTIONS ABOUT EXISTING PROJECT UTILITIES
---------------------------------------------------------------------------
This file assumes your project already has, same as the rest of the app:

1. JWT auth via flask_jwt_extended, where `get_jwt_identity()` returns the
   authenticated user's `id`.
2. A `role_required(allowed_roles)` decorator that takes a single list of
   allowed role strings and 403s if the current user's role (read from the
   JWT claims) isn't in it — e.g. `@role_required(["ADMIN", "AGENT"])`.

Update the import path below to wherever `role_required` actually lives in
your project — the route bodies don't depend on its internal implementation,
only on it accepting one list argument.
---------------------------------------------------------------------------
"""

from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    verify_jwt_in_request,
)

from extensions import db
from models.blog import Blog
from models.user import User
import cloudinary.uploader
from services.blog_service import (
    generate_unique_slug,
    calculate_reading_time,
    validate_blog_payload,
    VALID_STATUSES,
)

# TODO: point this at wherever role_required actually lives in your project
# (this path was a guess and doesn't exist — that's what caused the
# ModuleNotFoundError). Everything else in this file is unaffected by where
# it lives, as long as it's a `role_required(allowed_roles: list)` decorator.
from middleware.role import role_required

blog_bp = Blueprint("blog_bp", __name__, url_prefix="/blogs")

EDITOR_ROLES = ["ADMIN", "SHOP_MANAGER", "SALES_AGENT"]
FULL_ACCESS_ROLES = ["ADMIN", "SHOP_MANAGER"]


# ─────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────

def _current_user():
    user_id = get_jwt_identity()
    return User.query.get(user_id) if user_id else None


def _can_edit(blog: Blog, user: User) -> bool:
    """Admin/Shop Manager can touch any blog. A Sales Agent only their own."""
    if user is None:
        return False
    if user.role in FULL_ACCESS_ROLES:
        return True
    return user.role == "SALES_AGENT" and blog.author_id == user.id


def _can_view_unpublished(blog: Blog, user: User) -> bool:
    """Same rule as editing: drafts/archived posts are visible to
    Admin/Shop Manager always, and to a Sales Agent only if they authored it."""
    return _can_edit(blog, user)

@blog_bp.route("/upload-image", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "SALES_AGENT"])
def upload_blog_image():

    file = request.files.get("image")

    if not file:
        return jsonify({"error": "Image is required"}), 400

    result = cloudinary.uploader.upload(
        file,
        folder="blogs"
    )

    return jsonify({
        "url": result["secure_url"],
        "public_id": result["public_id"]
    }), 200

# ─────────────────────────────────────────────────────────────────────────
# CREATE  —  POST /blogs
# ─────────────────────────────────────────────────────────────────────────

@blog_bp.route("", methods=["POST"])
@jwt_required()
@role_required(EDITOR_ROLES)
def create_blog():
    user = _current_user()
    data = request.get_json(silent=True) or {}

    errors = validate_blog_payload(data)
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400

    status = data.get("status", "DRAFT")
    if status not in VALID_STATUSES:
        status = "DRAFT"

    blog = Blog(
        title=data["title"].strip(),
        short_description=(data.get("short_description") or "").strip() or None,
        content=data["content"].strip(),
        cover_image=data.get("cover_image"),
        cloudinary_public_id=data.get("cloudinary_public_id"),
        category=data.get("category"),
        tags=data.get("tags") or [],
        featured=bool(data.get("featured", False)),
        status=status,
        meta_title=data.get("meta_title"),
        meta_description=data.get("meta_description"),
        # Auto-filled — never trust these from the client.
        author_id=user.id,
        author_name=f"{user.first_name} {user.last_name}".strip(),
        author_role=user.role,
    )
    blog.slug = generate_unique_slug(blog.title)
    blog.reading_time = calculate_reading_time(blog.content)
    if status == "PUBLISHED":
        blog.published_at = datetime.utcnow()

    db.session.add(blog)
    db.session.commit()

    return jsonify({"blog": blog.to_dict()}), 201


# ─────────────────────────────────────────────────────────────────────────
# UPDATE  —  PUT /blogs/<id>
# ─────────────────────────────────────────────────────────────────────────

@blog_bp.route("/<int:blog_id>", methods=["PUT"])
@jwt_required()
@role_required(EDITOR_ROLES)
def update_blog(blog_id):
    user = _current_user()
    blog = Blog.query.get(blog_id)
    if not blog:
        return jsonify({"error": "Blog not found"}), 404

    if not _can_edit(blog, user):
        return jsonify({"error": "You do not have permission to edit this blog"}), 403

    data = request.get_json(silent=True) or {}
    errors = validate_blog_payload(data, is_update=True)
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400

    title_changed = False
    editable_text_fields = [
        "title", "short_description", "content", "cover_image",
        "cloudinary_public_id", "category", "meta_title", "meta_description",
    ]
    for field in editable_text_fields:
        if field in data:
            value = data[field]
            if isinstance(value, str):
                value = value.strip() or None
            setattr(blog, field, value)
            if field == "title":
                title_changed = True

    if "tags" in data and isinstance(data["tags"], list):
        blog.tags = data["tags"]

    if "featured" in data:
        blog.featured = bool(data["featured"])

    if "status" in data and data["status"] in VALID_STATUSES:
        if data["status"] == "PUBLISHED" and blog.status != "PUBLISHED":
            blog.published_at = datetime.utcnow()
        blog.status = data["status"]

    if title_changed and blog.title:
        blog.slug = generate_unique_slug(blog.title, blog_id=blog.id)

    if "content" in data and blog.content:
        blog.reading_time = calculate_reading_time(blog.content)

    blog.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({"blog": blog.to_dict()}), 200


# ─────────────────────────────────────────────────────────────────────────
# DELETE  —  DELETE /blogs/<id>
# ─────────────────────────────────────────────────────────────────────────

@blog_bp.route("/<int:blog_id>", methods=["DELETE"])
@jwt_required()
@role_required(EDITOR_ROLES)
def delete_blog(blog_id):
    user = _current_user()
    blog = Blog.query.get(blog_id)
    if not blog:
        return jsonify({"error": "Blog not found"}), 404

    if not _can_edit(blog, user):
        return jsonify({"error": "You do not have permission to delete this blog"}), 403

    db.session.delete(blog)
    db.session.commit()
    return jsonify({"message": "Blog deleted"}), 200


# ─────────────────────────────────────────────────────────────────────────
# ADMIN LIST  —  GET /blogs/admin
# ─────────────────────────────────────────────────────────────────────────

@blog_bp.route("/admin", methods=["GET"])
@jwt_required()
@role_required(EDITOR_ROLES)
def list_blogs_admin():
    user = _current_user()

    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 10, type=int)
    search = request.args.get("search", "", type=str).strip()
    category = request.args.get("category", "", type=str).strip()
    status = request.args.get("status", "", type=str).strip()
    author = request.args.get("author", "", type=str).strip()
    featured = request.args.get("featured", "", type=str).strip()

    query = Blog.query

    # A Sales Agent can browse every published post here, but only their
    # own drafts/archived posts — matches the "Read Draft Blogs: Author
    # Only" rule. Admin/Shop Manager have no such restriction.
    if user.role == "SALES_AGENT":
        query = query.filter(
            db.or_(Blog.status == "PUBLISHED", Blog.author_id == user.id)
        )

    if search:
        like = f"%{search}%"
        query = query.filter(
            db.or_(
                Blog.title.ilike(like),
                Blog.category.ilike(like),
                Blog.author_name.ilike(like),
                # tags is a JSON column — cast to text for a substring match
                db.cast(Blog.tags, db.Text).ilike(like),
            )
        )

    if category:
        query = query.filter(Blog.category == category)

    if status and status in VALID_STATUSES:
        query = query.filter(Blog.status == status)

    if author:
        query = query.filter(Blog.author_id == author)

    if featured in ("true", "false"):
        query = query.filter(Blog.featured == (featured == "true"))

    query = query.order_by(Blog.created_at.desc())

    pagination = query.paginate(page=page, per_page=limit, error_out=False)

    return jsonify({
        "items": [b.to_summary_dict() for b in pagination.items],
        "page": pagination.page,
        "pages": pagination.pages,
        "total": pagination.total,
    }), 200


# ─────────────────────────────────────────────────────────────────────────
# ADMIN SINGLE  —  GET /blogs/admin/<id>
# ─────────────────────────────────────────────────────────────────────────

@blog_bp.route("/admin/<int:blog_id>", methods=["GET"])
@jwt_required()
@role_required(EDITOR_ROLES)
def get_blog_admin(blog_id):
    user = _current_user()
    blog = Blog.query.get(blog_id)
    if not blog:
        return jsonify({"error": "Blog not found"}), 404

    if blog.status != "PUBLISHED" and not _can_view_unpublished(blog, user):
        return jsonify({"error": "You do not have permission to view this blog"}), 403

    return jsonify({"blog": blog.to_dict()}), 200


# ─────────────────────────────────────────────────────────────────────────
# PUBLIC LIST  —  GET /blogs  (published only)
# ─────────────────────────────────────────────────────────────────────────

@blog_bp.route("", methods=["GET"])
def list_blogs_public():
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 10, type=int)
    search = request.args.get("search", "", type=str).strip()
    category = request.args.get("category", "", type=str).strip()
    featured = request.args.get("featured", "", type=str).strip()

    query = Blog.query.filter(Blog.status == "PUBLISHED")

    if search:
        like = f"%{search}%"
        query = query.filter(
            db.or_(
                Blog.title.ilike(like),
                Blog.category.ilike(like),
                Blog.author_name.ilike(like),
                db.cast(Blog.tags, db.Text).ilike(like),
            )
        )

    if category:
        query = query.filter(Blog.category == category)

    if featured in ("true", "false"):
        query = query.filter(Blog.featured == (featured == "true"))

    query = query.order_by(Blog.published_at.desc())

    pagination = query.paginate(page=page, per_page=limit, error_out=False)

    return jsonify({
        "items": [b.to_summary_dict() for b in pagination.items],
        "page": pagination.page,
        "pages": pagination.pages,
        "total": pagination.total,
    }), 200


# ─────────────────────────────────────────────────────────────────────────
# PUBLIC DETAIL  —  GET /blogs/<slug>
# ─────────────────────────────────────────────────────────────────────────

@blog_bp.route("/<slug>", methods=["GET"])
def get_blog_by_slug(slug):
    blog = Blog.query.filter_by(slug=slug).first()
    if not blog:
        return jsonify({"error": "Blog not found"}), 404

    # This endpoint is public, but we still want to know who (if anyone) is
    # logged in — both to gate unpublished posts and to skip the view
    # counter for staff previews. `optional=True` means no token is fine.
    verify_jwt_in_request(optional=True)
    identity = get_jwt_identity()
    viewer = User.query.get(identity) if identity else None

    if blog.status != "PUBLISHED":
        # Drafts/archived posts are only visible to Admin, Shop Manager, or
        # the Sales Agent who wrote them — everyone else gets a 404 rather
        # than a 403, so unpublished slugs aren't discoverable.
        if not _can_view_unpublished(blog, viewer):
            return jsonify({"error": "Blog not found"}), 404

    is_staff_preview = viewer is not None and viewer.role in (
        "ADMIN", "SHOP_MANAGER", "SALES_AGENT"
    )
    if not is_staff_preview:
        # Simple read-modify-write increment. For very high-traffic posts,
        # swap this for an atomic `UPDATE blogs SET views = views + 1 ...`
        # to avoid a race between concurrent requests.
        blog.views = (blog.views or 0) + 1
        db.session.commit()

    return jsonify({"blog": blog.to_dict()}), 200


# ─────────────────────────────────────────────────────────────────────────
# STATUS CHANGES  —  PATCH /blogs/<id>/publish|archive|draft
# ─────────────────────────────────────────────────────────────────────────

def _set_status(blog_id, new_status):
    user = _current_user()
    blog = Blog.query.get(blog_id)
    if not blog:
        return jsonify({"error": "Blog not found"}), 404
    if not _can_edit(blog, user):
        return jsonify({"error": "You do not have permission to modify this blog"}), 403

    blog.status = new_status
    if new_status == "PUBLISHED":
        blog.published_at = datetime.utcnow()
    blog.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"blog": blog.to_dict()}), 200


@blog_bp.route("/<int:blog_id>/publish", methods=["PATCH"])
@jwt_required()
@role_required(EDITOR_ROLES)
def publish_blog(blog_id):
    return _set_status(blog_id, "PUBLISHED")


@blog_bp.route("/<int:blog_id>/archive", methods=["PATCH"])
@jwt_required()
@role_required(EDITOR_ROLES)
def archive_blog(blog_id):
    return _set_status(blog_id, "ARCHIVED")


@blog_bp.route("/<int:blog_id>/draft", methods=["PATCH"])
@jwt_required()
@role_required(EDITOR_ROLES)
def draft_blog(blog_id):
    return _set_status(blog_id, "DRAFT")