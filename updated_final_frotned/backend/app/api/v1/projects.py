from typing import Optional
from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_user, require_roles
from app.db.session import get_db
from app.models.users import RoleEnum, User
from app.schemas.projects import (
    PaginatedProjectsResponse,
    ProjectCreateRequest,
    ProjectDetail,
    ProjectUpdateRequest,
)
from app.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["Projects & Infrastructure Corridors"])


@router.get("", response_model=PaginatedProjectsResponse, summary="Query infrastructure projects with multi-criteria filtering")
async def list_projects(
    request: Request,
    state_id: Optional[str] = Query(None, description="Filter by state UUID"),
    district_id: Optional[str] = Query(None, description="Filter by district UUID"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level (Critical, High, Moderate, Low)"),
    phase: Optional[str] = Query(None, description="Filter by statutory phase"),
    search: Optional[str] = Query(None, description="Search term in project name or code"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieves a paginated list of infrastructure projects matching the filters.
    Automatically scopes output to the logged-in officer's administrative boundary.
    """
    return await ProjectService.list_projects(
        db=db,
        user=current_user,
        state_id=state_id,
        district_id=district_id,
        risk_level=risk_level,
        phase=phase,
        search=search,
        page=page,
        page_size=page_size,
    )


@router.get("/{id}", response_model=ProjectDetail, summary="Get full Project 360 intelligence dossier")
async def get_project(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns the comprehensive Project 360 dossier including statutory stages,
    milestones, risk contributors, and spatial alignment.
    Enforces object-level and geographic scope verification.
    """
    return await ProjectService.get_project_detail(db, id, current_user)


@router.post("", response_model=ProjectDetail, status_code=status.HTTP_201_CREATED, summary="Create new infrastructure project")
async def create_project(
    request: Request,
    body: ProjectCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.CENTRAL_ADMIN, RoleEnum.STATE_ADMIN)),
):
    """
    Creates a new monitored infrastructure corridor or project.
    Restricted to Central Admin and State Admin roles.
    """
    request_id = getattr(request.state, "request_id", "internal")
    return await ProjectService.create_project(db, body, current_user, request_id=request_id)


@router.patch("/{id}", response_model=ProjectDetail, summary="Update project progress or attributes")
async def update_project(
    id: str,
    request: Request,
    body: ProjectUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.CENTRAL_ADMIN, RoleEnum.STATE_ADMIN, RoleEnum.DISTRICT_OFFICER)),
):
    """
    Updates physical progress percentages, financial indicators, or project phase.
    Enforces district boundaries for District Officers.
    """
    request_id = getattr(request.state, "request_id", "internal")
    return await ProjectService.update_project(db, id, body, current_user, request_id=request_id)


@router.get("/{id}/timeline", summary="Retrieve project statutory milestones and RFCTLARR SLA progress")
async def get_project_timeline(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns the statutory timeline milestones (RFCTLARR Section 4, 11, 19, 23)
    and marks any statutory SLA deadline breaches.
    """
    detail = await ProjectService.get_project_detail(db, id, current_user)
    return {
        "projectId": detail.id,
        "projectName": detail.name,
        "currentPhase": detail.phase,
        "lifecycleStages": detail.lifecycleStages,
        "milestones": detail.milestones,
    }
