from __future__ import annotations
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime,
    Text, ForeignKey, Enum, Float
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base
import enum


# ── Enums ─────────────────────────────────────────────
class TaskStatus(str, enum.Enum):
    pending    = "pending"
    in_progress = "in_progress"
    done       = "done"
    skipped    = "skipped"

class EnergyLevel(str, enum.Enum):
    low    = "low"
    medium = "medium"
    high   = "high"

class MoodType(str, enum.Enum):
    great   = "great"
    good    = "good"
    neutral = "neutral"
    tired   = "tired"
    anxious = "anxious"
    low     = "low"


# ── Task Model ────────────────────────────────────────
class Task(Base):
    __tablename__ = "tasks"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    title           = Column(String(255), nullable=False)
    description     = Column(Text, nullable=True)
    deadline        = Column(DateTime(timezone=True), nullable=True)
    status          = Column(Enum(TaskStatus), default=TaskStatus.pending)
    energy_required = Column(Enum(EnergyLevel), default=EnergyLevel.medium)
    priority_score  = Column(Float, default=0.5)   # 0.0 → 1.0 (AI-assigned)
    ai_notes        = Column(Text, nullable=True)  # AI reasoning for priority
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="tasks")


# ── MoodLog Model ─────────────────────────────────────
class MoodLog(Base):
    __tablename__ = "mood_logs"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    mood        = Column(Enum(MoodType), nullable=False)
    mood_score  = Column(Integer, nullable=False)       # 1–10 slider value
    note        = Column(Text, nullable=True)           # optional user note
    ai_plan     = Column(Text, nullable=True)           # AI-generated day plan
    logged_at   = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="mood_logs")
