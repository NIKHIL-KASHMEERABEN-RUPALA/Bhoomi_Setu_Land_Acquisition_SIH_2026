from sqlalchemy import CheckConstraint, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class CompensationRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "compensation_records"
    __table_args__ = (
        CheckConstraint("sanctioned_amount_crores >= 0", name="ck_comp_sanctioned_non_neg"),
        CheckConstraint("released_amount_crores >= 0", name="ck_comp_released_non_neg"),
        CheckConstraint("utilized_amount_crores >= 0", name="ck_comp_utilized_non_neg"),
        CheckConstraint("pending_amount_crores >= 0", name="ck_comp_pending_non_neg"),
    )

    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    sanctioned_amount_crores: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    released_amount_crores: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    utilized_amount_crores: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    pending_amount_crores: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    disputed_amount_crores: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    awards_total: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    awards_disbursed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    awards_pending: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Aging buckets in crores
    aging_0_30_days: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    aging_31_60_days: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    aging_61_90_days: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    aging_gt_90_days: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    project = relationship("Project", back_populates="compensation_record")
    disputes = relationship("CompensationDispute", back_populates="compensation_record", cascade="all, delete-orphan")


class CompensationDispute(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "compensation_disputes"

    compensation_record_id: Mapped[str] = mapped_column(String(36), ForeignKey("compensation_records.id", ondelete="CASCADE"), nullable=False, index=True)
    claimant_name: Mapped[str] = mapped_column(String(255), nullable=False)
    survey_number: Mapped[str] = mapped_column(String(50), nullable=False)
    disputed_amount_lakhs: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Pending", nullable=False)

    compensation_record = relationship("CompensationRecord", back_populates="disputes")
