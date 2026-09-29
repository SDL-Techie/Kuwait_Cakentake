from urllib.parse import quote_plus
import os
from dotenv import load_dotenv
from datetime import timedelta

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

def _env_int(name, default=0):
    try:
        return int(str(os.getenv(name, default) or default).strip())
    except (TypeError, ValueError):
        return int(default)


class Config:
    # DB_PASSWORD = quote_plus(os.getenv("DB_PASSWORD"))
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT")
    DB_NAME = os.getenv("DB_NAME")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = quote_plus(os.getenv("DB_PASSWORD", ""))

    # DATABASE_URL is preferred in deployment and also makes local/test
    # environments easy to override without editing this file.
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL") or (
        f"postgresql://{os.getenv('DB_USER', 'postgres')}:"
        f"{DB_PASSWORD}@"
        f"{os.getenv('DB_HOST', 'localhost')}:"
        f"{os.getenv('DB_PORT', '5432')}/"
        f"{os.getenv('DB_NAME', 'cakentake')}"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=10)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

    API_BASE_URL = (os.getenv("API_BASE_URL") or "").rstrip("/")

    TAP_SECRET_KEY = os.getenv("TAP_SECRET_KEY")
    TAP_PUBLIC_KEY = os.getenv("TAP_PUBLIC_KEY")
    TAP_MERCHANT_ID = os.getenv("TAP_MERCHANT_ID")
    TAP_REDIRECT_BASE_URL = (os.getenv("TAP_REDIRECT_BASE_URL") or "").strip().rstrip("/")
    # Legacy web return URLs are still supported, but WEB_APP_URL is preferred.
    TAP_SUCCESS_URL = os.getenv("TAP_SUCCESS_URL")
    TAP_CANCEL_URL = os.getenv("TAP_CANCEL_URL")

    # Public deployment URLs used by Tap hosted checkout redirects.
    # API_BASE_URL must be the externally reachable HTTPS Flask URL in production.
    WEB_APP_URL = (os.getenv("WEB_APP_URL") or "").rstrip("/")
    APP_DEEP_LINK_SCHEME = (os.getenv("APP_DEEP_LINK_SCHEME") or "cakentake").strip().rstrip(":/")
    TAP_POST_URL = (os.getenv("TAP_POST_URL") or "").strip()

    # Mobile update policy. Change these environment values on the server when a
    # new store build becomes available; no mobile code deployment is required.
    APP_LATEST_VERSION = (os.getenv("APP_LATEST_VERSION") or "1.0.0").strip()
    APP_MINIMUM_VERSION = (os.getenv("APP_MINIMUM_VERSION") or "0.0.0").strip()
    # Optional native store build numbers. Keep 0 to disable build-number-only
    # prompting. This lets production distinguish 1.0.0 (8) from 1.0.0 (9).
    APP_LATEST_ANDROID_BUILD = _env_int("APP_LATEST_ANDROID_BUILD", 0)
    APP_MINIMUM_ANDROID_BUILD = _env_int("APP_MINIMUM_ANDROID_BUILD", 0)
    APP_LATEST_IOS_BUILD = _env_int("APP_LATEST_IOS_BUILD", 0)
    APP_MINIMUM_IOS_BUILD = _env_int("APP_MINIMUM_IOS_BUILD", 0)
    APP_UPDATE_MESSAGE = (os.getenv("APP_UPDATE_MESSAGE") or "A newer CakeNTake experience is available with the latest improvements and fixes.").strip()
    ANDROID_STORE_URL = (os.getenv("ANDROID_STORE_URL") or "https://play.google.com/store/apps/details?id=com.cakentake.app").strip()
    IOS_STORE_URL = (os.getenv("IOS_STORE_URL") or "https://apps.apple.com/app/id6815976151").strip()
    CORS_ORIGINS = [
        origin.strip()
        for origin in (os.getenv("CORS_ORIGINS") or "*").split(",")
        if origin.strip()
    ]


    EXPO_PUSH_URL = os.getenv("EXPO_PUSH_URL", "https://exp.host/--/api/v2/push/send")
    EXPO_RECEIPTS_URL = os.getenv("EXPO_RECEIPTS_URL", "https://exp.host/--/api/v2/push/getReceipts")
    EXPO_ACCESS_TOKEN = os.getenv("EXPO_ACCESS_TOKEN", "")
    NOTIFICATION_SCHEDULER_MODE = os.getenv("NOTIFICATION_SCHEDULER_MODE", "disabled").strip().lower()
    ENABLE_NOTIFICATION_SCHEDULER = NOTIFICATION_SCHEDULER_MODE == "embedded"
