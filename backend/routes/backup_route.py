import io
import json
from datetime import datetime

from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import jwt_required

from services.backup_service import (
    create_backup,
    restore_backup,
    _JSONEncoder,
)

from middleware.role import role_required

backup_bp = Blueprint("backup", __name__)


@backup_bp.route("/backup", methods=["POST"])
@jwt_required()
@role_required(["ADMIN"])
def backup_database():

    result = create_backup()

    if not result["success"]:
        return jsonify(result), 500

    json_data = json.dumps(
        result["backup"],
        cls=_JSONEncoder,
        indent=2
    )

    return send_file(
        io.BytesIO(json_data.encode("utf-8")),
        as_attachment=True,
        download_name=f"cakentake_backup_{datetime.now():%Y%m%d_%H%M%S}.json",
        mimetype="application/json"
    )


@backup_bp.route("/restore", methods=["POST"])
@jwt_required()
@role_required(["OWNER", "ADMIN"])
def restore_database():

    file = request.files.get("file")

    if not file:
        return jsonify({
            "success": False,
            "message": "Backup file is required."
        }), 400

    try:
        backup = json.load(file)
    except (ValueError, TypeError) as e:
        return jsonify({
            "success": False,
            "message": "Uploaded file is not valid JSON.",
            "error": str(e)
        }), 400

    result = restore_backup(backup)

    return jsonify(result), 200 if result["success"] else 500

