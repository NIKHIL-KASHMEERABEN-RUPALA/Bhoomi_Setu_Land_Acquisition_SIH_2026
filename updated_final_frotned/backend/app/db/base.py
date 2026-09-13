import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, MetaData, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# Standard naming convention for foreign keys and constraints
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=convention)

    def __repr__(self) -> str:
        attrs = ", ".join(
            f"{col}={getattr(self, col)!r}"
            for col in self.__table__.columns.keys()[:3]
        )
        return f"<{self.__class__.__name__}({attrs})>"


class UUIDPrimaryKeyMixin:
    """UUID Primary Key mixin compatible with PostgreSQL UUID and SQLite String."""
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )


class TimestampMixin:
    """Standard audit timestamps mixin."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class SoftDeleteMixin:
    """Soft delete mixin for administrative records."""
    is_deleted: Mapped[bool] = mapped_column(default=False, nullable=False, index=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
