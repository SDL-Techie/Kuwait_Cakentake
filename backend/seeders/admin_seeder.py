import os
from werkzeug.security import generate_password_hash
from extensions import db
from models.user import User

def seed_admin():
    print("========== SEED ADMIN START ==========")

    email = os.getenv("DEFAULT_ADMIN_EMAIL")
    password = os.getenv("DEFAULT_ADMIN_PASSWORD")
    phone = os.getenv("DEFAULT_ADMIN_PHONE")

    print("Email:", email)
    print("Phone:", phone)

    existing_admin = User.query.filter_by(role="ADMIN").first()

    if existing_admin:
        print("Admin already exists:", existing_admin.email)
        return

    admin = User(
        first_name=os.getenv("DEFAULT_ADMIN_FIRST_NAME"),
        last_name=os.getenv("DEFAULT_ADMIN_LAST_NAME"),
        phone_no=phone,
        email=email,
        password=generate_password_hash(password),
        role="ADMIN"
    )

    db.session.add(admin)
    db.session.commit()

    print("✅ Default admin created")
