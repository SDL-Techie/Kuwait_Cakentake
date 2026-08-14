"""requirement completion: purchase metadata and order sequence safety

Revision ID: 20260812req
Revises: fc7a8a6381f6
"""
from alembic import op
import sqlalchemy as sa

revision = "20260812req"
down_revision = "fc7a8a6381f6"
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table("purchases") as batch_op:
        batch_op.add_column(sa.Column("payment_source", sa.String(length=20), nullable=True))
        batch_op.add_column(sa.Column("reference", sa.String(length=255), nullable=True))
    op.execute("UPDATE purchases SET payment_source='OTHER' WHERE payment_source IS NULL")
    op.execute("SELECT setval(pg_get_serial_sequence('orders','id'), GREATEST(COALESCE((SELECT MAX(id) FROM orders),0),14999), true)")

def downgrade():
    with op.batch_alter_table("purchases") as batch_op:
        batch_op.drop_column("reference")
        batch_op.drop_column("payment_source")
