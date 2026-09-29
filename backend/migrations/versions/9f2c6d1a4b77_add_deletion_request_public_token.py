"""add opaque public status token to account deletion requests

Revision ID: 9f2c6d1a4b77
Revises: 33ce2eba8dc8
Create Date: 2026-09-28
"""

from alembic import op
import sqlalchemy as sa
import uuid

revision = "9f2c6d1a4b77"
down_revision = "33ce2eba8dc8"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "account_deletion_requests",
        sa.Column("public_token", sa.String(length=64), nullable=True),
    )

    bind = op.get_bind()
    rows = bind.execute(sa.text("SELECT id FROM account_deletion_requests")).fetchall()
    for row in rows:
        bind.execute(
            sa.text(
                "UPDATE account_deletion_requests "
                "SET public_token = :token WHERE id = :id"
            ),
            {"token": uuid.uuid4().hex, "id": row[0]},
        )

    op.alter_column(
        "account_deletion_requests",
        "public_token",
        existing_type=sa.String(length=64),
        nullable=False,
    )
    op.create_index(
        "ix_account_deletion_requests_public_token",
        "account_deletion_requests",
        ["public_token"],
        unique=True,
    )


def downgrade():
    op.drop_index(
        "ix_account_deletion_requests_public_token",
        table_name="account_deletion_requests",
    )
    op.drop_column("account_deletion_requests", "public_token")
