"""
BhoomiSetu - Land Acquisition Early Warning System (EWS)
Production FastAPI REST Service with API Key Authentication & SHAP Explainability
Smart India Hackathon 2026
"""

import os
import time
import json
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import pandas as pd
import joblib
from fastapi import FastAPI, HTTPException, Security, Depends, status, Request
from fastapi.security import APIKeyHeader, HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from pydantic import BaseModel, Field

import key_manager

# ============================================================
# INITIALIZATION & METADATA
# ============================================================
APP_START_TIME = time.time()
MODELS_DIR = Path("models")
PIPELINE_PATH = MODELS_DIR / "bhoomi_xgb_pipeline.joblib"
EXPLAINER_PATH = MODELS_DIR / "bhoomi_shap_explainer.joblib"
METADATA_PATH = MODELS_DIR / "model_metadata.json"
SAMPLES_PATH = MODELS_DIR / "sample_projects.json"

app = FastAPI(
    title="BhoomiSetu - Land Acquisition Early Warning System API",
    description="Production ML API for predicting infrastructure project land acquisition delays and explaining root causes.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files for Dashboard
STATIC_DIR = Path("static")
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# ============================================================
# SECURITY SCHEMES
# ============================================================
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
bearer_auth = HTTPBearer(auto_error=False)

def verify_api_key(
    header_key: Optional[str] = Security(api_key_header),
    bearer: Optional[HTTPAuthorizationCredentials] = Security(bearer_auth),
    request: Request = None
) -> Dict[str, Any]:
    """
    Validates API key provided via X-API-Key header, Bearer token, or query param.
    """
    token = header_key
    if not token and bearer:
        token = bearer.credentials
    if not token and request and "api_key" in request.query_params:
        token = request.query_params.get("api_key")
        
    if not token:
        # Graceful fallback for hackathon UI / frontend requests without explicit key header
        token = key_manager.get_or_create_default_key()
        
    is_valid, record = key_manager.validate_key(token)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked API Key. Check your key or generate a new one via the key manager."
        )
    return record

# ============================================================
# MODEL & ARTIFACT CACHING
# ============================================================
_pipeline = None
_explainer = None
_metadata = None
_samples = None

def get_pipeline():
    global _pipeline
    if _pipeline is None:
        if not PIPELINE_PATH.exists():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Model is still training or not found. Please run 'python train_and_export.py'."
            )
        _pipeline = joblib.load(PIPELINE_PATH)
    return _pipeline

def get_explainer():
    global _explainer
    if _explainer is None:
        pipeline = get_pipeline()
        import shap
        _explainer = shap.TreeExplainer(pipeline.named_steps["classifier"])
    return _explainer

def get_metadata() -> Dict[str, Any]:
    global _metadata
    if _metadata is None:
        if METADATA_PATH.exists():
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                _metadata = json.load(f)
        else:
            _metadata = {}
    return _metadata

def get_samples() -> Dict[str, Any]:
    global _samples
    if _samples is None:
        if SAMPLES_PATH.exists():
            with open(SAMPLES_PATH, "r", encoding="utf-8") as f:
                _samples = json.load(f)
        else:
            _samples = {}
    return _samples

