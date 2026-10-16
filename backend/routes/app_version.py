import os
import re
from flask import Blueprint, request, jsonify

app_version_bp = Blueprint(
    "app_version",
    __name__,
    url_prefix="/api/app"
)


def parse_version(version):
    value = str(version).strip()

    if not re.fullmatch(r"\d+(?:\.\d+)*", value):
        raise ValueError("Invalid version")

    parts = tuple(int(x) for x in value.split("."))
    return parts


def version_is_older(current, target):
    a = parse_version(current)
    b = parse_version(target)

    length = max(len(a), len(b))
    a += (0,) * (length - len(a))
    b += (0,) * (length - len(b))

    return a < b


@app_version_bp.get("/version")
def check_app_version():
    platform = request.args.get("platform", "android").lower()

    if platform not in ("android", "ios"):
        return jsonify({"message": "Invalid platform"}), 400

    try:
        current_version = request.args.get("current_version", "0.0.0")
        current_build = int(request.args.get("current_build", "0"))

        latest_version = os.getenv("APP_LATEST_VERSION", "1.0.0")
        minimum_version = os.getenv("APP_MINIMUM_VERSION", "1.0.0")

        prefix = platform.upper()

        latest_build = int(os.getenv(f"APP_LATEST_{prefix}_BUILD", "0"))
        minimum_build = int(os.getenv(f"APP_MINIMUM_{prefix}_BUILD", "0"))

        if min(current_build, latest_build, minimum_build) < 0:
            raise ValueError("Invalid build")

        parse_version(current_version)
        parse_version(latest_version)
        parse_version(minimum_version)

    except (ValueError, TypeError):
        return jsonify({"message": "Invalid version or build"}), 400

    update_available = (
        version_is_older(current_version, latest_version)
        or (
            not version_is_older(current_version, latest_version)
            and not version_is_older(latest_version, current_version)
            and current_build < latest_build
        )
    )

    force_update = (
        version_is_older(current_version, minimum_version)
        or (
            not version_is_older(current_version, minimum_version)
            and not version_is_older(minimum_version, current_version)
            and current_build < minimum_build
        )
    )

    store_url = os.getenv(
        "ANDROID_STORE_URL" if platform == "android"
        else "IOS_STORE_URL",
        ""
    )

    return jsonify({
        "platform": platform,
        "current_version": current_version,
        "current_build": current_build,
        "latest_version": latest_version,
        "latest_build": latest_build,
        "minimum_version": minimum_version,
        "minimum_build": minimum_build,
        "update_available": update_available or force_update,
        "force_update": force_update,
        "store_url": store_url,
        "message": os.getenv(
            "APP_UPDATE_MESSAGE",
            "A new CakeNTake update is available."
        )
    })