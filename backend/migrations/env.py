"""
Alembic environment configuration for AI Life Manager.

Uses the SYNC_DATABASE_URL (psycopg2) for migrations — separate from the
asyncpg URL used at runtime. Alembic runs migrations synchronously.

Usage:
    alembic revision --autogenerate -m "describe change"
    alembic upgrade head
    alembic downgrade -1
"""
import os
import sys
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# ── Make sure the backend root is on sys.path ─────────
# (so imports like `from core.config import settings` work)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ── Import app config and all models ─────────────────
from core.config import settings  # noqa: E402

# Import all models here so SQLAlchemy registers them in Base.metadata
from core.database import Base          # noqa: E402, F401
from models.user import User            # noqa: E402, F401
from models.task import Task, MoodLog  # noqa: E402, F401


# ── Alembic Config ────────────────────────────────────
config = context.config

# Override sqlalchemy.url with the SYNC URL from environment
config.set_main_option("sqlalchemy.url", settings.SYNC_DATABASE_URL)

# Set up Python logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Target metadata for autogenerate
target_metadata = Base.metadata


# ── Offline mode (generate SQL script, no live DB) ───
def run_migrations_offline() -> None:
    """Run migrations without a DB connection — outputs raw SQL."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,          # detect column type changes
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


# ── Online mode (apply directly to DB) ───────────────
def run_migrations_online() -> None:
    """Run migrations with a live DB connection."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,    # no pooling for migration runs
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
