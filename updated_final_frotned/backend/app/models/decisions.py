import enum
from datetime import date, datetime, timezone
from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.projects import RiskLevelEnum


class AlertCategoryEnum(str, enum.Enum):
    LEGAL = "Legal"
    COMPENSATION = "Compensation"
    DOCUMENTATION = "Documentation"
    OWNERSHIP = "Ownership"
    R_AND_R = "R&R"


class AlertStatusEnum(str, enum.Enum):
    OPEN = "Open"
    ASSIGNED = "Assigned"
    MONITORING = "Monitoring"
    ACKNOWLEDGED = "Acknowledged"
    RESOLVED = "Resolved"


class InterventionStatusEnum(str, enum.Enum):
    OPEN = "Open"
    IN_PROGRESS = "In progress"
    COMPLETE = "Complete"


class Recommendation(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "recommendations"

    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    category: Mapped[AlertCategoryEnum] = mapped_column(
        Enum(AlertCategoryEnum, native_enum=False, length=30),
        nullable=False,
    )
    priority: Mapped[RiskLevelEnum] = mapped_column(
        Enum(RiskLevelEnum, native_enum=False, length=20),
        default=RiskLevelEnum.HIGH,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    recommended_action: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    project = relationship("Project", back_populates="recommendations")


class Intervention(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "interventions"

    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    owner: Mapped[str] = mapped_column(String(150), nullable=False)
    status: Mapped[InterventionStatusEnum] = mapped_column(
        Enum(InterventionStatusEnum, native_enum=False, length=30),
        default=InterventionStatusEnum.OPEN,
        nullable=False,
    )
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    project = relationship("Project", back_populates="interventions")


class Alert(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "alerts"

    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    category: Mapped[AlertCategoryEnum] = mapped_column(
        Enum(AlertCategoryEnum, native_enum=False, length=30),
        nullable=False,
    )
    severity: Mapped[RiskLevelEnum] = mapped_column(
        Enum(RiskLevelEnum, native_enum=False, length=20),
        default=RiskLevelEnum.HIGH,
        nullable=False,
    )
    primary_cause: Mapped[str] = mapped_column(String(255), nullable=False)
    predicted_delay: Mapped[str] = mapped_column(String(50), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.85, nullable=False)
    recommended_intervention: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[AlertStatusEnum] = mapped_column(
        Enum(AlertStatusEnum, native_enum=False, length=30),
        default=AlertStatusEnum.OPEN,
        nullable=False,
    )

    acknowledged_by: Mapped[str | None] = mapped_column(String(100), nullable=True)
    acknowledged_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    project = relationship("Project", back_populates="alerts")
