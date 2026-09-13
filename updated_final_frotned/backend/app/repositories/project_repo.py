from typing import List, Optional, Tuple
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.projects import Project, RiskLevelEnum


class ProjectRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_projects(
        self,
        state_id: Optional[str] = None,
        district_id: Optional[str] = None,
        risk_level: Optional[RiskLevelEnum | str] = None,
        phase: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Project], int]:
        query = select(Project).options(
            selectinload(Project.district),
            selectinload(Project.lifecycle_stages),
        )

        if state_id:
            query = query.where(Project.state_id == state_id)
        if district_id:
            query = query.where(Project.district_id == district_id)
        if risk_level:
            if isinstance(risk_level, str):
                try:
                    target_enum = RiskLevelEnum(risk_level)
                except ValueError:
                    target_enum = None
            else:
                target_enum = risk_level
            if target_enum:
                query = query.where(Project.current_risk_level == target_enum)
        if phase:
            query = query.where(Project.phase == phase)
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                (Project.name.ilike(search_pattern))
                | (Project.project_code.ilike(search_pattern))
            )

        # Count total records matching filter
        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_query)).scalar_one()

        # Apply sorting & pagination
        offset = (page - 1) * page_size
        query = query.order_by(Project.current_risk_score.desc(), Project.created_at.desc())
        query = query.offset(offset).limit(page_size)

        result = await self.db.execute(query)
        projects = result.scalars().all()

        return list(projects), total

    async def get_by_id(self, project_id: str) -> Optional[Project]:
        query = (
            select(Project)
            .options(
                selectinload(Project.district),
                selectinload(Project.lifecycle_stages),
                selectinload(Project.milestones),
                selectinload(Project.compensation_record),
                selectinload(Project.legal_cases),
            )
            .where(Project.id == project_id)
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create(self, project: Project) -> Project:
        self.db.add(project)
        await self.db.flush()
        await self.db.refresh(project)
        return project

    async def update(self, project: Project) -> Project:
        await self.db.flush()
        await self.db.refresh(project)
        return project
