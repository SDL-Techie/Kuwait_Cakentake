"""merge existing migration heads

Revision ID: afbf171881a9
Revises: a1b2c3d4e5f6, e09aa0fd464b
Create Date: 2026-07-24 15:57:10.257111

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'afbf171881a9'
down_revision = ('a1b2c3d4e5f6', 'e09aa0fd464b')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
