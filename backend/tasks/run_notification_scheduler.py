"""Run the notification scheduler as a dedicated process.

Usage from the backend root:
    python -m tasks.run_notification_scheduler
"""
import signal
import time

from app import app
from tasks.notification_scheduler import start_notification_scheduler


def main():
    scheduler = start_notification_scheduler(app)

    def stop(*_args):
        if scheduler.running:
            scheduler.shutdown(wait=False)
        raise SystemExit(0)

    signal.signal(signal.SIGINT, stop)
    signal.signal(signal.SIGTERM, stop)
    while True:
        time.sleep(3600)


if __name__ == "__main__":
    main()
