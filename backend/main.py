from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import firebase_admin
from firebase_admin import credentials
import os

from core.config import settings
from core.database import engine, Base
from core.redis_client import init_redis, close_redis

# Import models so SQLAlchemy registers them before create_all
from models.user import User        # noqa: F401
from models.task import Task, MoodLog  # noqa: F401

# Import routers
from routers.auth import router as auth_router
from routers.tasks import router as tasks_router
from routers.ai_router import router as ai_router
from routers.moods import router as moods_router


# ── Lifespan (startup / shutdown) ─────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting AI Life Manager...")

    if os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
        try:
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
            print("🔥 Firebase initialized successfully")
        except Exception as e:
            print(f"⚠️ Failed to initialize Firebase: {e}")
    else:
        print(f"⚠️ Firebase credentials not found at {settings.FIREBASE_CREDENTIALS_PATH}")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Database tables created")
    await init_redis()
    yield
    # Shutdown
    await close_redis()
    await engine.dispose()
    print("👋 Server shut down cleanly")


# ── App Instance ──────────────────────────────────────
app = FastAPI(
    title="AI Life Manager API",
    description="Backend for an AI-powered personal life management app",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────
app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(ai_router)
app.include_router(moods_router)


# ── Health Check ──────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "env": settings.APP_ENV,
        "model": settings.OPENAI_MODEL,
    }
