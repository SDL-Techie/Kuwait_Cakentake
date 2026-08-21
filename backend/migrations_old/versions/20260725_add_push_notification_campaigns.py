"""add push notification campaigns

Revision ID: 20260725_push_notify
Revises: 4bcdc791ac36
"""
from alembic import op
import sqlalchemy as sa

revision = "20260725_push_notify"
down_revision = "4bcdc791ac36"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "push_tokens",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("token", sa.String(255), nullable=False, unique=True),
        sa.Column("platform", sa.String(20), nullable=False, server_default="unknown"),
        sa.Column("device_name", sa.String(120)),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime()),
        sa.Column("updated_at", sa.DateTime()),
    )
    op.create_index("ix_push_tokens_user_id", "push_tokens", ["user_id"])
    op.create_index("ix_push_tokens_token", "push_tokens", ["token"], unique=True)

    op.create_table(
        "notification_campaigns",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("campaign_name", sa.String(160), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("notification_type", sa.String(50), nullable=False),
        sa.Column("image_url", sa.Text()),
        sa.Column("audience_type", sa.String(50), nullable=False),
        sa.Column("audience_payload", sa.JSON()),
        sa.Column("platform", sa.String(20), nullable=False),
        sa.Column("click_action", sa.String(50), nullable=False),
        sa.Column("target_id", sa.Integer()),
        sa.Column("send_mode", sa.String(20), nullable=False),
        sa.Column("scheduled_at", sa.DateTime()),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("created_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime()),
        sa.Column("sent_at", sa.DateTime()),
        sa.Column("total_recipients", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("sent_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("failed_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("failure_reason", sa.Text()),
    )
    op.create_index("ix_notification_campaigns_status", "notification_campaigns", ["status"])

    op.create_table(
        "notification_recipients",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("campaign_id", sa.Integer(), sa.ForeignKey("notification_campaigns.id"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("push_token_id", sa.Integer(), sa.ForeignKey("push_tokens.id"), nullable=False),
        sa.Column("expo_ticket_id", sa.String(160)),
        sa.Column("delivery_status", sa.String(30), nullable=False),
        sa.Column("error_message", sa.Text()),
        sa.Column("receipt_check_attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_receipt_check_at", sa.DateTime()),
        sa.Column("sent_at", sa.DateTime()),
        sa.Column("opened_at", sa.DateTime()),
        sa.Column("created_at", sa.DateTime()),
    )
    op.create_index("ix_notification_recipients_campaign_id", "notification_recipients", ["campaign_id"])
    op.create_index("ix_notification_recipients_user_id", "notification_recipients", ["user_id"])


def downgrade():
    op.drop_table("notification_recipients")
    op.drop_table("notification_campaigns")
    op.drop_table("push_tokens")
