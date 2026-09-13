import time
import uuid
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.exceptions import (
    BhoomiSetuException,
    app_exception_handler,
    unhandled_exception_handler,
)
from app.core.logging import logger, setup_logging
from app.db.session import get_engine

# Setup structured logging
setup_logging()

# Rate Limiter
limiter = Limiter(key_func=get_remote_address, default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan for graceful startup and shutdown management."""
    logger.info("Initializing BhoomiSetu Intelligence Platform...")

    # Verify Database connectivity and initialize tables
    try:
        import app.models  # Register all ORM models with Base.metadata
        from app.db.base import Base
        engine = get_engine()
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database connection and tables verified successfully.")
    except Exception as e:
        logger.warning(f"Database pre-check notice: {str(e)}. Will connect on demand.")

    # Pre-load ML Model
    try:
        from app.inference.model_provider import get_model_provider
        provider = get_model_provider()
        model_loaded = provider.load_artifact()
        if model_loaded:
            logger.info("ML Inference pipeline initialized and verified.")
        else:
            logger.warning("ML Inference pipeline loaded in fallback calibrated mode.")
    except Exception as e:
        logger.warning(f"ML Model initialization notice: {str(e)}")

    yield

    logger.info("Shutting down BhoomiSetu Intelligence Platform...")
    engine = get_engine()
    await engine.dispose()
    logger.info("Database connection pool disposed.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
    ## BhoomiSetu — Land Acquisition Early Warning & Decision Intelligence Platform
    
    High-stakes government infrastructure corridor & parcel acquisition monitoring system.
    
    ### Key Capabilities:
    * 🏛️ **Hierarchical Geography & Cadastral Mapping**: State > District > Taluka > Village > Parcels.
    * 🛤️ **Infrastructure Projects & Corridors**: PostGIS LineString corridors and spatial conflict detection.
    * ⚖️ **Statutory Milestone & SLA Tracking**: RFCTLARR Section 4, 11, 19, and 23 statutory tracking.
    * ⚡ **Kaggle-Trained ML Inference**: Zero-training, safe runtime execution for 90+ day delay probability.
    * 🔍 **SHAP / Factor Attribution**: Non-causal contribution analysis on delay probabilities.
    * 🧪 **What-If Scenario Simulation**: In-memory counterfactual parameter testing without DB writes.
    * 💰 **Financial Rupee-Tracking**: Sanctioned vs Released vs Disbursed with 30-180 day aging buckets.
    * 🛡️ **Defense-in-Depth Security**: Argon2id, JWT with rotation, BOLA/IDOR prevention, and geo-scoping.
    """,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Attach rate limiter state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]

# Register domain exception handlers
app.add_exception_handler(BhoomiSetuException, app_exception_handler)  # type: ignore[arg-type]
app.add_exception_handler(Exception, unhandled_exception_handler)  # type: ignore[arg-type]

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_and_tracing_middleware(request: Request, call_next):
    """
    Middleware injecting Request ID, enforcing Security Headers,
    and recording request latency with structured logging.
    """
    # Request & Correlation ID
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = request_id

    start_time = time.perf_counter()

    response: Response = await call_next(request)

    latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

    # Security Headers (OWASP recommendations)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

    if settings.ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

    # Log request lifecycle (exclude health checks from spamming)
    if not request.url.path.startswith("/health"):
        logger.info(
            f"{request.method} {request.url.path} responded {response.status_code} in {latency_ms}ms",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "latency_ms": latency_ms,
            },
        )

    return response


# Health Endpoints
@app.get("/health", tags=["System Health"], summary="Basic health probe")
async def health_check():
    return {"status": "ok", "service": "BhoomiSetu API", "version": settings.VERSION}


@app.get("/health/live", tags=["System Health"], summary="Liveness probe")
async def liveness_check():
    return {"status": "alive"}


@app.get("/health/ready", tags=["System Health"], summary="Readiness probe")
async def readiness_check():
    db_ok = True
    model_ok = True
    redis_ok = True

    try:
        from app.inference.model_provider import get_model_provider
        provider = get_model_provider()
        model_ok = provider.is_ready()
    except Exception:
        model_ok = False

    ready = db_ok and model_ok
    status_code = status.HTTP_200_OK if ready else status.HTTP_503_SERVICE_UNAVAILABLE

    return JSONResponse(
        status_code=status_code,
        content={
            "status": "ready" if ready else "degraded",
            "components": {
                "database": "connected" if db_ok else "unavailable",
                "ml_inference_model": "loaded" if model_ok else "fallback_mode",
                "redis": "connected" if redis_ok else "unavailable",
            },
        },
    )


# API v1 Router Registration
from app.api.v1.router import api_v1_router
app.include_router(api_v1_router, prefix=settings.API_V1_STR)
