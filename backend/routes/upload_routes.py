"""
routes/upload_routes.py
Handles image uploads server-side: browser sends the raw file here,
Flask uploads it to Cloudinary using the API secret (never exposed to
the frontend), and returns the secure_url + public_id to save in the DB.
"""

import cloudinary.uploader
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

upload_bp = Blueprint("upload_bp", __name__, url_prefix="/api/upload")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
MAX_FILE_SIZE_MB = 5


def _allowed_file(filename: str) -> bool:
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


@upload_bp.route("/image", methods=["POST"])
@jwt_required()
def upload_image():
    """
    Accepts multipart/form-data with a 'file' field.
    Optional 'folder' field lets the frontend organize uploads
    (e.g. 'products', 'categories', 'addons').
    """
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not _allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type. Use PNG, JPG, GIF, or WEBP."}), 400

    # Basic size guard (Flask MAX_CONTENT_LENGTH in config is the hard limit;
    # this gives a clearer error message before that kicks in if configured).
    file.seek(0, 2)  # seek to end
    size_mb = file.tell() / (1024 * 1024)
    file.seek(0)  # reset pointer before upload
    if size_mb > MAX_FILE_SIZE_MB:
        return jsonify({"error": f"File too large. Max {MAX_FILE_SIZE_MB}MB."}), 400

    folder = request.form.get("folder", "cakentake")

    try:
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type="image",
            overwrite=False,
        )
        return jsonify({
            "secure_url": result.get("secure_url"),
            "public_id": result.get("public_id"),
            "width": result.get("width"),
            "height": result.get("height"),
        }), 200
    except Exception as exc:
        return jsonify({"error": f"Upload failed: {str(exc)}"}), 500


@upload_bp.route("/image/<path:public_id>", methods=["DELETE"])
@jwt_required()
def delete_image(public_id):
    """Optional: delete an image from Cloudinary when a product/category is removed
    or its image is replaced, so you don't accumulate orphaned assets."""
    try:
        result = cloudinary.uploader.destroy(public_id)
        return jsonify(result), 200
    except Exception as exc:
        return jsonify({"error": f"Delete failed: {str(exc)}"}), 500