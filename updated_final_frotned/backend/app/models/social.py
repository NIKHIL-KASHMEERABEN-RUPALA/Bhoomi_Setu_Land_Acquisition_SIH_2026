from datetime import date
from sqlalchemy import Boolean, CheckConstraint, Date, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class RehabilitationResettlement(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "rehabilitation_resettlement"
    __table_args__ = (
        CheckConstraint("sites_ready_pct >= 0 AND sites_ready_pct <= 100", name="ck_rr_sites_range"),
        CheckConstraint("affected_families_count >= 0", name="ck_rr_affected_non_neg"),
        CheckConstraint("relocated_families_count >= 0", name="ck_rr_relocated_non_neg"),
    )

    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    affected_families_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    relocated_families_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sites_ready_pct: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    infrastructure_ready: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    pending_amenities_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class Grievance(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "grievances"

    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), default="Compensation", nullable=False)
    claimant_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Open", nullable=False, index=True)
    filed_date: Mapped[date] = mapped_column(Date, nullable=False)
    resolution_date: Mapped[date | None] = mapped_column(Date, nullable=True)
