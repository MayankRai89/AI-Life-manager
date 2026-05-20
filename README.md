# AI Life Manager 🧠

> An AI-powered personal assistant that adapts your daily schedule based on how you feel — not just when things are due.

---

## What it does

Most productivity apps treat all tasks equally and ignore the human behind them. AI Life Manager is different. It asks how you're feeling each morning, then uses that context to intelligently reorganize your day, remind you to take care of yourself, and prioritize work in a way that matches your energy.

**Three core features:**

- **Mood-aware day planning** — Tell the app your mood (1–10) and it generates a personalized schedule using GPT-4o. Feeling drained? It front-loads easy tasks. High energy? It schedules deep work.
- **Smart task prioritization** — Every task gets an AI-assigned priority score (0.0–1.0) based on deadline urgency, energy required, and your current state.
- **Gentle health nudges** — Three personalized reminders throughout the day: eat, move, rest. Generated fresh based on time of day and mood.

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend framework | FastAPI (Python 3.12) |
| Database | PostgreSQL 16 via SQLAlchemy (async) |
| Caching | Redis 7 |
| Authentication | JWT (python-jose + bcrypt) |
| AI orchestration | LangChain 0.2 |
| LLM | OpenAI GPT-4o-mini (configurable) |
| Push notifications | Firebase Cloud Messaging |
| Containerization | Docker + Docker Compose |

---

## Project structure

```
backend/
├── main.py                  ← FastAPI app, startup/shutdown lifecycle
├── requirements.txt
├── docker-compose.yml       ← PostgreSQL + Redis + Backend services
├── Dockerfile
├── .env.example             ← Environment variable template
│
├── core/
│   ├── config.py            ← Pydantic settings (reads from .env)
│   ├── database.py          ← Async SQLAlchemy engine + session
│   ├── redis_client.py      ← Redis helpers (cache_set, cache_get)
│   └── security.py          ← JWT creation, verification, user dependency
│
├── models/
│   ├── user.py              ← User table (id, email, password, fcm_token)
│   └── task.py              ← Task table + MoodLog table + enums
│
├── schemas/
│   └── schemas.py           ← Pydantic request/response models
│
├── routers/
│   ├── auth.py              ← POST /register, /login, /refresh, GET /me
│   ├── tasks.py             ← Full CRUD for tasks with Redis caching
│   └── ai_router.py         ← POST /day-plan, /reprioritize, GET /nudges
│
└── services/
    └── ai_service.py        ← LangChain chains for all three AI features
```

---

## Getting started

### Prerequisites

- Python 3.10 or higher
- Docker Desktop (for PostgreSQL and Redis)
- An OpenAI API key — get one at platform.openai.com

### Installation (Windows PowerShell)

```powershell
# 1. Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment variables
Copy-Item .env.example .env
notepad .env
```

Fill in `.env`:
```
OPENAI_API_KEY=sk-your-key-here
SECRET_KEY=any-long-random-string
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/ai_life_manager
SYNC_DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_life_manager
```

```powershell
# 4. Start PostgreSQL and Redis
docker-compose up postgres redis -d

# 5. Run the server
uvicorn main:app --reload
```

Open http://localhost:8000/docs for the interactive API explorer.

---

## API reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Get access + refresh tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user profile |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tasks/` | Create a task |
| GET | `/api/tasks/` | List all tasks (cached 5 min) |
| GET | `/api/tasks/{id}` | Get single task |
| PATCH | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |

### AI features

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/day-plan` | Generate day plan from mood input |
| POST | `/api/ai/reprioritize` | Re-score all pending tasks |
| GET | `/api/ai/nudges` | Get 3 fresh health reminders |

**Example — generate a day plan:**
```json
POST /api/ai/day-plan
{
  "mood": "tired",
  "mood_score": 3,
  "note": "Didn't sleep well, have a big meeting at 3pm"
}
```

**Response:**
```json
{
  "plan": "Good morning. Since you're running on low energy today...",
  "prioritized_tasks": [...],
  "health_nudges": [
    "You mentioned poor sleep — try a 20-min nap before 2pm if possible 💤",
    "Drink a full glass of water before your meeting 💧",
    "After 3pm, a 5-min walk will help you reset 🚶"
  ]
}
```

---

## How the AI works

All three AI features run in parallel using Python's `asyncio.gather()`, so a single `/day-plan` request completes in roughly the time it takes the slowest single feature — not the sum of all three.

```python
plan, priorities, nudges = await asyncio.gather(
    generate_day_plan(mood, mood_score, note, tasks),
    prioritize_tasks(mood, mood_score, tasks),
    generate_health_nudges(mood, mood_score, note),
)
```

Each feature uses a dedicated LangChain prompt chain with different temperature settings:
- Day planner: temperature 0.8 (creative, warm tone)
- Task scorer: temperature 0.2 (consistent, deterministic scoring)
- Health nudges: temperature 0.9 (varied, human-feeling suggestions)

Results are cached in Redis for 30 minutes to avoid redundant API calls.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | Your OpenAI secret key |
| `SECRET_KEY` | Yes | Random string for JWT signing |
| `DATABASE_URL` | Yes | Async PostgreSQL connection string |
| `SYNC_DATABASE_URL` | Yes | Sync PostgreSQL connection (Alembic) |
| `REDIS_URL` | No | Redis URL (default: redis://localhost:6379/0) |
| `OPENAI_MODEL` | No | Model name (default: gpt-4o-mini) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | JWT expiry (default: 60) |

---

## Roadmap

- [ ] Flutter/React Native mobile app
- [ ] Alembic database migrations
- [ ] Celery background tasks for scheduled nudges
- [ ] Apple Health / Google Fit integration
- [ ] Weekly mood trend analysis
- [ ] Multi-language support

---

## License

MIT
