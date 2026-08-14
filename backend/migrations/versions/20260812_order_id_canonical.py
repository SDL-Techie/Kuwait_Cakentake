"""canonical order ids from 15000

Revision ID: 20260812orderid
Revises: 20260812req
Create Date: 2026-08-12 12:20:00
"""
from alembic import op

revision = "20260812orderid"
down_revision = "20260812req"
branch_labels = None
depends_on = None

def upgrade():
    # Existing orders also expose one canonical numeric identifier.
    op.execute("UPDATE orders SET order_number = id::text WHERE order_number IS DISTINCT FROM id::text")
    # Never move the sequence backwards; next new order is at least 15000.
    op.execute("""
        SELECT setval(
            pg_get_serial_sequence('orders','id'),
            GREATEST(COALESCE((SELECT MAX(id) FROM orders), 0), 14999),
            true
        )
    """)

def downgrade():
    # Numeric order numbers are intentionally retained on downgrade.
    pass
