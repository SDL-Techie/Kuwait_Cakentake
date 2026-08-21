"""merge pickup delivery-method and order-sequence migration heads

Revision ID: 20260810merge
Revises: 20260805pickup, 28b2260de8bd
Create Date: 2026-08-10
"""
from alembic import op
import sqlalchemy as sa

revision = "20260810merge"
down_revision = ("20260805pickup", "28b2260de8bd")
branch_labels = None
depends_on = None

def upgrade():
    pass

def downgrade():
    pass
