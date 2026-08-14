"""add agent settlement status

Revision ID: 20260812agentsettle
Revises: 20260812req
"""
from alembic import op
import sqlalchemy as sa

revision = "20260812agentsettle"
down_revision = "20260812orderid"
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table("orders") as batch_op:
        batch_op.add_column(sa.Column("agent_settlement_status", sa.String(length=20), nullable=False, server_default="PENDING"))
        batch_op.add_column(sa.Column("agent_settled_at", sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column("agent_settled_by", sa.Integer(), nullable=True))
        batch_op.create_foreign_key("fk_orders_agent_settled_by_users", "users", ["agent_settled_by"], ["id"])
    op.alter_column("orders", "agent_settlement_status", server_default=None)

def downgrade():
    with op.batch_alter_table("orders") as batch_op:
        batch_op.drop_constraint("fk_orders_agent_settled_by_users", type_="foreignkey")
        batch_op.drop_column("agent_settled_by")
        batch_op.drop_column("agent_settled_at")
        batch_op.drop_column("agent_settlement_status")
