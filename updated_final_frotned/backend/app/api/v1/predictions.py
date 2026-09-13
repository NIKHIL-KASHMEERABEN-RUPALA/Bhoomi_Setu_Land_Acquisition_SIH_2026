from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.projects import Project
from app.models.users import User
from app.services.prediction_service import PredictionService

router = APIRouter(tags=["ML Predictions & Explainability"])


class BatchPredictRequest(BaseModel):
    project_ids: List[str] = Field(..., max_length=50, description="List of project UUIDs to evaluate (max 50)")


class DirectPredictInput(BaseModel):
    project_id: Optional[str] = "PRJ_EVAL"
    project_type: Optional[str] = "Highways"
    state: Optional[str] = "Gujarat"
    district: Optional[str] = "Bharuch"
    acquisition_stage: Optional[str] = "Section 23 (Award)"
    project_cost: Optional[float] = 1250.0
    project_length_km: Optional[float] = 85.0
    land_required_hectares: Optional[float] = 350.0
    land_acquired_pct: Optional[float] = 42.0
    land_pending_pct: Optional[float] = 58.0
    possession_pct: Optional[float] = 35.0
    compensation_pending_pct: Optional[float] = 58.0
    court_case_count: Optional[int] = 6
    legal_case_count: Optional[int] = 8
    public_objection_count: Optional[int] = 22
    days_in_current_stage: Optional[int] = 90
    days_since_notification: Optional[int] = 240


@router.post("/predict", summary="Direct Real-Time Model Inference (500-Tree XGBoost & B.L.A.S.T.)")
async def predict_direct(payload: DirectPredictInput):
    """
    Direct model inference endpoint called by frontend components (Indicator Matrix Modal, Project 360, etc.)
    with automatic feature engineering and SHAP attribution.
    """
    from app.inference.ml_model_bridge import predict_project_inputs
    return predict_project_inputs(payload.model_dump())


@router.post("/explain", summary="Direct Explainability (SHAP factor attribution)")
async def explain_direct(payload: DirectPredictInput):
    from app.inference.ml_model_bridge import predict_project_inputs
    res = predict_project_inputs(payload.model_dump())
    return {
        "project_id": res["project_id"],
        "delay_probability": res["delay_probability"],
        "risk_tier": res["risk_level"].upper(),
        "top_risk_drivers": [
            {
                "feature": f["feature"],
                "impact_score": f["impact"],
                "direction": f["direction"],
                "description": f["label"],
            }
            for f in res["factor_attributions"]
        ],
        "timestamp": res["timestamp"],
    }


@router.post("/projects/{id}/predict", summary="Execute Kaggle ML inference pipeline and persist prediction")
async def predict_project_risk(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Executes the finalized Kaggle-trained model pipeline for a project.
    Validates feature schema, predicts delay probability, maps risk level,
    and records factor attribution to the database.
    """
    return await PredictionService.predict_project(db, id, current_user)


@router.get("/projects/{id}/risk", summary="Get latest risk assessment and delay probability")
async def get_project_risk(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    history = await PredictionService.get_project_risk_history(db, id, current_user)
    return {
        "projectId": history["projectId"],
        "projectName": history["projectName"],
        "currentRiskLevel": history["currentRiskLevel"],
        "currentProbability": history["currentProbability"],
    }


@router.get("/projects/{id}/risk-history", summary="Retrieve chronological prediction trajectory (Day 30 to Day 150)")
async def get_project_risk_history(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns the trajectory of historical predictions over time, enabling
    the frontend to render risk trend charts and trajectory visualizations.
    """
    return await PredictionService.get_project_risk_history(db, id, current_user)


@router.get("/projects/{id}/risk/explanation", summary="Retrieve SHAP factor attribution breakdown")
async def get_project_risk_explanation(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns explainable AI factor impact values indicating how features
    contributed to the model prediction (non-causal framing).
    """
    return await PredictionService.get_project_explanation(db, id, current_user)


@router.post("/predictions/batch", summary="Batch predict risk for multiple infrastructure corridors")
async def batch_predict(
    body: BatchPredictRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Executes bounded batch inference across selected projects.
    """
    results = []
    for pid in body.project_ids:
        try:
            res = await PredictionService.predict_project(db, pid, current_user)
            results.append({"projectId": pid, "status": "success", "result": res})
        except Exception as e:
            results.append({"projectId": pid, "status": "error", "message": str(e)})

    return {"total": len(body.project_ids), "evaluations": results}
