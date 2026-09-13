import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.group_land import (
    GroupLandParcel,
    ParcelCoOwner,
    ShareSaleRequest,
    BuyerInquiry,
    OwnershipAuditTrail,
    ShareStatusEnum,
)
from app.schemas.group_land import (
    CreateGroupLandParcelSchema,
    SellShareRequestInput,
    BuyerInquiryInput,
    CompleteSaleInput,
    GroupLandParcelSummaryDTO,
    GroupLandParcelDetailDTO,
    CoOwnerDTO,
    ShareSaleRequestDTO,
    AuditTrailDTO,
)

from app.db.base import Base
from app.db.session import get_db, get_engine

router = APIRouter(prefix="/group-land", tags=["Group Land & Co-Ownership"])


async def seed_initial_demo_parcels(db: AsyncSession) -> None:
    """Auto-seeds demo parcels (including user's P-102) if no group land parcels exist."""
    try:
        stmt = select(GroupLandParcel).where(GroupLandParcel.parcel_identifier == "P-102").limit(1)
        existing = (await db.execute(stmt)).scalars().first()
        if existing:
            return
    except Exception:
        await db.rollback()
        engine = get_engine()
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        stmt = select(GroupLandParcel).where(GroupLandParcel.parcel_identifier == "P-102").limit(1)
        existing = (await db.execute(stmt)).scalars().first()
        if existing:
            return

    # 1. User's exact example: Land Parcel P-102
    existing_p102 = (
        await db.execute(select(GroupLandParcel).where(GroupLandParcel.parcel_identifier == "P-102").limit(1))
    ).scalars().first()

    if not existing_p102:
        p102 = GroupLandParcel(
            parcel_identifier="P-102",
            title="Dholera Special Investment Region — Mixed Agri-Commercial Group Parcel",
            location="Dholera SIR, Ahmedabad District, Gujarat",
            total_area=14.8,
            area_unit="Hectares",
            land_type="Agricultural",
            notes="Multiple ancestral co-owners under Section 11 preliminary notification for high-speed corridor bypass.",
        )
        db.add(p102)
        await db.flush()

        rahul = ParcelCoOwner(
            parcel_id=p102.id,
            owner_name="Rahul Sharma",
            contact_email="rahul.sharma@example.gov.in",
            contact_phone="+91 98250 11201",
            ownership_percentage=50.0,
            share_status=ShareStatusEnum.NOT_SELLING.value,
        )
        amit = ParcelCoOwner(
            parcel_id=p102.id,
            owner_name="Amit Patel",
            contact_email="amit.patel@example.gov.in",
            contact_phone="+91 98250 22302",
            ownership_percentage=30.0,
            share_status=ShareStatusEnum.NOT_SELLING.value,
        )
        priya = ParcelCoOwner(
            parcel_id=p102.id,
            owner_name="Priya Desai",
            contact_email="priya.desai@example.gov.in",
            contact_phone="+91 98250 33403",
            ownership_percentage=20.0,
            share_status=ShareStatusEnum.NOT_SELLING.value,
        )
        db.add_all([rahul, amit, priya])
        await db.flush()

        audit_seed = OwnershipAuditTrail(
            parcel_id=p102.id,
            action="INITIAL_REGISTRATION",
            seller_name="Gujarat Revenue Registry",
            buyer_name="Group Co-Owners (Rahul, Amit, Priya)",
            transferred_percentage=100.0,
            transaction_price=0.0,
            snapshot_after=json.dumps([
                {"owner": "Rahul Sharma", "share": 50.0, "status": "Not Selling"},
                {"owner": "Amit Patel", "share": 30.0, "status": "Not Selling"},
                {"owner": "Priya Desai", "share": 20.0, "status": "Not Selling"},
            ]),
            notes="Parcel P-102 registered with verified 100% group co-ownership structure.",
        )
        db.add(audit_seed)

    # 2. Additional Parcel P-108 for variety
    existing_p108 = (
        await db.execute(select(GroupLandParcel).where(GroupLandParcel.parcel_identifier == "P-108").limit(1))
    ).scalars().first()

    if not existing_p108:
        p108 = GroupLandParcel(
            parcel_identifier="P-108",
            title="Vadodara Industrial Bypass Group Estate",
            location="Savli Taluka, Vadodara, Gujarat",
            total_area=22.4,
            area_unit="Hectares",
            land_type="Industrial / Agri",
            notes="Group parcel adjacent to express logistics corridor.",
        )
        db.add(p108)
        await db.flush()

        o1 = ParcelCoOwner(
            parcel_id=p108.id,
            owner_name="Devendra Varma",
            contact_email="d.varma@example.gov.in",
            ownership_percentage=40.0,
            share_status=ShareStatusEnum.NOT_SELLING.value,
        )
        o2 = ParcelCoOwner(
            parcel_id=p108.id,
            owner_name="Sunita Joshi",
            contact_email="s.joshi@example.gov.in",
            ownership_percentage=35.0,
            share_status=ShareStatusEnum.NOT_SELLING.value,
        )
        o3 = ParcelCoOwner(
            parcel_id=p108.id,
            owner_name="Kishore Trivedi",
            contact_email="k.trivedi@example.gov.in",
            ownership_percentage=25.0,
            share_status=ShareStatusEnum.NOT_SELLING.value,
        )
        db.add_all([o1, o2, o3])

    await db.commit()


