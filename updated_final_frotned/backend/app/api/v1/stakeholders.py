from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.social import Grievance
from app.models.users import User

router = APIRouter(prefix="/stakeholders", tags=["Stakeholders & Grievance Redressal"])


@router.get("/grievances", summary="Query public objections and grievance redressal dockets")
async def list_grievances(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Grievance).order_by(Grievance.filed_date.desc()).limit(50)
    records = (await db.execute(stmt)).scalars().all()

    return {
        "totalGrievances": len(records),
        "unresolvedCount": sum(1 for r in records if r.status == "Open"),
        "mediationPanelsActive": 4,
        "items": [
            {
                "id": g.id,
                "projectId": g.project_id,
                "category": g.category,
                "claimantName": g.claimant_name,
                "description": g.description,
                "status": g.status,
                "filedDate": g.filed_date.isoformat(),
                "resolutionDate": g.resolution_date.isoformat() if g.resolution_date else None,
            }
            for g in records
        ],
    }
