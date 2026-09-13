import enum
from sqlalchemy import Float, ForeignKey, Integer, String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ShareStatusEnum(str, enum.Enum):
    NOT_SELLING = "Not Selling"
    REQUEST_PENDING = "Sale Request Pending"
    FOR_SALE = "Share For Sale"
    SALE_COMPLETED = "Sale Completed"


class GroupLandParcel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "group_land_parcels"

    parcel_identifier: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    total_area: Mapped[float] = mapped_column(Float, default=10.0, nullable=False)
    area_unit: Mapped[str] = mapped_column(String(50), default="Hectares", nullable=False)
    land_type: Mapped[str] = mapped_column(String(100), default="Agricultural", nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    co_owners = relationship("ParcelCoOwner", back_populates="parcel", cascade="all, delete-orphan")
    sale_requests = relationship("ShareSaleRequest", back_populates="parcel", cascade="all, delete-orphan")
    audit_logs = relationship("OwnershipAuditTrail", back_populates="parcel", cascade="all, delete-orphan")


class ParcelCoOwner(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "parcel_co_owners"

    parcel_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("group_land_parcels.id", ondelete="CASCADE"), nullable=False, index=True
    )
    owner_name: Mapped[str] = mapped_column(String(150), nullable=False)
    contact_email: Mapped[str | None] = mapped_column(String(150), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    ownership_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    share_status: Mapped[str] = mapped_column(String(50), default=ShareStatusEnum.NOT_SELLING.value, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    parcel = relationship("GroupLandParcel", back_populates="co_owners")
    sale_requests = relationship("ShareSaleRequest", back_populates="co_owner")


class ShareSaleRequest(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "share_sale_requests"

    parcel_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("group_land_parcels.id", ondelete="CASCADE"), nullable=False, index=True
    )
    co_owner_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("parcel_co_owners.id", ondelete="CASCADE"), nullable=False, index=True
    )
    share_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    asking_price: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Active", nullable=False)  # Active, Completed, Cancelled

    parcel = relationship("GroupLandParcel", back_populates="sale_requests")
    co_owner = relationship("ParcelCoOwner", back_populates="sale_requests")
    inquiries = relationship("BuyerInquiry", back_populates="sale_request", cascade="all, delete-orphan")


class BuyerInquiry(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "buyer_inquiries"

    sale_request_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("share_sale_requests.id", ondelete="CASCADE"), nullable=False, index=True
    )
    buyer_name: Mapped[str] = mapped_column(String(150), nullable=False)
    buyer_email: Mapped[str | None] = mapped_column(String(150), nullable=True)
    buyer_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    offered_price: Mapped[float] = mapped_column(Float, nullable=False)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Interest Expressed", nullable=False)

    sale_request = relationship("ShareSaleRequest", back_populates="inquiries")


class OwnershipAuditTrail(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "ownership_audit_trails"

    parcel_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("group_land_parcels.id", ondelete="CASCADE"), nullable=False, index=True
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    seller_name: Mapped[str] = mapped_column(String(150), nullable=False)
    buyer_name: Mapped[str] = mapped_column(String(150), nullable=False)
    transferred_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    transaction_price: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    snapshot_before: Mapped[str | None] = mapped_column(Text, nullable=True)
    snapshot_after: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    parcel = relationship("GroupLandParcel", back_populates="audit_logs")