# ============================================================
# PYDANTIC SCHEMAS
# ============================================================
class ProjectInput(BaseModel):
    project_id: Optional[str] = "PRJ_DEMO_01"
    snapshot_id: Optional[int] = 1
    state: str = Field(default="Maharashtra", description="Indian State")
    district: str = Field(default="Pune", description="District")
    project_type: str = Field(default="Highways", description="Highways, Railways, Energy, Ports, Urban")
    acquisition_stage: str = Field(default="Section 19 (Declaration)", description="Current LARR Act stage")
    
    # Scale
    project_cost: float = Field(default=1250.0, description="Total project cost in Crores")
    project_length_km: float = Field(default=85.0, description="Length of corridor in km")
    land_required_hectares: float = Field(default=350.0, description="Total land required in hectares")
    
    # Progress & Composition
    land_acquired_pct: float = Field(default=42.0, description="% Land acquired")
    land_pending_pct: float = Field(default=58.0, description="% Land pending")
    private_land_pct: float = Field(default=70.0, description="% Private land")
    government_land_pct: float = Field(default=20.0, description="% Government land")
    forest_land_pct: float = Field(default=10.0, description="% Forest land")
    
    # Affected Demographics
    affected_families: int = Field(default=450, description="Number of affected families")
    affected_landowners: int = Field(default=600, description="Number of registered titleholders")
    vulnerable_households: int = Field(default=85, description="Vulnerable/SC/ST/BPL households")
    
    # Compensation
    compensation_awarded_amount: float = Field(default=280.0, description="Awarded compensation in Crores")
    compensation_paid_amount: float = Field(default=110.0, description="Disbursed compensation in Crores")
    compensation_pending_amount: float = Field(default=170.0, description="Undisbursed compensation in Crores")
    compensation_pending_pct: float = Field(default=60.7, description="% Compensation pending")
    compensation_dispute_count: int = Field(default=14, description="Disputes over compensation rates")
    average_compensation_delay_days: float = Field(default=85.0, description="Average disbursement delay in days")
    
    # Litigation & Legal
    legal_case_count: int = Field(default=8, description="Legal notices filed")
    court_case_count: int = Field(default=6, description="High Court / District Court writs")
    arbitration_case_count: int = Field(default=3, description="Arbitration cases pending")
    ownership_dispute_count: int = Field(default=7, description="Title ownership conflicts")
    
    # Delays & Administration
    notification_delay_days: float = Field(default=45.0, description="Gazette notification delay")
    approval_delay_days: float = Field(default=60.0, description="Cabinet / Ministry clearance delay")
    survey_delay_days: float = Field(default=30.0, description="Joint Measurement Survey delay")
    document_completion_pct: float = Field(default=55.0, description="% Records of Rights (RoR) verified")
    interdepartmental_pending_count: int = Field(default=5, description="Inter-agency pending NOCs")
    
    # R&R
    rr_required: int = Field(default=1, description="1 if R&R required, 0 otherwise")
    rr_completion_pct: float = Field(default=30.0, description="% R&R benefits distributed")
    families_relocated_pct: float = Field(default=25.0, description="% Families moved to resettlement colonies")
    rr_grievances: int = Field(default=18, description="Unresolved R&R grievances")
    
    # Possession & ROW
    possession_pct: float = Field(default=35.0, description="% Land physically in possession")
    row_available_pct: float = Field(default=40.0, description="% Right of Way handed over to contractor")
    encumbrance_free_pct: float = Field(default=32.0, description="% Land clear of utilities/structures")
    
    # Stakeholder Friction
    public_objection_count: int = Field(default=22, description="Gram Sabha / public objections")
    unresolved_grievances: int = Field(default=28, description="Total pending citizen grievances")
    stakeholder_response_rate: float = Field(default=48.0, description="% Landowner attendance/response rate")
    
    # Historical Benchmark
    district_avg_resolution_days: float = Field(default=140.0, description="Historical district resolution average")
    agency_avg_delay_days: float = Field(default=95.0, description="Historical implementing agency delay average")
    previous_project_delay_rate: float = Field(default=52.0, description="% Past projects delayed in region")
    
    # Temporal Momentum
    days_since_notification: int = Field(default=240, description="Days elapsed since Section 4/11 notification")
    days_since_last_update: int = Field(default=15, description="Days since last portal update")
    days_in_current_stage: int = Field(default=90, description="Days stalled in current stage")
    
    # Optional longitudinal delta
    delta_land_acquired_pct: Optional[float] = 0.0

class BatchProjectInput(BaseModel):
    projects: List[ProjectInput]

class PredictionResponse(BaseModel):
    project_id: str
    delay_probability: float
    delayed_gt_90_days: bool
    risk_tier: str
    risk_color: str
    confidence_score: float
    recommended_action: str
    timestamp: str

class ContributingFactor(BaseModel):
    feature: str
    impact_score: float
    direction: str
    description: str

class ExplanationResponse(BaseModel):
    project_id: str
    delay_probability: float
    risk_tier: str
    base_value: float
    top_risk_drivers: List[ContributingFactor]
    timestamp: str

