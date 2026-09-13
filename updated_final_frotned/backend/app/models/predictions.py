import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.projects import RiskLevelEnum


class ModelVersion(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "model_versions"

    version_tag: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    model_name: Mapped[str] = mapped_column(String(100), default="XGBoost-DelayPredictor-v1", nullable=False)
    target_definition: Mapped[str] = mapped_column(String(100), default="delayed_gt_90_days", nullable=False)
    feature_count: Mapped[int] = mapped_column(Integer, default=18, nullable=False)
    threshold: Mapped[float] = mapped_column(Float, default=0.50, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Prediction(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "predictions"
    __table_args__ = (
        CheckConstraint("delay_probability >= 0.0 AND delay_probability <= 1.0", name="ck_pred_prob_range"),
    )

    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    model_version_tag: Mapped[str] = mapped_column(String(50), default="1.0.0", nullable=False)

    delay_probability: Mapped[float] = mapped_column(Float, nullable=False)
    risk_level: Mapped[RiskLevelEnum] = mapped_column(
        Enum(RiskLevelEnum, native_enum=False, length=20),
        nullable=False,
    )

    is_simulated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    prediction_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    input_features_json: Mapped[str | None] = mapped_column(Text, nullable=True)

    project = relationship("Project", back_populates="predictions")
    factors = relationship("PredictionFactor", back_populates="prediction", cascade="all, delete-orphan")


class PredictionFactor(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "prediction_factors"

    prediction_id: Mapped[str] = mapped_column(String(36), ForeignKey("predictions.id", ondelete="CASCADE"), nullable=False, index=True)
    feature_name: Mapped[str] = mapped_column(String(100), nullable=False)
    impact_value: Mapped[float] = mapped_column(Float, nullable=False)  # Normalized SHAP or attribution value
    direction: Mapped[str] = mapped_column(String(30), nullable=False)  # "increases_risk" or "decreases_risk"
    feature_value: Mapped[float | None] = mapped_column(Float, nullable=True)

    prediction = relationship("Prediction", back_populates="factors")
