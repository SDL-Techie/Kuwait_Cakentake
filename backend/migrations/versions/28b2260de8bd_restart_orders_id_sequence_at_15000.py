"""restart orders id sequence at 15000

Revision ID: 28b2260de8bd
Revises: d6134a0bfdff
Create Date: 2026-08-09 22:27:04.030867

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '28b2260de8bd'
down_revision = 'd6134a0bfdff'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER SEQUENCE orders_id_seq RESTART WITH 15000")


def downgrade():
    op.execute("ALTER SEQUENCE orders_id_seq RESTART WITH 1")
