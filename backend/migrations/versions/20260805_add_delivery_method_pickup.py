"""add delivery method for pickup flow"""
from alembic import op
import sqlalchemy as sa
revision="20260805pickup"
down_revision="d6134a0bfdff"
branch_labels=None
depends_on=None
def upgrade():
    with op.batch_alter_table("orders") as b:
        b.add_column(sa.Column("delivery_method",sa.String(length=20),nullable=False,server_default="DELIVERY"))
def downgrade():
    with op.batch_alter_table("orders") as b:
        b.drop_column("delivery_method")
