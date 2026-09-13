import enum
from datetime import date
from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ProjectTypeEnum(str, enum.Enum):
    HIGH_SPEED_RAIL = "High-Speed Rail"
    EXPRESSWAY = "Expressway"
    FREIGHT_CORRIDOR = "Freight Corridor"
    METRO_RAIL = "Metro Rail"
    INDUSTRIAL_CORRIDOR = "Industrial Corridor"
    RENEWABLE_PARK = "Renewable Energy Park"


class RiskLevelEnum(str, enum.Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"
    CRITICAL = "Critical"


class StageStatusEnum(str, enum.Enum):
    COMPLETE = "complete"
    CURRENT = "current"
    PENDING = "pending"


class Project(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "projects"
    __table_args__ = (
        CheckConstraint("budget_crores >= 0", name="ck_project_budget_non_negative"),
        CheckConstraint("land_acquired_pct >= 0 AND land_acquired_pct <= 100", name="ck_land_acquired_range"),
        CheckConstraint("land_pending_pct >= 0 AND land_pending_pct <= 100", name="ck_land_pending_range"),
        CheckConstraint("current_risk_score >= 0 AND current_risk_score <= 100", name="ck_risk_score_range"),
        CheckConstraint("delay_probability >= 0.0 AND delay_probability <= 1.0", name="ck_delay_prob_range"),
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    project_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    state_id: Mapped[str] = mapped_column(String(36), ForeignKey("states.id", ondelete="RESTRICT"), nullable=False, index=True)
    district_id: Mapped[str] = mapped_column(String(36), ForeignKey("districts.id", ondelete="RESTRICT"), nullable=False, index=True)

    project_type: Mapped[ProjectTypeEnum] = mapped_column(
        Enum(ProjectTypeEnum, native_enum=False, length=50),
        default=ProjectTypeEnum.EXPRESSWAY,
        nullable=False,
    )
    phase: Mapped[str] = mapped_column(String(100), default="Award & compensation", nullable=False)

    budget_crores: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    expenditure_crores: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    target_completion_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # ML Inference & Risk Outputs
    current_risk_level: Mapped[RiskLevelEnum] = mapped_column(
        Enum(RiskLevelEnum, native_enum=False, length=20),
        default=RiskLevelEnum.LOW,
        nullable=False,
        index=True,
    )
    current_risk_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    delay_probability: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    predicted_delay_window: Mapped[str] = mapped_column(String(50), default="On track", nullable=False)
    model_confidence: Mapped[float] = mapped_column(Float, default=0.85, nullable=False)

    # Physical Execution Indicators
    land_acquired_pct: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    land_pending_pct: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    row_available_pct: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    possession_pct: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    affected_families_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    families_relocated_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Geospatial alignment
    corridor_alignment_geojson: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    state = relationship("State", back_populates="projects")
    district = relationship("District", back_populates="projects")
    lifecycle_stages = relationship("AcquisitionStage", back_populates="project", cascade="all, delete-orphan", order_by="AcquisitionStage.stage_order")
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")
    compensation_record = relationship("CompensationRecord", back_populates="project", uselist=False, cascade="all, delete-orphan")
    legal_cases = relationship("LegalCase", back_populates="project", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="project", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="project", cascade="all, delete-orphan")
    interventions = relationship("Intervention", back_populates="project", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="project", cascade="all, delete-orphan")


class AcquisitionStage(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "acquisition_stages"

    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    stage_name: Mapped[str] = mapped_column(String(100), nullable=False)
    stage_order: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[StageStatusEnum] = mapped_column(
        Enum(StageStatusEnum, native_enum=False, length=20),
        default=StageStatusEnum.PENDING,
        nullable=False,
    )
    duration: Mapped[str] = mapped_column(String(30), default="—", nullable=False)
    expected_duration: Mapped[str] = mapped_column(String(30), default="60d", nullable=False)
    delay_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    responsible_authority: Mapped[str] = mapped_column(String(100), default="District Collector", nullable=False)
    primary_blocker: Mapped[str | None] = mapped_column(String(255), nullable=True)

    project = relationship("Project", back_populates="lifecycle_stages")


class Milestone(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "milestones"

    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    statutory_section: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    target_date: Mapped[date] = mapped_column(Date, nullable=False)
    achieved_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_statutory_sla_breached: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    project = relationship("Project", back_populates="milestones")


class ProjectCorridor(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "project_corridors"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    route_description: Mapped[str] = mapped_column(String(255), nullable=False)
    risk_level: Mapped[RiskLevelEnum] = mapped_column(
        Enum(RiskLevelEnum, native_enum=False, length=20),
        default=RiskLevelEnum.LOW,
        nullable=False,
    )
    risk_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    projects_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    exposed_value_crores: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    lead_signal: Mapped[str] = mapped_column(String(255), nullable=False)
    nodes_json: Mapped[str] = mapped_column(Text, nullable=False)  # JSON array of nodes with x, y coords
