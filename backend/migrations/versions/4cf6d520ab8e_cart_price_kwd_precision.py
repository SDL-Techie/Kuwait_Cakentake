"""Preserve three-decimal KWD cart price snapshots.

Revision ID: 4cf6d520ab8e
Revises: ef92c2db4fa1
"""
from alembic import op
import sqlalchemy as sa

revision = "4cf6d520ab8e"
down_revision = "ef92c2db4fa1"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column("cart_items", "total_price", existing_type=sa.Numeric(10, 2), type_=sa.Numeric(10, 3), existing_nullable=True)


def downgrade():
    op.alter_column("cart_items", "total_price", existing_type=sa.Numeric(10, 3), type_=sa.Numeric(10, 2), existing_nullable=True)
