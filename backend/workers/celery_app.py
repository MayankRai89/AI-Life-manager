"""
Celery Application — AI Life Manager
=====================================
Background worker for scheduled and async tasks:
  - Daily morning check-in reminder
  - Task deadline nudge (24h before deadline)
  - Weekly mood summary report

Start the worker:
    celery -A workers.celery_app worker --loglevel=info

Start the beat scheduler (for periodic tasks):
    celery -A workers.celery_app beat --loglevel=info

Or run both together (dev only):
    celery -A workers.celery_app worker --beat --loglevel=info
"""
import os
import sys

# Ensure backend root is on path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# pyrefly: ignore [missing-import]
from celery import Celery
from celery.schedules import crontab
from core.config import settings

# ── Celery App ────────────────────────────────────────
celery_app = Celery(
    "ai_life_manager",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["workers.tasks"],      # auto-discover tasks module
)

celery_app.conf.update(
    # Serialization
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],

    # Timezone
    timezone="UTC",
    enable_utc=True,

    # Result expiry — keep results for 1 hour
    result_expires=3600,

    # Retry policy
    task_acks_late=True,
    task_reject_on_worker_lost=True,

    # Beat schedule — periodic tasks
    beat_schedule={
        # Fire every day at 7:00 AM UTC
        "daily-morning-reminder": {
            "task": "workers.tasks.send_morning_reminder",
            "schedule": crontab(hour=7, minute=0),
        },
        # Fire every day at 9:00 AM UTC — check for tasks due in 24h
        "daily-deadline-nudge": {
            "task": "workers.tasks.send_deadline_nudges",
            "schedule": crontab(hour=9, minute=0),
        },
        # Fire every Monday at 8:00 AM UTC — weekly mood summary
        "weekly-mood-summary": {
            "task": "workers.tasks.send_weekly_mood_summary",
            "schedule": crontab(day_of_week=1, hour=8, minute=0),
        },
    },
)
