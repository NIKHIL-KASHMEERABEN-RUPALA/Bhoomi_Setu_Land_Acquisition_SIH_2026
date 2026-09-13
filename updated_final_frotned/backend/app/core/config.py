import os
import urllib.parse
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env", os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    PROJECT_NAME: str = "BhoomiSetu — Land Acquisition Early Warning & Decision Intelligence Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Security
    SECRET_KEY: str = "bhoomi-setu-super-secret-key-change-in-production-min32chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # Short-lived access token
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7     # Long-lived refresh token
    ALGORITHM: str = "HS256"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "bhoomi_user"
    POSTGRES_PASSWORD: str = "bhoomi_secret"
    POSTGRES_DB: str = "bhoomi_setu_db"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str | None = None
    DB_ECHO: bool = False
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.DATABASE_URL and self.DATABASE_URL.strip():
            url = self.DATABASE_URL.strip().strip("'\"")
            
            # Determine dialect scheme
            if url.startswith("postgresql://"):
                scheme = "postgresql+asyncpg://"
                rest = url[len("postgresql://"):]
            elif url.startswith("postgres://"):
                scheme = "postgresql+asyncpg://"
                rest = url[len("postgres://"):]
            elif url.startswith("postgresql+asyncpg://"):
                scheme = "postgresql+asyncpg://"
                rest = url[len("postgresql+asyncpg://"):]
            else:
                return url

            # Separate query parameters
            base, sep, query = rest.partition("?")

            # Handle percent-encoding for passwords containing special characters (like '@', '!')
            if "@" in base:
                userinfo, at_sep, host_part = base.rpartition("@")
                if ":" in userinfo:
                    username, col_sep, password = userinfo.partition(":")
                    # Ensure password is cleanly percent-encoded
                    clean_pwd = urllib.parse.quote(urllib.parse.unquote(password), safe="")
                    base = f"{username}:{clean_pwd}@{host_part}"

            # Filter out params not supported by asyncpg connect (e.g., pgbouncer, sslmode)
            if query:
                ignored_keys = {"pgbouncer", "sslmode"}
                kept_params = [
                    p for p in query.split("&")
                    if p and p.split("=")[0].strip().lower() not in ignored_keys
                ]
                if kept_params:
                    return f"{scheme}{base}?{'&'.join(kept_params)}"

            return f"{scheme}{base}"
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@"
            f"{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # SQLite fallback for test & standalone environments
    USE_SQLITE_FALLBACK: bool = True
    SQLITE_DATABASE_URL: str = "sqlite+aiosqlite:///./bhoomi_setu.db"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str | None = None
    REDIS_DB: int = 0
    REDIS_ENABLED: bool = True

    @property
    def REDIS_URL(self) -> str:
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    AUTH_RATE_LIMIT_PER_MINUTE: int = 10

    # Model Inference
    MODEL_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "model")
    MODEL_FILENAME: str = "model.joblib"
    FEATURE_SCHEMA_FILENAME: str = "feature_schema.json"
    MODEL_METADATA_FILENAME: str = "model_metadata.json"
    CONFIDENCE_THRESHOLD: float = 0.50

    # External ML Model Microservice
    ML_MODEL_URL: str | None = None
    ML_API_KEY: str | None = None

    # Pagination Defaults
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100


settings = Settings()
