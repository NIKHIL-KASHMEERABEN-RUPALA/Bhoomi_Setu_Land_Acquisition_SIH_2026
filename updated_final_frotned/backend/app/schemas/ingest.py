from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class LifecycleStageIngest(BaseModel):
    name: str
    status: str = "pending"
    duration: Optional[str] = None
    expectedDuration: Optional[str] = None
    delay: Optional[float] = 0.0
    authority: Optional[str] = None
    blockers: List[str] = []


class ContributorIngest(BaseModel):
    label: str
    value: float


class ProjectIngest(BaseModel):
    id: str
    name: str
    projectCode: str
    district: str
    phase: str = "Award & compensation"
    riskLevel: str = "Moderate"
    riskScore: float = 0.0
    delayProbability: float = 0.0
    predictedDelayWindow: str = "On track"
    confidence: float = 85.0
    lastUpdated: Optional[str] = None
    budget: float = 0.0
    affectedFamilies: int = 0
    contributors: List[ContributorIngest] = []
    lifecycleStages: List[LifecycleStageIngest] = []


class MapPositionIngest(BaseModel):
    x: float = 50.0
    y: float = 50.0


class DistrictIngest(BaseModel):
    id: str
    name: str
    monitoredProjects: int = 0
    atRiskProjects: int = 0
    averageDelay: float = 0.0
    riskRate: float = 0.0
    compensationPending: float = 0.0
    legalCases: int = 0
    trend: List[float] = []
    mapPosition: Optional[MapPositionIngest] = None


class AlertIngest(BaseModel):
    id: str
    projectId: str
    projectName: str
    district: str
    category: str
    severity: str
    predictedDelay: str
    confidence: float
    primaryCause: str
    timestamp: Optional[str] = None
    recommendedIntervention: str
    status: str = "Open"


class FinancialRecordIngest(BaseModel):
    district: str
    sanctioned: float
    released: float
    utilized: float
    pendingCompensation: float
    agingBuckets: List[float] = []


class CorridorNodeIngest(BaseModel):
    label: str
    x: float
    y: float
    projectId: Optional[str] = None
    riskLevel: Optional[str] = None


class CorridorIngest(BaseModel):
    id: str
    name: str
    code: str
    route: str
    riskLevel: str
    riskScore: float
    projects: int
    exposedValue: float
    leadSignal: str
    nodes: List[CorridorNodeIngest] = []


class InterventionIngest(BaseModel):
    id: str
    title: str
    owner: str
    status: str = "Open"
    dueDate: Optional[str] = None
    due: Optional[str] = None
    assignedAt: Optional[str] = None
    projectId: Optional[str] = None


class IngestPayload(BaseModel):
    timestamp: Optional[str] = None
    source: Optional[str] = "frontend"
    projects: List[ProjectIngest] = []
    districts: List[DistrictIngest] = []
    alerts: List[AlertIngest] = []
    financials: List[FinancialRecordIngest] = []
    corridors: List[CorridorIngest] = []
    interventions: List[InterventionIngest] = []


class IngestResponse(BaseModel):
    status: str
    message: str
    counts: Dict[str, int]
    generated_dataset_files: List[str]
    timestamp: str
