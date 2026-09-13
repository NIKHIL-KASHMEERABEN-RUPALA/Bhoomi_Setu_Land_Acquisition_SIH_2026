from datetime import date
from sqlalchemy import Boolean, Date, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class LegalCase(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "legal_cases"

    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    case_number: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    court_name: Mapped[str] = mapped_column(String(255), nullable=False)
    case_type: Mapped[str] = mapped_column(String(100), default="Title Dispute", nullable=False)
    has_interim_stay: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    filing_date: Mapped[date] = mapped_column(Date, nullable=False)
    last_hearing_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    next_hearing_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Active", nullable=False, index=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    project = relationship("Project", back_populates="legal_cases")
