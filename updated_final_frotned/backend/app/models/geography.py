from sqlalchemy import CheckConstraint, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class State(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "states"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    boundary_geojson: Mapped[str | None] = mapped_column(Text, nullable=True)

    districts = relationship("District", back_populates="state", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="state")


class District(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "districts"

    state_id: Mapped[str] = mapped_column(String(36), ForeignKey("states.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    headquarters: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Visual map coordinates for frontend state intelligence view (percentage x, y)
    map_x: Mapped[float] = mapped_column(Float, default=50.0, nullable=False)
    map_y: Mapped[float] = mapped_column(Float, default=50.0, nullable=False)

    boundary_geojson: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Aggregation counters
    monitored_projects_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    at_risk_projects_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    average_delay_months: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    risk_rate_pct: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    compensation_pending_crores: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    legal_cases_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    state = relationship("State", back_populates="districts")
    talukas = relationship("Taluka", back_populates="district", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="district")


class Taluka(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "talukas"

    district_id: Mapped[str] = mapped_column(String(36), ForeignKey("districts.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    district = relationship("District", back_populates="talukas")
    villages = relationship("Village", back_populates="taluka", cascade="all, delete-orphan")


class Village(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "villages"

    taluka_id: Mapped[str] = mapped_column(String(36), ForeignKey("talukas.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    census_code: Mapped[str | None] = mapped_column(String(50), nullable=True)

    taluka = relationship("Taluka", back_populates="villages")
    parcels = relationship("LandParcel", back_populates="village", cascade="all, delete-orphan")


class LandParcel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "land_parcels"
    __table_args__ = (
        CheckConstraint("area_hectares >= 0", name="ck_parcel_area_non_negative"),
    )

    village_id: Mapped[str] = mapped_column(String(36), ForeignKey("villages.id", ondelete="CASCADE"), nullable=False, index=True)
    survey_number: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    sub_division: Mapped[str | None] = mapped_column(String(20), nullable=True)
    khata_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    owner_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    classification: Mapped[str] = mapped_column(String(100), default="Agricultural", nullable=False)
    area_hectares: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    boundary_geojson: Mapped[str | None] = mapped_column(Text, nullable=True)

    village = relationship("Village", back_populates="parcels")
