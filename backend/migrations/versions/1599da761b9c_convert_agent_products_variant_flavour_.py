"""convert agent_products variant/flavour to json lists

Revision ID: 1599da761b9c
Revises: b6124751f06c
Create Date: 2026-08-27 11:35:22.358835

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1599da761b9c'
down_revision = 'b6124751f06c'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('agent_products', schema=None) as batch_op:
        batch_op.add_column(sa.Column('variants', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('flavours', sa.JSON(), nullable=True))
        batch_op.drop_column('variant')
        batch_op.drop_column('flavour')


def downgrade():
    with op.batch_alter_table('agent_products', schema=None) as batch_op:
        batch_op.add_column(sa.Column('variant', sa.String(length=200), nullable=True))
        batch_op.add_column(sa.Column('flavour', sa.String(length=200), nullable=True))
        batch_op.drop_column('variants')
        batch_op.drop_column('flavours')