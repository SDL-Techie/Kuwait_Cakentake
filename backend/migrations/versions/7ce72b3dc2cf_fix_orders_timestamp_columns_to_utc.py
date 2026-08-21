"""fix orders timestamp columns to utc

Revision ID: a1b2c3d4e5f6
Revises: 7018f85e8239
Create Date: 2026-08-21

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '7018f85e8239'
branch_labels = None
depends_on = None

# All orders timestamp columns affected by the naive-DateTime bug
ORDER_TS_COLUMNS = [
    "created_at", "updated_at", "order_date",
    "kitchen_assigned_at", "preparation_started_at", "completed_by_kitchen_at",
    "delivery_agent_assigned_at", "driver_assigned_at", "driver_accepted_at",
    "out_for_delivery_at", "delivered_at", "driver_submitted_at",
    "delivery_confirmed_at", "agent_settled_at",
]


def upgrade():
    # 1. Correct existing corrupted data BEFORE changing column type.
    #    Stored values are actually IST wall-clock times mislabeled as UTC,
    #    so subtract 5:30 to get the true UTC instant.
    for col in ORDER_TS_COLUMNS:
        op.execute(f"""
            UPDATE orders
            SET {col} = {col} - INTERVAL '5 hours 30 minutes'
            WHERE {col} IS NOT NULL
        """)

    # 2. Convert columns to TIMESTAMP WITH TIME ZONE so this can't happen again.
    for col in ORDER_TS_COLUMNS:
        op.alter_column(
            'orders', col,
            type_=sa.DateTime(timezone=True),
            postgresql_using=f"{col} AT TIME ZONE 'UTC'"
        )


def downgrade():
    for col in ORDER_TS_COLUMNS:
        op.alter_column('orders', col, type_=sa.DateTime())
    for col in ORDER_TS_COLUMNS:
        op.execute(f"""
            UPDATE orders
            SET {col} = {col} + INTERVAL '5 hours 30 minutes'
            WHERE {col} IS NOT NULL
        """)