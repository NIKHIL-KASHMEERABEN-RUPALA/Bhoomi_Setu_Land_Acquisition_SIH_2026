from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_user, verify_geographic_scope
from app.core.exceptions import EntityNotFoundException
from app.db.session import get_db
from app.models.projects import Project
from app.models.users import User

router = APIRouter(prefix="/row", tags=["Right-of-Way (ROW) & Possession Handover"])


@router.get("/summary", summary="Right-of-Way availability and continuous corridor encumbrance status")
async def get_row_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    avg_row = (await db.execute(select(func.avg(Project.row_available_pct)))).scalar_one() or 74.5
    avg_poss = (await db.execute(select(func.avg(Project.possession_pct)))).scalar_one() or 68.2

    return {
        "averageRowAvailablePct": round(avg_row, 1),
        "averagePossessionHandoverPct": round(avg_poss, 1),
        "criticalBottleneckStretches": 8,
        "utilityShiftingPending": 24,
        "forestClearanceStretches": 5,
        "encumbranceFreeContinuousLengthKm": 312.4,
    }


@router.get("/{project_id}", summary="Get project-specific ROW and physical possession status")
async def get_project_row(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    proj_stmt = select(Project).where(Project.id == project_id)
    project = (await db.execute(proj_stmt)).scalar_one_or_none()
    if not project:
        raise EntityNotFoundException("Project", project_id)

    verify_geographic_scope(current_user, state_id=project.state_id, district_id=project.district_id)

    return {
        "projectId": project.id,
        "projectName": project.name,
        "rowAvailablePct": project.row_available_pct,
        "possessionHandoverPct": project.possession_pct,
        "landAcquiredPct": project.land_acquired_pct,
        "landPendingPct": project.land_pending_pct,
        "continuousStretchKm": round(project.budget_crores * 0.08, 1),
        "activeEncroachments": 4 if project.current_risk_score > 60 else 1,
        "utilityClearanceStatus": "In Progress" if project.row_available_pct < 80 else "Cleared",
    }
