"""add order instructions to orders

Revision ID: 6089bf58a07f
Revises: 33ce2eba8dc8
Create Date: 2026-10-15 13:01:21.385653

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6089bf58a07f'
down_revision = '33ce2eba8dc8'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'orders',
        sa.Column('notes', sa.Text(), nullable=True)
    )


def downgrade():
    op.drop_column('orders', 'notes')