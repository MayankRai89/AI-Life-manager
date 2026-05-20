import redis.asyncio as aioredis
from core.config import settings
import json
from typing import Any, Optional

redis_client: aioredis.Redis = None


async def init_redis():
    global redis_client
    redis_client = aioredis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
    )
    await redis_client.ping()
    print("✅ Redis connected")


async def close_redis():
    if redis_client:
        await redis_client.close()


# ── Helper Functions ──────────────────────────────────

async def cache_set(key: str, value: Any, ttl: int = 3600):
    """Store any JSON-serializable value in Redis."""
    await redis_client.setex(key, ttl, json.dumps(value))


async def cache_get(key: str) -> Optional[Any]:
    """Retrieve cached value or None."""
    data = await redis_client.get(key)
    return json.loads(data) if data else None


async def cache_delete(key: str):
    await redis_client.delete(key)


async def cache_delete_pattern(pattern: str):
    """Delete all keys matching a pattern e.g. 'user:123:*'"""
    keys = await redis_client.keys(pattern)
    if keys:
        await redis_client.delete(*keys)
