from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.core.dependencies import get_current_user
from app.core.exceptions import EntityNotFoundException
from app.db.session import get_db
from app.models.decisions import Alert, AlertCategoryEnum, AlertStatusEnum
from app.models.projects import Project, RiskLevelEnum
from app.models.users import User

router = APIRouter(prefix="/alerts", tags=["Early Warning Signals & Alerts"])


@router.get("", summary="Query real-time early warning alerts and lead signals")
async def list_alerts(
    severity: Optional[str] = Query(None, description="Filter by severity (Critical, High, Moderate, Low)"),
    category: Optional[str] = Query(None, description="Filter by category (Legal, Compensation, Documentation, Ownership, R&R)"),
    status: Optional[str] = Query(None, description="Filter by status (Open, Assigned, Monitoring, Acknowledged)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Alert).options(
        selectinload(Alert.project).selectinload(Project.district)
    ).order_by(Alert.created_at.desc())

    if severity:
        query = query.where(Alert.severity == severity)
    if category:
        query = query.where(Alert.category == category)
    if status:
        query = query.where(Alert.status == status)

    records = (await db.execute(query)).scalars().all()

    results = []
    for a in records:
        proj = a.project
        dist_name = proj.district.name if proj and proj.district else "Gujarat"
        results.append({
            "id": a.id,
            "projectId": a.project_id,
            "projectName": proj.name if proj else "Unknown Corridor",
            "district": dist_name,
            "category": a.category.value,
            "severity": a.severity.value,
            "predictedDelay": a.predicted_delay,
            "confidence": int(a.confidence * 100),
            "primaryCause": a.primary_cause,
            "timestamp": a.created_at.strftime("%d %b, %H:%M") if a.created_at else "Recently",
            "recommendedIntervention": a.recommended_intervention,
            "status": a.status.value,
        })

    # Fallback to frontend baseline sample alerts if DB empty
    if not results:
        results = [
            {
                "id": "a-01",
                "projectId": "p-004",
                "projectName": "Western Dedicated Freight Corridor · Package 8",
                "district": "Kutch",
                "category": "Legal",
                "severity": "Critical",
                "predictedDelay": "8–12 months",
                "confidence": 92,
                "primaryCause": "87 survey numbers remain under title review",
                "timestamp": "12 min ago",
                "recommendedIntervention": "Convene district title-clearing cell and publish a 14-day resolution docket",
                "status": "Open",
            },
            {
                "id": "a-02",
                "projectId": "p-002",
                "projectName": "Mumbai–Ahmedabad High-Speed Rail · GJ-2",
                "district": "Anand",
                "category": "Compensation",
                "severity": "High",
                "predictedDelay": "4–7 months",
                "confidence": 86,
                "primaryCause": "214 awards have crossed the 60-day payment threshold",
                "timestamp": "28 min ago",
                "recommendedIntervention": "Release the verified tranche and schedule a beneficiary payment camp",
                "status": "Assigned",
            },
            {
                "id": "a-03",
                "projectId": "p-003",
                "projectName": "Delhi–Mumbai Expressway · Gujarat Package",
                "district": "Bharuch",
                "category": "Documentation",
                "severity": "Moderate",
                "predictedDelay": "2–4 months",
                "confidence": 78,
                "primaryCause": "Village register reconciliation is behind the SIA critical path",
                "timestamp": "1 hr ago",
                "recommendedIntervention": "Deploy the district record reconciliation cell for two weeks",
                "status": "Monitoring",
            },
            {
                "id": "a-04",
                "projectId": "p-005",
                "projectName": "Surat Metro · North–South Extension",
                "district": "Surat",
                "category": "Ownership",
                "severity": "Moderate",
                "predictedDelay": "2–4 months",
                "confidence": 81,
                "primaryCause": "17 co-owner records require partition validation",
                "timestamp": "2 hr ago",
                "recommendedIntervention": "Start pre-award mediation in the three priority villages",
                "status": "Open",
            },
            {
                "id": "a-05",
                "projectId": "p-001",
                "projectName": "Dholera–Ahmedabad Connector",
                "district": "Ahmedabad",
                "category": "R&R",
                "severity": "Low",
                "predictedDelay": "1–2 months",
                "confidence": 72,
                "primaryCause": "Three residual cases have moved the handover date",
                "timestamp": "3 hr ago",
                "recommendedIntervention": "Confirm site readiness with the R&R authority",
                "status": "Open",
            },
        ]

    return results


@router.post("/{id}/acknowledge", summary="Acknowledge alert and take administrative ownership")
async def acknowledge_alert(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Alert).where(Alert.id == id)
    alert = (await db.execute(stmt)).scalar_one_or_none()
    if not alert:
        raise EntityNotFoundException("Alert", id)

    now_dt = datetime.now(timezone.utc)
    alert.status = AlertStatusEnum.ACKNOWLEDGED
    alert.acknowledged_by = current_user.full_name
    alert.acknowledged_at = now_dt
    await db.commit()

    return {
        "id": alert.id,
        "status": alert.status.value,
        "acknowledgedBy": alert.acknowledged_by,
        "acknowledgedAt": now_dt.isoformat(),
    }
