from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from core.database import get_db
from core.security import get_current_user
from core.redis_client import cache_set, cache_get, cache_delete_pattern
from models.user import User
from models.task import Task
from schemas.schemas import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


def _task_cache_key(user_id: int) -> str:
    return f"tasks:user:{user_id}"


@router.post("/", response_model=TaskResponse, status_code=201)
async def create_task(
    data: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = Task(user_id=current_user.id, **data.model_dump())
    db.add(task)
    await db.flush()
    await db.refresh(task)
    await cache_delete_pattern(f"tasks:user:{current_user.id}*")  # invalidate cache
    return task


@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    status: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cache_key = f"tasks:user:{current_user.id}:{status or 'all'}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    query = select(Task).where(Task.user_id == current_user.id)
    if status:
        query = query.where(Task.status == status)
    query = query.order_by(Task.priority_score.desc())

    result = await db.execute(query)
    tasks = result.scalars().all()

    tasks_data = [TaskResponse.model_validate(t).model_dump(mode="json") for t in tasks]
    await cache_set(cache_key, tasks_data, ttl=300)   # cache 5 mins
    return tasks_data


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    data: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(task, field, value)

    await db.flush()
    await db.refresh(task)
    await cache_delete_pattern(f"tasks:user:{current_user.id}*")
    return task


@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await db.delete(task)
    await cache_delete_pattern(f"tasks:user:{current_user.id}*")