@router.get("/parcels", response_model=List[GroupLandParcelSummaryDTO])
async def list_group_parcels(db: AsyncSession = Depends(get_db)):
    """List all group land parcels with total owners, for-sale counts, and statistics."""
    await seed_initial_demo_parcels(db)

    stmt = select(GroupLandParcel).options(
        selectinload(GroupLandParcel.co_owners),
        selectinload(GroupLandParcel.sale_requests),
    ).order_by(GroupLandParcel.parcel_identifier.asc())

    records = (await db.execute(stmt)).scalars().all()
    summaries = []
    for p in records:
        active_owners = [o for o in p.co_owners if o.is_active and o.ownership_percentage > 0]
        for_sale_owners = [o for o in active_owners if o.share_status == ShareStatusEnum.FOR_SALE.value]
        for_sale_percentage = sum(
            sr.share_percentage for sr in p.sale_requests if sr.status == "Active"
        )
        summaries.append(
            GroupLandParcelSummaryDTO(
                id=p.id,
                parcel_identifier=p.parcel_identifier,
                title=p.title,
                location=p.location,
                total_area=p.total_area,
                area_unit=p.area_unit,
                land_type=p.land_type,
                total_owners=len(active_owners),
                for_sale_shares_count=len(for_sale_owners),
                total_for_sale_percentage=round(for_sale_percentage, 2),
                created_at=p.created_at,
            )
        )
    return summaries


@router.get("/parcels/{parcel_id}", response_model=GroupLandParcelDetailDTO)
async def get_group_parcel_detail(parcel_id: str, db: AsyncSession = Depends(get_db)):
    """Get single group land parcel with full ownership breakdown, active sale requests, and audit logs."""
    await seed_initial_demo_parcels(db)

    stmt = (
        select(GroupLandParcel)
        .where((GroupLandParcel.id == parcel_id) | (GroupLandParcel.parcel_identifier == parcel_id))
        .options(
            selectinload(GroupLandParcel.co_owners),
            selectinload(GroupLandParcel.sale_requests).selectinload(ShareSaleRequest.inquiries),
            selectinload(GroupLandParcel.audit_logs),
        )
    )
    parcel = (await db.execute(stmt)).scalars().first()
    if not parcel:
        raise HTTPException(status_code=404, detail=f"Group land parcel '{parcel_id}' not found")

    # Map owner names to sale requests
    owner_map = {o.id: o.owner_name for o in parcel.co_owners}
    sale_dtos = []
    for sr in parcel.sale_requests:
        inquiry_dtos = [
            BuyerInquiryDTO(
                id=inq.id,
                sale_request_id=inq.sale_request_id,
                buyer_name=inq.buyer_name,
                buyer_email=inq.buyer_email,
                buyer_phone=inq.buyer_phone,
                offered_price=inq.offered_price,
                message=inq.message,
                status=inq.status,
                created_at=inq.created_at,
            )
            for inq in sr.inquiries
        ]
        sale_dtos.append(
            ShareSaleRequestDTO(
                id=sr.id,
                parcel_id=sr.parcel_id,
                co_owner_id=sr.co_owner_id,
                co_owner_name=owner_map.get(sr.co_owner_id, "Unknown"),
                share_percentage=sr.share_percentage,
                asking_price=sr.asking_price,
                currency=sr.currency,
                reason=sr.reason,
                notes=sr.notes,
                status=sr.status,
                created_at=sr.created_at,
                inquiries=inquiry_dtos,
            )
        )

    co_owner_dtos = [
        CoOwnerDTO(
            id=o.id,
            parcel_id=o.parcel_id,
            owner_name=o.owner_name,
            contact_email=o.contact_email,
            contact_phone=o.contact_phone,
            ownership_percentage=round(o.ownership_percentage, 2),
            share_status=o.share_status,
            is_active=o.is_active,
            created_at=o.created_at,
        )
        for o in parcel.co_owners
        if o.is_active and o.ownership_percentage > 0
    ]

    audit_dtos = [
        AuditTrailDTO(
            id=a.id,
            parcel_id=a.parcel_id,
            action=a.action,
            seller_name=a.seller_name,
            buyer_name=a.buyer_name,
            transferred_percentage=a.transferred_percentage,
            transaction_price=a.transaction_price,
            snapshot_before=a.snapshot_before,
            snapshot_after=a.snapshot_after,
            notes=a.notes,
            created_at=a.created_at,
        )
        for a in sorted(parcel.audit_logs, key=lambda x: x.created_at, reverse=True)
    ]

    return GroupLandParcelDetailDTO(
        id=parcel.id,
        parcel_identifier=parcel.parcel_identifier,
        title=parcel.title,
        location=parcel.location,
        total_area=parcel.total_area,
        area_unit=parcel.area_unit,
        land_type=parcel.land_type,
        notes=parcel.notes,
        co_owners=co_owner_dtos,
        sale_requests=sale_dtos,
        audit_logs=audit_dtos,
        created_at=parcel.created_at,
    )


