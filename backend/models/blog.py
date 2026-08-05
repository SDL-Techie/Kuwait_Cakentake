from extensions import db
from datetime import datetime


class Blog(db.Model):
    __tablename__ = "blog"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(150), nullable=False)
    slug = db.Column(db.String(180), unique=True, nullable=False, index=True)
    short_description = db.Column(db.String(300), nullable=True)
    content = db.Column(db.Text, nullable=False)

    cover_image = db.Column(db.String(500), nullable=True)
    cloudinary_public_id = db.Column(db.String(255), nullable=True)

    category = db.Column(db.String(100), nullable=True)

    # Stored as a JSON array, e.g. ["cake", "dessert", "birthday"]
    tags = db.Column(db.JSON, default=list, nullable=False)

    # ── Author (denormalized name/role so historic posts keep their byline
    # even if the user's name or role changes later) ──────────────────────
    author_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )
    author_name = db.Column(db.String(200), nullable=False)
    author_role = db.Column(db.String(20), nullable=False)

    # DRAFT | PUBLISHED | ARCHIVED
    status = db.Column(db.String(20), default="DRAFT", nullable=False)

    featured = db.Column(db.Boolean, default=False, nullable=False)
    views = db.Column(db.Integer, default=0, nullable=False)

    meta_title = db.Column(db.String(200), nullable=True)
    meta_description = db.Column(db.String(300), nullable=True)

    # Auto-computed, e.g. "4 min read"
    reading_time = db.Column(db.String(20), nullable=True)

    published_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # One-directional link back to User. No backref/back_populates is added
    # on the User model on purpose, so this file is the only thing that
    # needs to change on the model side (per "do not change unrelated code").
    author = db.relationship("User", foreign_keys=[author_id])

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "short_description": self.short_description,
            "content": self.content,
            "cover_image": self.cover_image,
            "cloudinary_public_id": self.cloudinary_public_id,
            "category": self.category,
            "tags": self.tags or [],
            "author_id": self.author_id,
            "author_name": self.author_name,
            "author_role": self.author_role,
            "status": self.status,
            "featured": self.featured,
            "views": self.views,
            "meta_title": self.meta_title,
            "meta_description": self.meta_description,
            "reading_time": self.reading_time,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def to_summary_dict(self):
        """Lighter payload for list endpoints — omits the full `content` body
        so /blogs and /blogs/admin don't ship the entire article text for
        every row on a listing page."""
        data = self.to_dict()
        data.pop("content", None)
        return data