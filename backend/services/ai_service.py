"""
AI Service — Core intelligence layer
Features:
  1. Day Planner  → Reorders tasks based on mood + energy
  2. Task Scorer  → Assigns AI priority score to each task
  3. Health Nudge → Generates personalized health reminders
"""

# pyrefly: ignore [missing-import]
from langchain_openai import ChatOpenAI
# pyrefly: ignore [missing-import]
from langchain.prompts import ChatPromptTemplate
# pyrefly: ignore [missing-import]
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from core.config import settings
import json


# ── LLM Instance ──────────────────────────────────────
def get_llm(temperature: float = 0.7) -> ChatOpenAI:
    return ChatOpenAI(
        model=settings.OPENAI_MODEL,
        temperature=temperature,
        openai_api_key=settings.OPENAI_API_KEY,
    )


# ══════════════════════════════════════════════════════
#  FEATURE 1: DAY PLANNER
# ══════════════════════════════════════════════════════

DAY_PLANNER_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are an empathetic AI life coach. Your job is to create a compassionate, 
realistic day plan based on how the user feels right now.

Rules:
- If mood score is low (1-4): Suggest gentle, low-energy tasks. Be encouraging.
- If mood score is medium (5-7): Balance productive tasks with breaks.
- If mood score is high (8-10): Schedule challenging tasks; momentum is high.
- Always include time for meals, short walks, and rest.
- Keep the plan realistic for a single day.
- Respond in a warm, human tone — not robotic.

Return a structured day plan in plain text with time blocks."""),
    
    ("human", """Current mood: {mood} (score: {mood_score}/10)
User note: {note}

Pending tasks (JSON):
{tasks_json}

Create a personalized day plan for today.""")
])


async def generate_day_plan(
    mood: str,
    mood_score: int,
    note: Optional[str],
    tasks: list[dict],
) -> str:
    """Generate an AI-powered day plan based on user's current mood."""
    llm = get_llm(temperature=0.8)
    chain = DAY_PLANNER_PROMPT | llm

    result = await chain.ainvoke({
        "mood": mood,
        "mood_score": mood_score,
        "note": note or "No additional notes",
        "tasks_json": json.dumps(tasks, indent=2, default=str),
    })

    return result.content


# ══════════════════════════════════════════════════════
#  FEATURE 2: SMART TASK PRIORITIZATION
# ══════════════════════════════════════════════════════

TASK_PRIORITY_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a productivity AI that scores tasks intelligently.
Score each task from 0.0 to 1.0 based on:
  - Deadline urgency (closer deadline = higher score)
  - Energy alignment with user's current mood
  - Task importance (inferred from description)

Return ONLY valid JSON array like:
[
  {{"task_id": 1, "priority_score": 0.85, "ai_notes": "Deadline tomorrow + matches your current energy"}},
  {{"task_id": 2, "priority_score": 0.3, "ai_notes": "No deadline, low energy required — save for later"}}
]

No extra text. Just the JSON array."""),

    ("human", """User's mood: {mood} (score: {mood_score}/10)
Current time: {current_time}

Tasks to prioritize:
{tasks_json}""")
])


async def prioritize_tasks(
    mood: str,
    mood_score: int,
    tasks: list[dict],
) -> list[dict]:
    """Score and prioritize tasks based on mood and deadlines."""
    llm = get_llm(temperature=0.2)   # low temp for consistent scoring
    chain = TASK_PRIORITY_PROMPT | llm

    result = await chain.ainvoke({
        "mood": mood,
        "mood_score": mood_score,
        "current_time": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "tasks_json": json.dumps(tasks, indent=2, default=str),
    })

    # Safely parse JSON
    try:
        raw = result.content.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)
    except json.JSONDecodeError:
        return []


# ══════════════════════════════════════════════════════
#  FEATURE 3: HEALTH NUDGE GENERATOR
# ══════════════════════════════════════════════════════

HEALTH_NUDGE_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a caring wellness companion. Generate 3 gentle, 
actionable health nudges for the user based on their mood and time of day.

Examples:
- "You've been working for 90 mins — stand up and stretch for 2 minutes 🧘"
- "It's past 1 PM — have you had lunch yet? Fuel that brain! 🥗"
- "Feeling anxious? Try 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s 🌬️"

Keep nudges short (1 sentence each), warm, and non-judgmental.
Return ONLY a JSON array of 3 strings. No extra text."""),

    ("human", """Mood: {mood} (score: {mood_score}/10)
Time of day: {time_of_day}
User note: {note}""")
])


async def generate_health_nudges(
    mood: str,
    mood_score: int,
    note: Optional[str] = None,
) -> list[str]:
    """Generate personalized health reminders."""
    hour = datetime.now().hour
    if hour < 12:
        time_of_day = "morning"
    elif hour < 17:
        time_of_day = "afternoon"
    else:
        time_of_day = "evening"

    llm = get_llm(temperature=0.9)
    chain = HEALTH_NUDGE_PROMPT | llm

    result = await chain.ainvoke({
        "mood": mood,
        "mood_score": mood_score,
        "time_of_day": time_of_day,
        "note": note or "No note",
    })

    try:
        raw = result.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)
    except Exception:
        return [
            "Take a moment to breathe deeply 🌬️",
            "Drink a glass of water 💧",
            "Stand up and stretch for 2 minutes 🧘",
        ]
