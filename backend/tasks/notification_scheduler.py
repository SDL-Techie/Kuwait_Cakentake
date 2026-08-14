import atexit
from datetime import datetime

from extensions import db
from models.notification_campaign import NotificationCampaign
from services.push_notification_service import check_expo_receipts, send_campaign


def process_due_notification_campaigns(app):
    with app.app_context():
        campaign_ids = [
            row.id
            for row in NotificationCampaign.query.filter(
                NotificationCampaign.status == "SCHEDULED",
                NotificationCampaign.scheduled_at.isnot(None),
                NotificationCampaign.scheduled_at <= datetime.utcnow(),
            ).all()
        ]

        for campaign_id in campaign_ids:
            try:
                campaign = db.session.get(NotificationCampaign, campaign_id)
                if campaign:
                    send_campaign(campaign)
            except Exception as exc:
                db.session.rollback()
                campaign = db.session.get(NotificationCampaign, campaign_id)
                if campaign and campaign.status == "SENDING":
                    campaign.status = "FAILED"
                    campaign.failure_reason = str(exc)
                    db.session.commit()
                app.logger.exception(
                    "Scheduled notification campaign %s failed",
                    campaign_id,
                )

        try:
            check_expo_receipts()
        except Exception:
            db.session.rollback()
            app.logger.exception("Expo receipt check failed")


def start_notification_scheduler(app):
    from apscheduler.schedulers.background import BackgroundScheduler

    scheduler = BackgroundScheduler(daemon=True, timezone="UTC")
    scheduler.add_job(
        lambda: process_due_notification_campaigns(app),
        "interval",
        seconds=60,
        id="notification_campaigns",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
        misfire_grace_time=120,
    )
    scheduler.start()
    atexit.register(lambda: scheduler.shutdown(wait=False) if scheduler.running else None)
    return scheduler