@router.post("/parcels", status_code=status.HTTP_201_CREATED)
async def create_group_land_parcel(payload: CreateGroupLandParcelSchema, db: AsyncSession = Depends(get_db)):
    """Create a new group land parcel with strict 100% total ownership validation."""
    # Check if identifier already exists
    existing = (
        await db.execute(select(GroupLandParcel).where(GroupLandParcel.parcel_identifier == payload.parcel_identifier))
    ).scalars().first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Parcel with identifier '{payload.parcel_identifier}' already exists."
        )

    new_parcel = GroupLandParcel(
        parcel_identifier=payload.parcel_identifier,
        title=payload.title,
        location=payload.location,
        total_area=payload.total_area,
        area_unit=payload.area_unit,
        land_type=payload.land_type,
        notes=payload.notes,
    )
    db.add(new_parcel)
    await db.flush()

    owners = [
        ParcelCoOwner(
            parcel_id=new_parcel.id,
            owner_name=o.owner_name,
            contact_email=o.contact_email,
            contact_phone=o.contact_phone,
            ownership_percentage=round(o.ownership_percentage, 2),
            share_status=ShareStatusEnum.NOT_SELLING.value,
        )
        for o in payload.co_owners
    ]
    db.add_all(owners)

    audit = OwnershipAuditTrail(
        parcel_id=new_parcel.id,
        action="INITIAL_REGISTRATION",
        seller_name="Registry Authority",
        buyer_name=", ".join(o.owner_name for o in payload.co_owners),
        transferred_percentage=100.0,
        transaction_price=0.0,
        snapshot_after=json.dumps([
            {"owner": o.owner_name, "share": o.ownership_percentage, "status": "Not Selling"}
            for o in payload.co_owners
        ]),
        notes=f"Group parcel {new_parcel.parcel_identifier} created with {len(owners)} co-owners totaling 100%.",
    )
    db.add(audit)

    await db.commit()
    return {"message": "Group land parcel created successfully", "parcel_id": new_parcel.id}


