from urllib.parse import quote_plus
import os
from dotenv import load_dotenv
from datetime import timedelta

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

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

    API_BASE_URL = os.getenv("API_BASE_URL")

    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
    STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY")

    TAP_SECRET_KEY = os.getenv("TAP_SECRET_KEY")
    TAP_PUBLIC_KEY = os.getenv("TAP_PUBLIC_KEY")

    TAP_SUCCESS_URL = os.getenv("TAP_SUCCESS_URL")
    TAP_CANCEL_URL = os.getenv("TAP_CANCEL_URL")

    STRIPE_SUCCESS_URL = os.getenv("STRIPE_SUCCESS_URL")
    STRIPE_CANCEL_URL = os.getenv("STRIPE_CANCEL_URL")


    EXPO_PUSH_URL = os.getenv("EXPO_PUSH_URL", "https://exp.host/--/api/v2/push/send")
    EXPO_RECEIPTS_URL = os.getenv("EXPO_RECEIPTS_URL", "https://exp.host/--/api/v2/push/getReceipts")
    EXPO_ACCESS_TOKEN = os.getenv("EXPO_ACCESS_TOKEN", "")
    NOTIFICATION_SCHEDULER_MODE = os.getenv("NOTIFICATION_SCHEDULER_MODE", "disabled").strip().lower()
    ENABLE_NOTIFICATION_SCHEDULER = NOTIFICATION_SCHEDULER_MODE == "embedded"
