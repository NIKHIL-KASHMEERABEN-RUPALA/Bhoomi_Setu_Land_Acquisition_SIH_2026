import math
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import verify_geographic_scope
from app.core.exceptions import EntityNotFoundException, ValidationException
from app.models.audit import AuditLog
from app.models.projects import AcquisitionStage, Milestone, Project, StageStatusEnum
from app.models.users import User
from app.repositories.project_repo import ProjectRepository
from app.schemas.projects import (
    ContributorItem,
    LifecycleStageDTO,
    MilestoneDTO,
    PaginatedProjectsResponse,
    ProjectCreateRequest,
    ProjectDetail,
    ProjectSummary,
    ProjectUpdateRequest,
)


class ProjectService:
    @staticmethod
    def _to_summary(p: Project) -> ProjectSummary:
        contributors = [
            ContributorItem(label="Compensation pendency", value=round(p.land_pending_pct * 0.4, 1)),
            ContributorItem(label="Title / Records", value=round(p.current_risk_score * 0.3, 1)),
            ContributorItem(label="R&R readiness", value=round((100.0 - p.possession_pct) * 0.2, 1)),
            ContributorItem(label="Utility shifting", value=10.0),
        ]

        delta = datetime.now(timezone.utc) - p.updated_at.replace(tzinfo=timezone.utc) if p.updated_at.tzinfo is None else datetime.now(timezone.utc) - p.updated_at
        mins = max(1, int(delta.total_seconds() / 60))
        time_str = f"{mins} min ago" if mins < 60 else f"{mins // 60} hr ago"

        return ProjectSummary(
            id=p.id,
            name=p.name,
            projectCode=p.project_code,
            district=p.district.name if p.district else "Gujarat",
            districtId=p.district_id,
            stateId=p.state_id,
            phase=p.phase,
            riskLevel=p.current_risk_level.value,
            riskScore=round(p.current_risk_score, 1),
            delayProbability=round(p.delay_probability * 100, 1),
            predictedDelayWindow=p.predicted_delay_window,
            confidence=round(p.model_confidence * 100, 1),
            lastUpdated=time_str,
            budget=p.budget_crores,
            affectedFamilies=p.affected_families_count,
            contributors=contributors,
        )

    @classmethod
    async def list_projects(
        cls,
        db: AsyncSession,
        user: User,
        state_id: Optional[str] = None,
        district_id: Optional[str] = None,
        risk_level: Optional[str] = None,
        phase: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedProjectsResponse:
        # Enforce officer geographic boundary automatically
        effective_state_id = user.state_id if user.state_id else state_id
        effective_district_id = user.district_id if user.district_id else district_id

        verify_geographic_scope(user, state_id=effective_state_id, district_id=effective_district_id)

        repo = ProjectRepository(db)
        projects, total = await repo.list_projects(
            state_id=effective_state_id,
            district_id=effective_district_id,
            risk_level=risk_level,
            phase=phase,
            search=search,
            page=page,
            page_size=page_size,
        )

        summaries = [cls._to_summary(p) for p in projects]
        total_pages = math.ceil(total / page_size) if total > 0 else 1

        return PaginatedProjectsResponse(
            items=summaries,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    @classmethod
    async def get_project_detail(
        cls,
        db: AsyncSession,
        project_id: str,
        user: User,
    ) -> ProjectDetail:
        repo = ProjectRepository(db)
        project = await repo.get_by_id(project_id)
        if not project:
            raise EntityNotFoundException("Project", project_id)

        verify_geographic_scope(user, state_id=project.state_id, district_id=project.district_id)

        summary = cls._to_summary(project)

        stages_dto = [
            LifecycleStageDTO(
                name=s.stage_name,
                status=s.status,
                duration=s.duration,
                expectedDuration=s.expected_duration,
                delay=s.delay_days,
                authority=s.responsible_authority,
                blockers=[s.primary_blocker] if s.primary_blocker else [],
            )
            for s in project.lifecycle_stages
        ]

        milestones_dto = [
            MilestoneDTO(
                id=m.id,
                statutory_section=m.statutory_section,
                title=m.title,
                target_date=m.target_date,
                achieved_date=m.achieved_date,
                is_statutory_sla_breached=m.is_statutory_sla_breached,
            )
            for m in project.milestones
        ]

        return ProjectDetail(
            **summary.model_dump(),
            lifecycleStages=stages_dto,
            milestones=milestones_dto,
            landAcquiredPct=project.land_acquired_pct,
            landPendingPct=project.land_pending_pct,
            rowAvailablePct=project.row_available_pct,
            possessionPct=project.possession_pct,
            corridorAlignmentGeojson=project.corridor_alignment_geojson,
        )

    @classmethod
    async def create_project(
        cls,
        db: AsyncSession,
        data: ProjectCreateRequest,
        user: User,
        request_id: str = "internal",
    ) -> ProjectDetail:
        verify_geographic_scope(user, state_id=data.state_id, district_id=data.district_id)

        repo = ProjectRepository(db)
        project = Project(
            name=data.name,
            project_code=data.project_code,
            state_id=data.state_id,
            district_id=data.district_id,
            project_type=data.project_type,
            phase=data.phase,
            budget_crores=data.budget_crores,
            target_completion_date=data.target_completion_date,
            land_acquired_pct=data.land_acquired_pct,
            land_pending_pct=data.land_pending_pct,
            row_available_pct=data.row_available_pct,
            possession_pct=data.possession_pct,
            affected_families_count=data.affected_families_count,
        )

        # Standard RFCTLARR lifecycle stages
        stages = [
            AcquisitionStage(stage_name="Preliminary notification", stage_order=1, status=StageStatusEnum.COMPLETE, duration="28d", expected_duration="30d", delay_days=-2, responsible_authority="Revenue Department"),
            AcquisitionStage(stage_name="Social impact assessment", stage_order=2, status=StageStatusEnum.COMPLETE, duration="58d", expected_duration="60d", delay_days=-2, responsible_authority="District Collector"),
            AcquisitionStage(stage_name="Award & compensation", stage_order=3, status=StageStatusEnum.CURRENT, duration="84d", expected_duration="90d", delay_days=14, responsible_authority="Special LAO", primary_blocker="Awards pending disbursement"),
            AcquisitionStage(stage_name="Possession & handover", stage_order=4, status=StageStatusEnum.PENDING, duration="—", expected_duration="45d", delay_days=0, responsible_authority="Project Director"),
        ]
        project.lifecycle_stages = stages

        created_project = await repo.create(project)

        # Audit log entry
        audit = AuditLog(
            actor_id=user.id,
            actor_email=user.email,
            actor_role=user.role.value,
            action="CREATE_PROJECT",
            resource_type="Project",
            resource_id=created_project.id,
            request_id=request_id,
            status="Success",
            detail=f"Created project {created_project.project_code} ({created_project.name}).",
        )
        db.add(audit)
        await db.commit()

        return await cls.get_project_detail(db, created_project.id, user)

    @classmethod
    async def update_project(
        cls,
        db: AsyncSession,
        project_id: str,
        data: ProjectUpdateRequest,
        user: User,
        request_id: str = "internal",
    ) -> ProjectDetail:
        repo = ProjectRepository(db)
        project = await repo.get_by_id(project_id)
        if not project:
            raise EntityNotFoundException("Project", project_id)

        verify_geographic_scope(user, state_id=project.state_id, district_id=project.district_id)

        update_dict = data.model_dump(exclude_unset=True)
        for key, val in update_dict.items():
            setattr(project, key, val)

        # Cross field verification
        if project.land_acquired_pct + project.land_pending_pct > 100.5:
            raise ValidationException("Total land acquired and pending percentage exceeds 100%.")

        await repo.update(project)

        audit = AuditLog(
            actor_id=user.id,
            actor_email=user.email,
            actor_role=user.role.value,
            action="UPDATE_PROJECT",
            resource_type="Project",
            resource_id=project.id,
            request_id=request_id,
            status="Success",
            detail=f"Updated project {project.project_code} fields: {list(update_dict.keys())}.",
        )
        db.add(audit)
        await db.commit()

        return await cls.get_project_detail(db, project.id, user)