@router.post("/parcels/{parcel_id}/sell-request")
async def submit_sell_my_share_request(
    parcel_id: str,
    payload: SellShareRequestInput,
    db: AsyncSession = Depends(get_db),
):
    """
    Submits a 'Sell My Share' request for an individual co-owner.
    IMPORTANT: Other co-owners remain completely untouched ('Not Selling').
    """
    parcel = (
        await db.execute(
            select(GroupLandParcel)
            .where((GroupLandParcel.id == parcel_id) | (GroupLandParcel.parcel_identifier == parcel_id))
            .options(selectinload(GroupLandParcel.co_owners))
        )
    ).scalars().first()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")

    co_owner = next((o for o in parcel.co_owners if o.id == payload.co_owner_id and o.is_active), None)
    if not co_owner:
        raise HTTPException(status_code=404, detail="Co-owner not found on this parcel")

    # Validate: Seller can only sell up to what they own
    if payload.share_percentage > co_owner.ownership_percentage:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot sell {payload.share_percentage}%! "
                f"Owner '{co_owner.owner_name}' only owns {co_owner.ownership_percentage}%."
            )
        )

    # Create Sell Request
    sale_req = ShareSaleRequest(
        parcel_id=parcel.id,
        co_owner_id=co_owner.id,
        share_percentage=round(payload.share_percentage, 2),
        asking_price=payload.asking_price,
        reason=payload.reason,
        notes=payload.notes,
        status="Active",
    )
    db.add(sale_req)

    # Mark this owner as Share For Sale (🔴)
    co_owner.share_status = ShareStatusEnum.FOR_SALE.value

    # Log to audit trail (also acts as transparency log for other co-owners)
    other_owners = [o.owner_name for o in parcel.co_owners if o.id != co_owner.id]
    audit = OwnershipAuditTrail(
        parcel_id=parcel.id,
        action="SHARE_SALE_REQUEST_FILED",
        seller_name=co_owner.owner_name,
        buyer_name="Marketplace / Prospective Buyers",
        transferred_percentage=payload.share_percentage,
        transaction_price=payload.asking_price,
        notes=(
            f"{co_owner.owner_name} listed {payload.share_percentage}% share for ₹{payload.asking_price:,.0f}. "
            f"Notified remaining co-owners: {', '.join(other_owners)} (their shares remain Not Selling)."
        ),
    )
    db.add(audit)

    await db.commit()
    return {
        "message": f"Sell request submitted for {co_owner.owner_name} ({payload.share_percentage}%). Other co-owners notified.",
        "sale_request_id": sale_req.id,
    }


@router.get("/marketplace")
async def list_available_shares(db: AsyncSession = Depends(get_db)):
    """List all individual shares currently listed for sale across group parcels (Buyer marketplace view)."""
    await seed_initial_demo_parcels(db)

    stmt = (
        select(ShareSaleRequest)
        .where(ShareSaleRequest.status == "Active")
        .options(
            selectinload(ShareSaleRequest.parcel),
            selectinload(ShareSaleRequest.co_owner),
            selectinload(ShareSaleRequest.inquiries),
        )
    )
    records = (await db.execute(stmt)).scalars().all()

    items = []
    for r in records:
        items.append({
            "sale_request_id": r.id,
            "parcel_id": r.parcel_id,
            "parcel_identifier": r.parcel.parcel_identifier,
            "parcel_title": r.parcel.title,
            "location": r.parcel.location,
            "seller_id": r.co_owner.id,
            "seller_name": r.co_owner.owner_name,
            "seller_total_share": r.co_owner.ownership_percentage,
            "share_percentage_for_sale": r.share_percentage,
            "asking_price": r.asking_price,
            "currency": r.currency,
            "reason": r.reason,
            "notes": r.notes,
            "inquiries_count": len(r.inquiries),
            "created_at": r.created_at,
        })
    return items


@router.post("/sell-requests/{sale_request_id}/inquire")
async def submit_buyer_inquiry(
    sale_request_id: str,
    payload: BuyerInquiryInput,
    db: AsyncSession = Depends(get_db),
):
    """Prospective buyer expresses interest in an available share."""
    sr = (
        await db.execute(select(ShareSaleRequest).where(ShareSaleRequest.id == sale_request_id))
    ).scalars().first()
    if not sr or sr.status != "Active":
        raise HTTPException(status_code=404, detail="Active share sale request not found")

    inq = BuyerInquiry(
        sale_request_id=sr.id,
        buyer_name=payload.buyer_name,
        buyer_email=payload.buyer_email,
        buyer_phone=payload.buyer_phone,
        offered_price=payload.offered_price,
        message=payload.message,
        status="Interest Expressed",
    )
    db.add(inq)
    await db.commit()
    return {"message": f"Inquiry registered for {payload.buyer_name}", "inquiry_id": inq.id}


