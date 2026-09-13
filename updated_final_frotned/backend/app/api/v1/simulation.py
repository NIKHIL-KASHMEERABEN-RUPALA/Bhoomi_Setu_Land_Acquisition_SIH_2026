from typing import Any, Dict
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.core.dependencies import get_current_user, verify_geographic_scope
from app.core.exceptions import EntityNotFoundException, ValidationException
from app.db.session import get_db
from app.inference.feature_adapter import FeatureAdapter
from app.inference.predictor import Predictor
from app.models.projects import Project
from app.models.users import User

router = APIRouter(tags=["What-If Counterfactual Simulation"])


class SimulationRequest(BaseModel):
    changes: Dict[str, float] = Field(
        ...,
        description="Hypothetical feature changes to evaluate (e.g. {'compensation_pending_pct': 15, 'row_available_pct': 85})",
    )


@router.post("/projects/{id}/simulate", summary="Simulate hypothetical policy/operational interventions without modifying data")
async def simulate_scenario(
    id: str,
    body: SimulationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Evaluates in-memory counterfactual scenarios (What-If Analysis).
    Runs the inference model against modified parameters to quantify
    projected delay risk reduction before executing on-ground administrative actions.
    Guaranteed zero side-effects on persistent database state.
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

    # 1. Baseline prediction
    baseline_features = FeatureAdapter.extract_from_project(project)
    baseline_result = Predictor.predict(baseline_features)

    # 2. Simulated counterfactual prediction
    simulated_features = FeatureAdapter.extract_from_project(project, overrides=body.changes)
    simulated_result = Predictor.predict(simulated_features)

    prob_change = round(simulated_result.delay_probability - baseline_result.delay_probability, 4)

    return {
        "projectId": project.id,
        "projectName": project.name,
        "currentProbability": baseline_result.delay_probability,
        "currentRiskLevel": baseline_result.risk_level.value,
        "simulatedProbability": simulated_result.delay_probability,
        "simulatedRiskLevel": simulated_result.risk_level.value,
        "probabilityDelta": prob_change,
        "direction": "risk_reduced" if prob_change < 0 else "risk_increased" if prob_change > 0 else "neutral",
        "notice": "Scenario estimate based on ML inference vector transformation; does not constitute causal or legal guarantee.",
        "appliedChanges": body.changes,
    }
