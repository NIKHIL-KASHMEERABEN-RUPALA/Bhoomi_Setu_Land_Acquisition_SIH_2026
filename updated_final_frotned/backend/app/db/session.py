import socket
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from app.core.config import settings
from app.core.logging import logger

import ssl
from urllib.parse import urlparse

_engine: AsyncEngine | None = None
_sessionmaker: async_sessionmaker[AsyncSession] | None = None


def get_postgres_host_port() -> tuple[str, int]:
    """Extracts target host and port from settings, prioritizing DATABASE_URL."""
    if settings.DATABASE_URL:
        try:
            parsed = urlparse(settings.DATABASE_URL)
            host = parsed.hostname or settings.POSTGRES_SERVER
            port = parsed.port or 5432
            return host, port
        except Exception:
            pass
    return settings.POSTGRES_SERVER, settings.POSTGRES_PORT


def is_postgres_reachable(host: str, port: int, timeout: float | None = None) -> bool:
    """Checks if PostgreSQL server is accepting connections with dynamic timeout."""
    if timeout is None:
        timeout = 1.5 if host in ("localhost", "127.0.0.1", "0.0.0.0") else 6.0
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False


def get_db_url() -> str:
    host, port = get_postgres_host_port()
    reachable = is_postgres_reachable(host, port)
    if reachable or not settings.USE_SQLITE_FALLBACK:
        return settings.SQLALCHEMY_DATABASE_URI
    return settings.SQLITE_DATABASE_URL


def get_engine() -> AsyncEngine:
    global _engine
    if _engine is None:
        host, port = get_postgres_host_port()
        reachable = is_postgres_reachable(host, port)
        db_url = get_db_url()
        connect_args = {}
        engine_kwargs = {
            "echo": settings.DB_ECHO,
            "future": True,
            "pool_pre_ping": True,
        }

        if reachable or not settings.USE_SQLITE_FALLBACK:
            logger.info(f"Connecting to PostgreSQL at {host}:{port}")
            # Supabase PgBouncer/Supavisor transaction poolers require statement_cache_size=0
            connect_args["statement_cache_size"] = 0
            # Remote cloud hosts like Supabase require SSL for asyncpg
            if host not in ("localhost", "127.0.0.1", "0.0.0.0"):
                ssl_ctx = ssl.create_default_context()
                ssl_ctx.check_hostname = False
                ssl_ctx.verify_mode = ssl.CERT_NONE
                connect_args["ssl"] = ssl_ctx

            engine_kwargs["pool_size"] = settings.DB_POOL_SIZE
            engine_kwargs["max_overflow"] = settings.DB_MAX_OVERFLOW
        else:
            logger.warning(
                f"PostgreSQL not detected on {host}:{port}. "
                f"Automatically falling back to Embedded Async SQLite for standalone execution."
            )
            connect_args = {"check_same_thread": False}

        engine_kwargs["connect_args"] = connect_args
        _engine = create_async_engine(db_url, **engine_kwargs)
    return _engine


def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    global _sessionmaker
    if _sessionmaker is None:
        engine = get_engine()
        _sessionmaker = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
    return _sessionmaker


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency yielding an async transactional database session.
    """
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
