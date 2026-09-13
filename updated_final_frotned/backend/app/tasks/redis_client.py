import json
from typing import Any, Optional
import redis.asyncio as aioredis
from app.core.config import settings
from app.core.logging import logger

_redis_pool: Optional[aioredis.ConnectionPool] = None


def get_redis_pool() -> Optional[aioredis.ConnectionPool]:
    global _redis_pool
    if not settings.REDIS_ENABLED:
        return None
    if _redis_pool is None:
        try:
            _redis_pool = aioredis.ConnectionPool.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_timeout=2.0,
                socket_connect_timeout=2.0,
            )
        except Exception as e:
            logger.warning(f"Could not initialize Redis pool: {str(e)}")
            _redis_pool = None
    return _redis_pool


async def get_redis_client() -> Optional[aioredis.Redis]:
    pool = get_redis_pool()
    if pool is None:
        return None
    try:
        client = aioredis.Redis(connection_pool=pool)
        return client
    except Exception:
        return None


class CacheService:
    @staticmethod
    async def get(key: str) -> Optional[Any]:
        client = await get_redis_client()
        if not client:
            return None
        try:
            val = await client.get(key)
            return json.loads(val) if val else None
        except Exception as e:
            logger.debug(f"Redis cache get miss/error on key '{key}': {str(e)}")
            return None

    @staticmethod
    async def set(key: str, value: Any, ttl_seconds: int = 300) -> None:
        client = await get_redis_client()
        if not client:
            return
        try:
            val_str = json.dumps(value)
            await client.setex(key, ttl_seconds, val_str)
        except Exception as e:
            logger.debug(f"Redis cache set error on key '{key}': {str(e)}")

    @staticmethod
    async def delete(key: str) -> None:
        client = await get_redis_client()
        if not client:
            return
        try:
            await client.delete(key)
        except Exception:
            pass
