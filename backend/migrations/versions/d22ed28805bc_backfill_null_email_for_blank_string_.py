"""backfill null email for blank string users

Revision ID: d22ed28805bc
Revises: 7ccb90174d48
Create Date: 2026-08-29 17:11:52.167738

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd22ed28805bc'
down_revision = '7ccb90174d48'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("UPDATE users SET email = NULL WHERE email = ''")


def downgrade():
    op.execute("UPDATE users SET email = '' WHERE email IS NULL")
