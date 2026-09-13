from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from app.models.projects import ProjectTypeEnum, RiskLevelEnum, StageStatusEnum


class ContributorItem(BaseModel):
    label: str
    value: float


class LifecycleStageDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    status: StageStatusEnum
    duration: str
    expectedDuration: str
    delay: int
    authority: str
    blockers: List[str] = Field(default_factory=list)


class MilestoneDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    statutory_section: str
    title: str
    target_date: date
    achieved_date: Optional[date] = None
    is_statutory_sla_breached: bool


class ProjectSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    projectCode: str
    district: str
    districtId: str
    stateId: str
    phase: str
    riskLevel: str
    riskScore: float
    delayProbability: float
    predictedDelayWindow: str
    confidence: float
    lastUpdated: str
    budget: float
    affectedFamilies: int
    contributors: List[ContributorItem] = Field(default_factory=list)


class ProjectDetail(ProjectSummary):
    lifecycleStages: List[LifecycleStageDTO] = Field(default_factory=list)
    milestones: List[MilestoneDTO] = Field(default_factory=list)
    landAcquiredPct: float
    landPendingPct: float
    rowAvailablePct: float
    possessionPct: float
    corridorAlignmentGeojson: Optional[str] = None


class ProjectCreateRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    project_code: str = Field(..., min_length=3, max_length=50)
    state_id: str
    district_id: str
    project_type: ProjectTypeEnum = ProjectTypeEnum.EXPRESSWAY
    phase: str = "Award & compensation"
    budget_crores: float = Field(..., ge=0)
    target_completion_date: Optional[date] = None
    land_acquired_pct: float = Field(default=0.0, ge=0, le=100)
    land_pending_pct: float = Field(default=100.0, ge=0, le=100)
    row_available_pct: float = Field(default=0.0, ge=0, le=100)
    possession_pct: float = Field(default=0.0, ge=0, le=100)
    affected_families_count: int = Field(default=0, ge=0)

    @model_validator(mode="after")
    def validate_cross_fields(self):
        if self.land_acquired_pct + self.land_pending_pct > 100.5:
            raise ValueError("Land acquired percentage + Land pending percentage cannot exceed 100%.")
        return self


class ProjectUpdateRequest(BaseModel):
    name: Optional[str] = None
    phase: Optional[str] = None
    budget_crores: Optional[float] = Field(None, ge=0)
    land_acquired_pct: Optional[float] = Field(None, ge=0, le=100)
    land_pending_pct: Optional[float] = Field(None, ge=0, le=100)
    row_available_pct: Optional[float] = Field(None, ge=0, le=100)
    possession_pct: Optional[float] = Field(None, ge=0, le=100)
    affected_families_count: Optional[int] = Field(None, ge=0)
    families_relocated_count: Optional[int] = Field(None, ge=0)


class PaginatedProjectsResponse(BaseModel):
    items: List[ProjectSummary]
    total: int
    page: int
    page_size: int
    total_pages: int