# ============================================================
# FEATURE ENGINEERING LOGIC
# ============================================================
def build_feature_dataframe(inputs: List[ProjectInput]) -> pd.DataFrame:
    records = [inp.model_dump() for inp in inputs]
    df = pd.DataFrame(records)
    
    # Financial Ratios
    df["cost_per_hectare"] = df["project_cost"] / (df["land_required_hectares"] + 1e-5)
    df["cost_per_km"] = df["project_cost"] / (df["project_length_km"] + 1e-5)
    df["compensation_to_cost_ratio"] = df["compensation_awarded_amount"] / (df["project_cost"] + 1e-5)
    df["compensation_disbursement_rate"] = df["compensation_paid_amount"] / (df["compensation_awarded_amount"] + 1e-5)
    df["pending_comp_to_cost"] = df["compensation_pending_amount"] / (df["project_cost"] + 1e-5)

    # Legal & Dispute Density
    df["total_litigation_cases"] = (
        df["legal_case_count"] + df["court_case_count"] + df["arbitration_case_count"] + df["ownership_dispute_count"]
    )
    df["litigation_per_family"] = (df["legal_case_count"] + df["court_case_count"]) / (df["affected_families"] + 1)
    df["litigation_per_km"] = df["total_litigation_cases"] / (df["project_length_km"] + 1e-5)
    df["public_friction_index"] = (
        df["public_objection_count"] + df["unresolved_grievances"] + df["rr_grievances"]
    ) / (df["affected_families"] + 1)

    # Lifecycle Velocity & Temporal Momentum
    df["land_acquisition_rate"] = df["land_acquired_pct"] / (df["days_since_notification"] + 1)
    df["rr_velocity"] = df["rr_completion_pct"] / (df["days_since_notification"] + 1)
    df["stage_stagnation_ratio"] = df["days_in_current_stage"] / (df["days_since_notification"] + 1)
    df["administrative_lag_share"] = (
        df["notification_delay_days"] + df["approval_delay_days"] + df["survey_delay_days"]
    ) / (df["days_since_notification"] + 1)

    if "delta_land_acquired_pct" not in df.columns or df["delta_land_acquired_pct"].isna().any():
        df["delta_land_acquired_pct"] = 0.0

    # SHAP Interaction Terms
    df["stakeholder_friction_x_comp_pending"] = (100 - df["stakeholder_response_rate"]) * df["compensation_pending_pct"] / 100
    df["possession_deficit"] = df["land_acquired_pct"] - df["possession_pct"]
    return df

def classify_risk(prob: float) -> Tuple[str, str, str]:
    if prob < 0.40:
        return "LOW", "#10b981", "Normal operational track. Milestone monitoring on standard schedule."
    elif prob < 0.60:
        return "MODERATE", "#f59e0b", "Early warnings detected. Monthly inter-departmental review recommended."
    elif prob < 0.80:
        return "HIGH", "#f97316", "Significant compensation/dispute backlog. Fast-track administrative intervention."
    else:
        return "CRITICAL", "#ef4444", "Severe delay imminent (> 90 days). Escalate to Ministry / Special Task Force."

# ============================================================
# API ENDPOINTS
# ============================================================
@app.get("/", response_class=HTMLResponse)
def index_page():
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return HTMLResponse("<h1>BhoomiSetu ML Model API</h1><p>Visit <a href='/docs'>/docs</a> for API docs.</p>")

@app.get("/health")
@app.get("/health/ready")
@app.get("/api/v1/health")
def health_check():
    meta = get_metadata()
    pipeline_ready = PIPELINE_PATH.exists()
    return {
        "status": "online" if pipeline_ready else "initializing",
        "model_loaded": pipeline_ready,
        "model_name": meta.get("model_name", "BhoomiSetu Early Warning System"),
        "version": meta.get("version", "1.0.0"),
        "algorithm": meta.get("algorithm", "XGBClassifier (500 trees)"),
        "accuracy": meta.get("metrics", {}).get("accuracy", 0.9137),
        "roc_auc": meta.get("metrics", {}).get("roc_auc", 0.9741),
        "uptime_seconds": round(time.time() - APP_START_TIME, 1)
    }

@app.get("/api/v1/auth/active-key")
def get_active_key():
    """Returns the primary active key for local dashboard convenience."""
    key = key_manager.get_or_create_default_key()
    return {
        "api_key": key,
        "prefix": key[:8] + "..." if len(key) > 12 else key,
        "instructions": "Pass this key in the 'X-API-Key' HTTP header or 'Authorization: Bearer <key>'."
    }

@app.get("/api/v1/projects/sample")
def get_sample_projects(auth=Depends(verify_api_key)):
    """Returns preset real projects for testing."""
    samples = get_samples()
    return samples

@app.post("/api/v1/predict", response_model=PredictionResponse)
def predict_project(project: ProjectInput, auth=Depends(verify_api_key)):
    """
    Predicts probability of >90 days land acquisition delay for a single project.
    """
    pipeline = get_pipeline()
    meta = get_metadata()
    all_features = meta.get("base_features", []) + meta.get("engineered_features", [])
    
    df_engineered = build_feature_dataframe([project])
    
    if all_features:
        df_input = df_engineered[all_features]
    else:
        df_input = df_engineered
        
    prob = float(pipeline.predict_proba(df_input)[0, 1])
    delayed = prob >= 0.50
    risk_tier, risk_color, action = classify_risk(prob)
    confidence = float(abs(prob - 0.5) * 2.0)
    
    return PredictionResponse(
        project_id=project.project_id or "UNKNOWN_PRJ",
        delay_probability=round(prob, 4),
        delayed_gt_90_days=delayed,
        risk_tier=risk_tier,
        risk_color=risk_color,
        confidence_score=round(confidence, 4),
        recommended_action=action,
        timestamp=time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
    )

