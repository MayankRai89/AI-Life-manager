from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from typing import List, Optional
from datetime import datetime, date, timezone
from core.database import get_db
from core.security import get_current_user
from models.user import User
from models.task import MoodLog, MoodType
from schemas.schemas import MoodLogCreate, MoodLogResponse, MoodStatsResponse

router = APIRouter(prefix="/api/moods", tags=["Moods"])


# ── POST /api/moods/ ──────────────────────────────────
@router.post("/", response_model=MoodLogResponse, status_code=201)
async def log_mood(
    data: MoodLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Log a mood check-in without generating a full AI day plan.
    Useful for quick mid-day mood updates.
    """
    mood_log = MoodLog(
        user_id=current_user.id,
        mood=data.mood,
        mood_score=data.mood_score,
        note=data.note,
    )
    db.add(mood_log)
    await db.flush()
    await db.refresh(mood_log)
    return mood_log


# ── GET /api/moods/ ───────────────────────────────────
@router.get("/", response_model=List[MoodLogResponse])
async def get_mood_history(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Paginated mood log history for the current user, newest first.
    """
    result = await db.execute(
        select(MoodLog)
        .where(MoodLog.user_id == current_user.id)
        .order_by(MoodLog.logged_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return result.scalars().all()


# ── GET /api/moods/today ──────────────────────────────
@router.get("/today", response_model=Optional[MoodLogResponse])
async def get_today_mood(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns today's most recent mood log, or null if not checked in yet.
    """
    today = date.today()
    result = await db.execute(
        select(MoodLog)
        .where(
            MoodLog.user_id == current_user.id,
            func.date(MoodLog.logged_at) == today,
        )
        .order_by(MoodLog.logged_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


# ── GET /api/moods/stats ──────────────────────────────
@router.get("/stats", response_model=MoodStatsResponse)
async def get_mood_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Aggregate mood statistics:
    - average score over all time
    - check-in streak (consecutive days)
    - most frequent mood
    - total check-ins
    """
    # Total count + average score
    agg_result = await db.execute(
        select(
            func.count(MoodLog.id).label("total"),
            func.avg(MoodLog.mood_score).label("avg_score"),
        ).where(MoodLog.user_id == current_user.id)
    )
    agg = agg_result.one()
    total_checkins = agg.total or 0
    avg_score = round(float(agg.avg_score), 1) if agg.avg_score else 0.0

    # Most frequent mood
    freq_result = await db.execute(
        select(MoodLog.mood, func.count(MoodLog.mood).label("cnt"))
        .where(MoodLog.user_id == current_user.id)
        .group_by(MoodLog.mood)
        .order_by(func.count(MoodLog.mood).desc())
        .limit(1)
    )
    freq_row = freq_result.one_or_none()
    most_frequent_mood = freq_row.mood if freq_row else None

    # Streak: consecutive days up to today with at least one check-in
    logs_result = await db.execute(
        select(func.date(MoodLog.logged_at).label("day"))
        .where(MoodLog.user_id == current_user.id)
        .distinct()
        .order_by(func.date(MoodLog.logged_at).desc())
    )
    days = [row.day for row in logs_result]

    streak = 0
    if days:
        today = date.today()
        current_day = today
        for log_day in days:
            if isinstance(log_day, str):
                log_day = date.fromisoformat(log_day)
            if log_day == current_day:
                streak += 1
                current_day = date.fromordinal(current_day.toordinal() - 1)
            else:
                break

    return MoodStatsResponse(
        total_checkins=total_checkins,
        average_score=avg_score,
        streak_days=streak,
        most_frequent_mood=most_frequent_mood,
    )