@router.post("/sell-requests/{sale_request_id}/complete-sale")
async def complete_share_sale(
    sale_request_id: str,
    payload: CompleteSaleInput,
    db: AsyncSession = Depends(get_db),
):
    """
    Executes atomic ownership transfer:
    1. Reduces seller's ownership percentage by sold share.
    2. Adds buyer as co-owner (or updates if already an existing co-owner).
    3. Keeps all other owners' shares strictly unchanged.
    4. Validates that the sum of all owners' percentages remains exactly 100.0%.
    5. Records full before/after state in the immutable audit trail.
    """
    stmt = (
        select(ShareSaleRequest)
        .where(ShareSaleRequest.id == sale_request_id)
        .options(
            selectinload(ShareSaleRequest.parcel).selectinload(GroupLandParcel.co_owners),
            selectinload(ShareSaleRequest.co_owner),
        )
    )
    sr = (await db.execute(stmt)).scalars().first()
    if not sr or sr.status != "Active":
        raise HTTPException(status_code=400, detail="Active sale request not found or already completed")

    parcel = sr.parcel
    seller = sr.co_owner
    sold_share = sr.share_percentage
    price = payload.final_price or sr.asking_price

    # Snapshot Before
    before_state = [
        {"owner": o.owner_name, "share": o.ownership_percentage, "status": o.share_status}
        for o in parcel.co_owners if o.is_active and o.ownership_percentage > 0
    ]

    # 1. Update Seller
    remaining_seller_share = round(seller.ownership_percentage - sold_share, 2)
    if remaining_seller_share < 0:
        raise HTTPException(status_code=400, detail="Invalid share arithmetic: Seller share cannot drop below 0")

    seller.ownership_percentage = remaining_seller_share
    if remaining_seller_share == 0.0:
        seller.share_status = ShareStatusEnum.SALE_COMPLETED.value
        seller.is_active = False
    else:
        # Seller kept a portion of their land
        seller.share_status = ShareStatusEnum.NOT_SELLING.value

    # 2. Add / Update Buyer
    existing_buyer = next(
        (o for o in parcel.co_owners if o.owner_name.strip().lower() == payload.buyer_name.strip().lower()),
        None
    )
    if existing_buyer:
        existing_buyer.ownership_percentage = round(existing_buyer.ownership_percentage + sold_share, 2)
        existing_buyer.is_active = True
    else:
        new_buyer = ParcelCoOwner(
            parcel_id=parcel.id,
            owner_name=payload.buyer_name,
            contact_email=payload.buyer_email,
            contact_phone=payload.buyer_phone,
            ownership_percentage=round(sold_share, 2),
            share_status=ShareStatusEnum.NOT_SELLING.value,
            is_active=True,
        )
        parcel.co_owners.append(new_buyer)
        db.add(new_buyer)

    # 3. Mark sale request completed
    sr.status = "Completed"

    # 4. Invariant Validation: Sum must equal 100.0%
    await db.flush()
    active_owners = [o for o in parcel.co_owners if o.is_active and o.ownership_percentage > 0]
    total_percentage = sum(o.ownership_percentage for o in active_owners)
    if round(total_percentage, 2) != 100.0:
        raise HTTPException(
            status_code=500,
            detail=f"Integrity check failed: Reallocated shares sum to {total_percentage}%, expected 100.0%"
        )

    # Snapshot After
    after_state = [
        {"owner": o.owner_name, "share": o.ownership_percentage, "status": o.share_status}
        for o in active_owners
    ]

    # 5. Record Audit Trail
    audit = OwnershipAuditTrail(
        parcel_id=parcel.id,
        action="SHARE_SALE_COMPLETED",
        seller_name=seller.owner_name,
        buyer_name=payload.buyer_name,
        transferred_percentage=sold_share,
        transaction_price=price,
        snapshot_before=json.dumps(before_state),
        snapshot_after=json.dumps(after_state),
        notes=(
            f"Transferred {sold_share}% share from {seller.owner_name} to {payload.buyer_name} "
            f"for ₹{price:,.0f}. Total ownership validated at 100.0%. "
            f"Other co-owners remained completely unaffected."
        ),
    )
    db.add(audit)

    await db.commit()
    return {
        "message": f"Successfully completed sale of {sold_share}% to {payload.buyer_name}!",
        "parcel_id": parcel.id,
        "new_ownership": after_state,
    }


@router.get("/parcels/{parcel_id}/audit-trail", response_model=List[AuditTrailDTO])
async def get_parcel_audit_trail(parcel_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch complete immutable history of ownership transfers and changes."""
    stmt = (
        select(OwnershipAuditTrail)
        .join(GroupLandParcel)
        .where((GroupLandParcel.id == parcel_id) | (GroupLandParcel.parcel_identifier == parcel_id))
        .order_by(OwnershipAuditTrail.created_at.desc())
    )
    records = (await db.execute(stmt)).scalars().all()
    return [
        AuditTrailDTO(
            id=a.id,
            parcel_id=a.parcel_id,
            action=a.action,
            seller_name=a.seller_name,
            buyer_name=a.buyer_name,
            transferred_percentage=a.transferred_percentage,
            transaction_price=a.transaction_price,
            snapshot_before=a.snapshot_before,
            snapshot_after=a.snapshot_after,
            notes=a.notes,
            created_at=a.created_at,
        )
        for a in records
    ]
