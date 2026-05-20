# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException
# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from core.security import get_current_user
from core.redis_client import cache_set, cache_get
from models.user import User
from models.task import Task, TaskStatus, MoodLog
from schemas.schemas import DayPlanRequest, DayPlanResponse, MoodLogCreate, MoodLogResponse, TaskResponse
from services.ai_service import generate_day_plan, prioritize_tasks, generate_health_nudges
import hashlib, json

router = APIRouter(prefix="/api/ai", tags=["AI"])


# ── POST /api/ai/day-plan ─────────────────────────────
@router.post("/day-plan", response_model=DayPlanResponse)
async def create_day_plan(
    data: DayPlanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Core Feature 1: Generate a personalized day plan based on mood.
    Also runs task prioritization and health nudge generation.
    """
    # Fetch pending tasks
    result = await db.execute(
        select(Task).where(
            Task.user_id == current_user.id,
            Task.status == TaskStatus.pending
        )
    )
    tasks = result.scalars().all()

    tasks_dicts = [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "deadline": str(t.deadline) if t.deadline else None,
            "energy_required": t.energy_required,
        }
        for t in tasks
    ]

    # Cache key based on mood + task ids (avoid repeat AI calls)
    cache_key = f"dayplan:{current_user.id}:{data.mood}:{data.mood_score}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    # Run AI features in parallel
    import asyncio
    plan, priorities, nudges = await asyncio.gather(
        generate_day_plan(data.mood, data.mood_score, data.note, tasks_dicts),
        prioritize_tasks(data.mood, data.mood_score, tasks_dicts),
        generate_health_nudges(data.mood, data.mood_score, data.note),
    )

    # Update task priority scores in DB
    priority_map = {p["task_id"]: p for p in priorities}
    for task in tasks:
        if task.id in priority_map:
            task.priority_score = priority_map[task.id]["priority_score"]
            task.ai_notes = priority_map[task.id]["ai_notes"]

    await db.flush()

    # Re-fetch sorted tasks
    result2 = await db.execute(
        select(Task).where(
            Task.user_id == current_user.id,
            Task.status == TaskStatus.pending
        ).order_by(Task.priority_score.desc())
    )
    sorted_tasks = result2.scalars().all()

    # Save mood log with AI plan
    mood_log = MoodLog(
        user_id=current_user.id,
        mood=data.mood,
        mood_score=data.mood_score,
        note=data.note,
        ai_plan=plan,
    )
    db.add(mood_log)
    await db.flush()

    response = {
        "plan": plan,
        "prioritized_tasks": [TaskResponse.model_validate(t).model_dump(mode="json") for t in sorted_tasks],
        "health_nudges": nudges,
    }

    await cache_set(cache_key, response, ttl=1800)  # cache 30 mins
    return response


# ── POST /api/ai/reprioritize ─────────────────────────
@router.post("/reprioritize")
async def reprioritize_tasks(
    mood: str,
    mood_score: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Re-score all pending tasks based on current mood (no day plan)."""
    result = await db.execute(
        select(Task).where(
            Task.user_id == current_user.id,
            Task.status == TaskStatus.pending,
        )
    )
    tasks = result.scalars().all()
    tasks_dicts = [
        {"id": t.id, "title": t.title, "deadline": str(t.deadline), "energy_required": t.energy_required}
        for t in tasks
    ]

    priorities = await prioritize_tasks(mood, mood_score, tasks_dicts)
    priority_map = {p["task_id"]: p for p in priorities}

    for task in tasks:
        if task.id in priority_map:
            task.priority_score = priority_map[task.id]["priority_score"]
            task.ai_notes = priority_map[task.id]["ai_notes"]

    await db.flush()
    return {"message": f"Reprioritized {len(tasks)} tasks", "priorities": priorities}


# ── GET /api/ai/nudges ────────────────────────────────
@router.get("/nudges")
async def get_nudges(
    mood: str = "neutral",
    mood_score: int = 5,
    current_user: User = Depends(get_current_user),
):
    """Get fresh health nudges anytime."""
    nudges = await generate_health_nudges(mood, mood_score)
    return {"nudges": nudges}
