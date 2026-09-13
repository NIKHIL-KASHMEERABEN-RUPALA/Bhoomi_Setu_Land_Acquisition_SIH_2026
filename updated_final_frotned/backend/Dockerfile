# ==============================================================================
# BhoomiSetu Backend - Multi-Stage Production Dockerfile (Python 3.13)
# ==============================================================================
FROM python:3.13-slim AS builder

WORKDIR /build

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --prefix=/install -r requirements.txt


# ------------------------------------------------------------------------------
# Runtime Stage
# ------------------------------------------------------------------------------
FROM python:3.13-slim AS runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PORT=8000

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed wheels from builder
COPY --from=builder /install /usr/local

# Create non-root system user for security
RUN groupadd -g 10001 bhoomi && \
    useradd -u 10001 -g bhoomi -s /bin/bash -m bhoomi

# Copy application code and model artifacts
COPY app ./app
COPY model ./model
COPY migrations ./migrations
COPY scripts ./scripts
COPY alembic.ini .

# Set permissions
RUN chown -R bhoomi:bhoomi /app

USER bhoomi

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health/live || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--proxy-headers"]
