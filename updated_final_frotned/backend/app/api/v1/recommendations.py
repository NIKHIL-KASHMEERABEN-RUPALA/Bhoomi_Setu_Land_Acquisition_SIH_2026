from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.core.dependencies import get_current_user, verify_geographic_scope
from app.core.exceptions import EntityNotFoundException
from app.db.session import get_db
from app.models.projects import Project
from app.models.users import User
from app.recommendations.engine import RecommendationEngine

router = APIRouter(tags=["Recommendations & Decision Support"])


@router.get("/projects/{id}/recommendations", summary="Generate transparent, rule-based administrative recommendations")
async def get_project_recommendations(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Evaluates statutory, legal, and financial indicators to provide
    structured administrative recommendations for accelerating project progress.
    """
    stmt = (
        select(Project)
        .options(
            selectinload(Project.compensation_record),
            selectinload(Project.legal_cases),
        )
        .where(Project.id == id)
    )
    project = (await db.execute(stmt)).scalar_one_or_none()
    if not project:
        raise EntityNotFoundException("Project", id)

    verify_geographic_scope(current_user, state_id=project.state_id, district_id=project.district_id)

    recommendations = RecommendationEngine.evaluate_project(project)

    return {
        "projectId": project.id,
        "projectName": project.name,
        "recommendationsCount": len(recommendations),
        "items": recommendations,
    }
