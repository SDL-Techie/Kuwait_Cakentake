"""Add per-line cake inscription to cart items.

Revision ID: ef92c2db4fa1
Revises: 6089bf58a07f
"""
from alembic import op
import sqlalchemy as sa

revision = 'ef92c2db4fa1'
down_revision = '6089bf58a07f'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('cart_items', sa.Column('message_on_cake', sa.String(length=80), nullable=True))

def downgrade():
    op.drop_column('cart_items', 'message_on_cake')
