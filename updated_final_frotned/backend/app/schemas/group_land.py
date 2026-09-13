from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator


class CoOwnerInput(BaseModel):
    owner_name: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    ownership_percentage: float = Field(..., gt=0, le=100)


class CreateGroupLandParcelSchema(BaseModel):
    parcel_identifier: str
    title: str
    location: str
    total_area: float = Field(default=10.0, gt=0)
    area_unit: str = "Hectares"
    land_type: str = "Agricultural"
    notes: Optional[str] = None
    co_owners: List[CoOwnerInput]

    @model_validator(mode="after")
    def validate_total_ownership(self) -> "CreateGroupLandParcelSchema":
        if not self.co_owners:
            raise ValueError("A group land parcel must have at least one co-owner.")
        total_percentage = sum(o.ownership_percentage for o in self.co_owners)
        if round(total_percentage, 2) != 100.0:
            raise ValueError(
                f"Total co-ownership percentage must equal exactly 100%. Provided total is {total_percentage}%"
            )
        return self


class SellShareRequestInput(BaseModel):
    co_owner_id: str
    share_percentage: float = Field(..., gt=0, le=100)
    asking_price: float = Field(..., gt=0)
    reason: Optional[str] = None
    notes: Optional[str] = None


class BuyerInquiryInput(BaseModel):
    buyer_name: str
    buyer_email: Optional[str] = None
    buyer_phone: Optional[str] = None
    offered_price: float = Field(..., gt=0)
    message: Optional[str] = None


class CompleteSaleInput(BaseModel):
    buyer_name: str
    buyer_email: Optional[str] = None
    buyer_phone: Optional[str] = None
    final_price: Optional[float] = None
    notes: Optional[str] = None


# --- Output DTOs ---

class CoOwnerDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    parcel_id: str
    owner_name: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    ownership_percentage: float
    share_status: str
    is_active: bool
    created_at: datetime


class BuyerInquiryDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    sale_request_id: str
    buyer_name: str
    buyer_email: Optional[str] = None
    buyer_phone: Optional[str] = None
    offered_price: float
    message: Optional[str] = None
    status: str
    created_at: datetime


class ShareSaleRequestDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    parcel_id: str
    co_owner_id: str
    co_owner_name: Optional[str] = None
    share_percentage: float
    asking_price: float
    currency: str
    reason: Optional[str] = None
    notes: Optional[str] = None
    status: str
    created_at: datetime
    inquiries: List[BuyerInquiryDTO] = Field(default_factory=list)


class AuditTrailDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    parcel_id: str
    action: str
    seller_name: str
    buyer_name: str
    transferred_percentage: float
    transaction_price: float
    snapshot_before: Optional[str] = None
    snapshot_after: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime


class GroupLandParcelSummaryDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    parcel_identifier: str
    title: str
    location: str
    total_area: float
    area_unit: str
    land_type: str
    total_owners: int
    for_sale_shares_count: int
    total_for_sale_percentage: float
    created_at: datetime


class GroupLandParcelDetailDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    parcel_identifier: str
    title: str
    location: str
    total_area: float
    area_unit: str
    land_type: str
    notes: Optional[str] = None
    co_owners: List[CoOwnerDTO]
    sale_requests: List[ShareSaleRequestDTO]
    audit_logs: List[AuditTrailDTO]
    created_at: datetime
