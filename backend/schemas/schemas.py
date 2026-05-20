from __future__ import annotations
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from models.task import TaskStatus, EnergyLevel, MoodType


# ══════════════════════════════════════════════════════
#  AUTH SCHEMAS
# ══════════════════════════════════════════════════════
class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ══════════════════════════════════════════════════════
#  TASK SCHEMAS
# ══════════════════════════════════════════════════════
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    energy_required: EnergyLevel = EnergyLevel.medium

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    status: Optional[TaskStatus] = None
    energy_required: Optional[EnergyLevel] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    deadline: Optional[datetime]
    status: TaskStatus
    energy_required: EnergyLevel
    priority_score: float
    ai_notes: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ══════════════════════════════════════════════════════
#  MOOD SCHEMAS
# ══════════════════════════════════════════════════════
class MoodLogCreate(BaseModel):
    mood: MoodType
    mood_score: int = Field(..., ge=1, le=10)
    note: Optional[str] = None

class MoodLogResponse(BaseModel):
    id: int
    mood: MoodType
    mood_score: int
    note: Optional[str]
    ai_plan: Optional[str]
    logged_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MoodStatsResponse(BaseModel):
    total_checkins: int
    average_score: float
    streak_days: int
    most_frequent_mood: Optional[MoodType]


# ══════════════════════════════════════════════════════
#  AI SCHEMAS
# ══════════════════════════════════════════════════════
class DayPlanRequest(BaseModel):
    mood: MoodType
    mood_score: int = Field(..., ge=1, le=10)
    note: Optional[str] = None

class DayPlanResponse(BaseModel):
    plan: str
    prioritized_tasks: List[TaskResponse]
    health_nudges: List[str]

class TaskPriorityResponse(BaseModel):
    task_id: int
    priority_score: float
    ai_notes: str
