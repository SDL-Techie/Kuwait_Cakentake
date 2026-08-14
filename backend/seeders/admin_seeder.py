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

    existing_admin = (User.query.filter_by(email=email).first() if email else None) or User.query.filter_by(role="ADMIN").first()

    if existing_admin:
        changed = False
        if email and existing_admin.email != email:
            existing_admin.email = email
            changed = True
        if phone and existing_admin.phone_no != phone:
            existing_admin.phone_no = phone
            changed = True
        if os.getenv("DEFAULT_ADMIN_FIRST_NAME"):
            existing_admin.first_name = os.getenv("DEFAULT_ADMIN_FIRST_NAME")
            changed = True
        if os.getenv("DEFAULT_ADMIN_LAST_NAME"):
            existing_admin.last_name = os.getenv("DEFAULT_ADMIN_LAST_NAME")
            changed = True
        if password:
            existing_admin.set_password(password)
            changed = True
        existing_admin.role = "ADMIN"
        existing_admin.is_active = True
        if changed:
            db.session.commit()
        print("Admin credentials synchronized:", existing_admin.email)
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