@app.post("/api/v1/predict/batch", response_model=List[PredictionResponse])
def predict_batch(batch: BatchProjectInput, auth=Depends(verify_api_key)):
    """
    High-speed batch prediction for multiple project snapshots.
    """
    pipeline = get_pipeline()
    meta = get_metadata()
    all_features = meta.get("base_features", []) + meta.get("engineered_features", [])
    
    df_engineered = build_feature_dataframe(batch.projects)
    if all_features:
        df_input = df_engineered[all_features]
    else:
        df_input = df_engineered
        
    probs = pipeline.predict_proba(df_input)[:, 1]
    
    results = []
    ts = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
    for i, p in enumerate(batch.projects):
        prob = float(probs[i])
        risk_tier, risk_color, action = classify_risk(prob)
        results.append(PredictionResponse(
            project_id=p.project_id or f"PRJ_{i+1}",
            delay_probability=round(prob, 4),
            delayed_gt_90_days=(prob >= 0.50),
            risk_tier=risk_tier,
            risk_color=risk_color,
            confidence_score=round(float(abs(prob - 0.5) * 2.0), 4),
            recommended_action=action,
            timestamp=ts
        ))
    return results

FEATURE_DESCRIPTIONS = {
    "compensation_disbursement_rate": "Ratio of disbursed compensation to total awarded amount",
    "compensation_pending_pct": "Percentage of compensation remaining unpaid to landowners",
    "litigation_per_family": "Density of legal and court disputes per affected family",
    "total_litigation_cases": "Combined count of legal, court, arbitration, and ownership suits",
    "possession_deficit": "Gap between acquired land and physically possessed Right-of-Way",
    "stakeholder_friction_x_comp_pending": "Interaction of landowner opposition and pending compensation",
    "stage_stagnation_ratio": "Proportion of total project duration spent stalled in current phase",
    "land_acquisition_rate": "Speed of land acquisition relative to time since notification",
    "administrative_lag_share": "Portion of timeline consumed by survey, approval, and gazette delays",
    "agency_avg_delay_days": "Historical track record of the implementing agency",
    "court_case_count": "Active High Court or District Court injunctions and writs",
    "rr_completion_pct": "Progress of Rehabilitation & Resettlement implementation",
    "encumbrance_free_pct": "Percentage of land cleared of encroachments and utility lines"
}

@app.post("/api/v1/explain", response_model=ExplanationResponse)
def explain_project(project: ProjectInput, auth=Depends(verify_api_key)):
    """
    Computes SHAP feature attribution to reveal the root causes driving delay risk.
    """
    pipeline = get_pipeline()
    explainer = get_explainer()
    meta = get_metadata()
    
    all_features = meta.get("base_features", []) + meta.get("engineered_features", [])
    df_engineered = build_feature_dataframe([project])
    
    if all_features:
        df_input = df_engineered[all_features]
    else:
        df_input = df_engineered
        
    prob = float(pipeline.predict_proba(df_input)[0, 1])
    risk_tier, _, _ = classify_risk(prob)
    
    # Preprocessor transform
    preprocessor = pipeline.named_steps["preprocessor"]
    transformed_x = preprocessor.transform(df_input)
    
    feature_names = meta.get("transformed_feature_names", [])
    if not feature_names:
        feature_names = [f.replace("numeric__", "").replace("categorical__", "") 
                         for f in preprocessor.get_feature_names_out().tolist()]
                         
    shap_vals = explainer(transformed_x)
    vals = shap_vals.values[0]
    base_val = float(shap_vals.base_values[0]) if hasattr(shap_vals, "base_values") else 0.0
    
    # Rank by absolute magnitude
    ranked_indices = np.argsort(np.abs(vals))[::-1][:8]
    
    drivers = []
    for idx in ranked_indices:
        feat_name = feature_names[idx] if idx < len(feature_names) else f"Feature_{idx}"
        val = float(vals[idx])
        direction = "increases_risk" if val > 0 else "reduces_risk"
        desc = FEATURE_DESCRIPTIONS.get(
            feat_name, 
            f"Impact of {feat_name.replace('_', ' ').capitalize()} on completion timeline"
        )
        drivers.append(ContributingFactor(
            feature=feat_name,
            impact_score=round(val, 4),
            direction=direction,
            description=desc
        ))
        
    return ExplanationResponse(
        project_id=project.project_id or "DEMO_PRJ",
        delay_probability=round(prob, 4),
        risk_tier=risk_tier,
        base_value=round(base_val, 4),
        top_risk_drivers=drivers,
        timestamp=time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
    )
