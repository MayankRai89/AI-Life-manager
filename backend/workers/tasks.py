"""
Celery Tasks — AI Life Manager
================================
Background job definitions. All DB access uses synchronous SQLAlchemy
(via SYNC_DATABASE_URL) because Celery workers are synchronous by default.
"""
import logging
from datetime import datetime, timedelta, timezone
from workers.celery_app import celery_app
from core.config import settings

# Sync SQLAlchemy session for Celery tasks
from sqlalchemy import create_engine, select, func
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger(__name__)

# ── Sync DB Engine (for Celery workers) ───────────────
_sync_engine = create_engine(settings.SYNC_DATABASE_URL, pool_pre_ping=True)
SyncSession = sessionmaker(bind=_sync_engine, expire_on_commit=False)


# ── Helper: get a sync DB session ─────────────────────
def get_sync_db():
    db = SyncSession()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# ══════════════════════════════════════════════════════
#  TASK 1: Daily Morning Reminder
# ══════════════════════════════════════════════════════
@celery_app.task(
    name="workers.tasks.send_morning_reminder",
    bind=True,
    max_retries=3,
    default_retry_delay=60,
)
def send_morning_reminder(self):
    """
    Notify all active users to do their morning mood check-in
    if they haven't done one today.
    Runs daily at 7:00 AM UTC.
    """
    from models.user import User
    from models.task import MoodLog

    today = datetime.now(timezone.utc).date()
    sent = 0

    db = SyncSession()
    try:
        # Get all active users
        users = db.execute(
            select(User).where(User.is_active == True)  # noqa: E712
        ).scalars().all()

        for user in users:
            # Check if they already checked in today
            checked_in = db.execute(
                select(MoodLog).where(
                    MoodLog.user_id == user.id,
                    func.date(MoodLog.logged_at) == today,
                )
            ).scalar_one_or_none()

            if not checked_in:
                # TODO: integrate with FCM/push notification service
                # For now, log the intent
                logger.info(
                    f"[Morning Reminder] User {user.id} ({user.email}) "
                    f"hasn't checked in today — reminder triggered."
                )
                sent += 1

        logger.info(f"[Morning Reminder] Sent reminders to {sent} users.")
        return {"sent": sent, "date": str(today)}

    except Exception as exc:
        logger.error(f"[Morning Reminder] Failed: {exc}")
        raise self.retry(exc=exc)
    finally:
        db.close()


# ══════════════════════════════════════════════════════
#  TASK 2: Task Deadline Nudge
# ══════════════════════════════════════════════════════
@celery_app.task(
    name="workers.tasks.send_deadline_nudges",
    bind=True,
    max_retries=3,
    default_retry_delay=60,
)
def send_deadline_nudges(self):
    """
    Find all pending tasks due within the next 24 hours and
    nudge the respective users. Runs daily at 9:00 AM UTC.
    """
    from models.task import Task, TaskStatus

    now = datetime.now(timezone.utc)
    window_end = now + timedelta(hours=24)
    nudged = 0

    db = SyncSession()
    try:
        # Tasks due within next 24h that are still pending
        due_tasks = db.execute(
            select(Task).where(
                Task.status == TaskStatus.pending,
                Task.deadline >= now,
                Task.deadline <= window_end,
            )
        ).scalars().all()

        for task in due_tasks:
            logger.info(
                f"[Deadline Nudge] Task '{task.title}' (id={task.id}) "
                f"due at {task.deadline} — nudging user {task.user_id}."
            )
            # TODO: Send push notification via FCM
            nudged += 1

        logger.info(f"[Deadline Nudge] Nudged {nudged} tasks.")
        return {"nudged": nudged}

    except Exception as exc:
        logger.error(f"[Deadline Nudge] Failed: {exc}")
        raise self.retry(exc=exc)
    finally:
        db.close()


# ══════════════════════════════════════════════════════
#  TASK 3: Weekly Mood Summary
# ══════════════════════════════════════════════════════
@celery_app.task(
    name="workers.tasks.send_weekly_mood_summary",
    bind=True,
    max_retries=3,
    default_retry_delay=60,
)
def send_weekly_mood_summary(self):
    """
    Compute a weekly mood summary for every active user:
    - Average mood score over the past 7 days
    - Number of check-ins
    - Most frequent mood
    Runs every Monday at 8:00 AM UTC.
    """
    from models.user import User
    from models.task import MoodLog

    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    summaries = []

    db = SyncSession()
    try:
        users = db.execute(
            select(User).where(User.is_active == True)  # noqa: E712
        ).scalars().all()

        for user in users:
            logs = db.execute(
                select(MoodLog).where(
                    MoodLog.user_id == user.id,
                    MoodLog.logged_at >= week_ago,
                )
            ).scalars().all()

            if not logs:
                continue

            avg_score = round(sum(l.mood_score for l in logs) / len(logs), 1)
            mood_counts: dict = {}
            for log in logs:
                mood_counts[log.mood] = mood_counts.get(log.mood, 0) + 1
            top_mood = max(mood_counts, key=mood_counts.get)

            summary = {
                "user_id": user.id,
                "email": user.email,
                "checkins": len(logs),
                "avg_score": avg_score,
                "top_mood": top_mood,
            }
            summaries.append(summary)

            logger.info(
                f"[Weekly Summary] User {user.id}: "
                f"{len(logs)} check-ins, avg score {avg_score}, top mood '{top_mood}'"
            )
            # TODO: Send summary via push notification / email

        return {"processed_users": len(summaries), "summaries": summaries}

    except Exception as exc:
        logger.error(f"[Weekly Summary] Failed: {exc}")
        raise self.retry(exc=exc)
    finally:
        db.close()


# ══════════════════════════════════════════════════════
#  UTILITY: Manual task trigger (for testing)
# ══════════════════════════════════════════════════════
@celery_app.task(name="workers.tasks.ping")
def ping():
    """Simple ping task to verify the worker is alive."""
    return {"status": "pong", "timestamp": datetime.now(timezone.utc).isoformat()}
