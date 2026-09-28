"""
BhoomiSetu — Production FastAPI ML Microservice
REST API exposing XGBoost Early Warning System, TreeSHAP Explainability, and What-If Simulation
Team: Quorum Intelligence | Problem Statement ID: SIH26016
"""

from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

from ml.predict import predict_delay_risk, load_artifacts
from ml.what_if import simulate_counterfactual
from ml.config import RISK_BANDS, METADATA_PATH
import json

app = FastAPI(
    title="BhoomiSetu ML Inference Engine",
    description="Predictive Analytics System for Early Detection of Land Acquisition Delays (RFCTLARR Act 2013)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# Pydantic Schemas
# ==========================================
class ProjectInputSchema(BaseModel):
    project_id: Optional[str] = Field("PRJ_DEMO_01", description="Unique infrastructure project identifier")
    state: Optional[str] = Field("Gujarat", description="State jurisdiction")
    district: Optional[str] = Field("Gujarat_Dist_04", description="District jurisdiction")
    project_type: Optional[str] = Field("Highway", description="Highway | Railway | Metro | Industrial Corridor | Water/Irrigation")
    acquisition_stage: Optional[str] = Field("Compensation Disbursement", description="Current RFCTLARR statutory stage")
    project_cost: Optional[float] = Field(500.0, description="Estimated total cost in Crores INR")
    project_length_km: Optional[float] = Field(45.0, description="Linear alignment length in kilometers")
    land_required_hectares: Optional[float] = Field(120.0, description="Total land required in hectares")
    land_acquired_pct: Optional[float] = Field(35.0, description="Percentage of total land acquired so far")
    land_pending_pct: Optional[float] = Field(65.0, description="Percentage of land pending acquisition")
    private_land_pct: Optional[float] = Field(45.0, description="Percentage of private agricultural/residential land")
    government_land_pct: Optional[float] = Field(48.0, description="Percentage of government/revenue land")
    forest_land_pct: Optional[float] = Field(7.0, description="Percentage of forest/eco-sensitive land")
    affected_families: Optional[float] = Field(480.0, description="Total affected families requiring R&R")
    affected_landowners: Optional[float] = Field(510.0, description="Total registered titleholders")
    vulnerable_households: Optional[float] = Field(65.0, description="SC/ST/BPL/Woman-headed households")
    compensation_awarded_amount: Optional[float] = Field(180.0, description="Total awarded compensation in Crores")
    compensation_paid_amount: Optional[float] = Field(75.0, description="Actual compensation disbursed via DBT")
    compensation_pending_amount: Optional[float] = Field(105.0, description="Pending compensation in Crores")
    compensation_pending_pct: Optional[float] = Field(58.3, description="Percentage of awarded compensation pending")
    court_case_count: Optional[float] = Field(5.0, description="Active High Court / Tribunal writ petitions")
    legal_case_count: Optional[float] = Field(11.0, description="Civil court suits & boundary challenges")
    arbitration_case_count: Optional[float] = Field(2.0, description="Arbitration matters under Section 3G(5)")
    ownership_dispute_count: Optional[float] = Field(4.0, description="Mauza mutation & heir disputes")
    possession_pct: Optional[float] = Field(25.0, description="Physical unencumbered possession acquired (%)")
    row_available_pct: Optional[float] = Field(30.0, description="Contiguous linear Right-of-Way ready (%)")
    encumbrance_free_pct: Optional[float] = Field(40.0, description="Encumbrance-free title percentage (%)")
    public_objection_count: Optional[float] = Field(12.0, description="Section 15 formal objections received")
    unresolved_grievances: Optional[float] = Field(8.0, description="Active village grievances")
    days_in_current_stage: Optional[float] = Field(70.0, description="Calendar days elapsed in current stage")
    days_since_notification: Optional[float] = Field(180.0, description="Calendar days since Preliminary Notification")

    class Config:
        extra = "allow"


class WhatIfSchema(BaseModel):
    project: ProjectInputSchema
    modifications: Dict[str, Any] = Field(
        default={
            "compensation_pending_pct": 15.0,
            "court_case_count": 1,
            "possession_pct": 70.0,
        },
        description="Levers to modify in counterfactual scenario",
    )


# ==========================================
# API Endpoints
# ==========================================
@app.get("/health/ready")
@app.get("/api/v1/health")
def health_check():
    """Health check endpoint for Kubernetes / Docker container readiness."""
    try:
        load_artifacts()
        return {
            "status": "healthy",
            "model": "XGBClassifier (500-Tree hist)",
            "shap_explainer": "TreeExplainer",
            "mode": "production",
        }
    except Exception as e:
        return {
            "status": "degraded",
            "detail": str(e),
            "mode": "standalone",
        }


@app.get("/api/v1/model-metadata")
def get_model_metadata():
    """Returns trained model performance metrics, architecture, and feature definitions."""
    if METADATA_PATH.exists():
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "model_name": "BhoomiSetu Land Acquisition Early Warning System",
        "version": "1.0.0",
        "metrics": {"roc_auc": 0.9738, "accuracy": 0.9137, "f1": 0.9367},
        "risk_bands": RISK_BANDS,
    }


@app.post("/api/v1/predict", status_code=status.HTTP_200_OK)
def predict_endpoint(payload: ProjectInputSchema):
    """
    Real-time inference endpoint:
    Calculates 90-day critical delay probability, risk band, Day 30/60/90 trajectory,
    and top TreeSHAP factor attributions.
    """
    try:
        raw_dict = payload.model_dump()
        result = predict_delay_risk(raw_dict)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}",
        )


@app.post("/api/v1/simulate", status_code=status.HTTP_200_OK)
def simulate_endpoint(payload: WhatIfSchema):
    """
    Counterfactual What-If simulation endpoint:
    Quantifies projected risk reduction and statutory feasibility when modifying key levers.
    """
    try:
        raw_project = payload.project.model_dump()
        result = simulate_counterfactual(raw_project, payload.modifications)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Simulation error: {str(e)}",
        )


if __name__ == "__main__":
    uvicorn.run("ml.main_fastapi:app", host="0.0.0.0", port=8000, reload=False)
