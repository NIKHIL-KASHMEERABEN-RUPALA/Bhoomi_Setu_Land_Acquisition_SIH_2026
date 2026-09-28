"""
BhoomiSetu — Land Acquisition Early Warning System (EWS)
Configuration and Hyperparameters
Team: Quorum Intelligence | Problem Statement ID: SIH26016
"""

from pathlib import Path
from typing import List, Dict, Any

# ==========================================
# Paths & File Constants
# ==========================================
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

DATA_PATH = PROJECT_ROOT / "land_acquisition_master.csv"
ALT_DATA_PATH = PROJECT_ROOT / "land_acquisition_master-1.csv"
ARTIFACTS_DIR = PROJECT_ROOT / "models"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = ARTIFACTS_DIR / "bhoomi_xgb_pipeline.joblib"
PREPROCESSOR_PATH = ARTIFACTS_DIR / "bhoomi_preprocessor.joblib"
SHAP_EXPLAINER_PATH = ARTIFACTS_DIR / "bhoomi_shap_explainer.joblib"
FEATURE_NAMES_PATH = ARTIFACTS_DIR / "feature_names.json"
METADATA_PATH = ARTIFACTS_DIR / "model_metadata.json"
SAMPLE_PROJECTS_PATH = ARTIFACTS_DIR / "sample_projects.json"

# ==========================================
# Reproducibility & Random State
# ==========================================
RANDOM_SEED: int = 42
TEST_SIZE: float = 0.20
VALIDATION_SPLIT_STRATIFIED: bool = True

# ==========================================
# Target & Exclusion Column Names
# ==========================================
TARGET_COL: str = "delayed_gt_90_days"
AUXILIARY_TARGETS: List[str] = [
    "actual_completion_delay_days",
    "delay_severity",
    "most_likely_delay_stage",
]

IDENTIFIER_COLS: List[str] = [
    "project_id",
    "snapshot_id",
    "prediction_date",
    "source_type",
    "source_reference",
]

# ==========================================
# Raw Base Feature Sets
# ==========================================
CATEGORICAL_FEATURES: List[str] = [
    "state",
    "district",
    "project_type",
    "acquisition_stage",
]

NUMERICAL_BASE_FEATURES: List[str] = [
    "project_cost",
    "project_length_km",
    "land_required_hectares",
    "land_acquired_pct",
    "land_pending_pct",
    "private_land_pct",
    "government_land_pct",
    "forest_land_pct",
    "affected_families",
    "affected_landowners",
    "vulnerable_households",
    "compensation_awarded_amount",
    "compensation_paid_amount",
    "compensation_pending_amount",
    "compensation_pending_pct",
    "compensation_dispute_count",
    "average_compensation_delay_days",
    "legal_case_count",
    "court_case_count",
    "arbitration_case_count",
    "ownership_dispute_count",
    "notification_delay_days",
    "approval_delay_days",
    "survey_delay_days",
    "document_completion_pct",
    "interdepartmental_pending_count",
    "rr_required",
    "rr_completion_pct",
    "families_relocated_pct",
    "rr_grievances",
    "possession_pct",
    "row_available_pct",
    "encumbrance_free_pct",
    "public_objection_count",
    "unresolved_grievances",
    "stakeholder_response_rate",
    "district_avg_resolution_days",
    "agency_avg_delay_days",
    "previous_project_delay_rate",
    "days_since_notification",
    "days_since_last_update",
    "days_in_current_stage",
]

# ==========================================
# Engineered Interaction Features List
# ==========================================
ENGINEERED_FEATURES: List[str] = [
    "cost_per_hectare",
    "cost_per_family",
    "cost_per_km",
    "pending_compensation_ratio",
    "financial_stress_index",
    "total_active_cases",
    "litigation_density_per_family",
    "litigation_density_per_hectare",
    "litigation_severity_score",
    "public_friction_index",
    "dispute_resolution_lag",
    "stage_stagnation_ratio",
    "possession_deficit",
    "row_deficit",
    "friction_x_pending_comp",
    "possession_deficit_x_rr_deficit",
    "litigation_x_financial_stress",
    "administrative_latency_sum",
    "encumbrance_vulnerability_index",
    "vulnerability_ratio",
    "log_total_active_cases",
    "log_public_objection_count",
    "log_affected_families",
    "log_compensation_pending_amount",
]

# ==========================================
# Risk Band Thresholds
# ==========================================
RISK_BANDS: Dict[str, Dict[str, Any]] = {
    "Low": {
        "min": 0.0,
        "max": 0.30,
        "action": "Routine statutory tracking. Maintain scheduled joint measurement milestones.",
        "color": "#16A878",
    },
    "Moderate": {
        "min": 0.30,
        "max": 0.50,
        "action": "Early friction detected. Institute bi-weekly interdepartmental coordination hearings.",
        "color": "#D98A08",
    },
    "High": {
        "min": 0.50,
        "max": 0.75,
        "action": "Critical delay probable. Deploy Special Land Acquisition Officer (SLAO) task force to resolve pending awards & DBT tranches.",
        "color": "#F2A51A",
    },
    "Critical": {
        "min": 0.75,
        "max": 1.0,
        "action": "Severe statutory delay imminent (>90 days). Immediate District Collector & Ministry intervention; emergency dispute camp.",
        "color": "#E85D68",
    },
}

# ==========================================
# XGBoost Model Hyperparameters (Production)
# ==========================================
XGB_PARAMS: Dict[str, Any] = {
    "n_estimators": 500,
    "max_depth": 6,
    "learning_rate": 0.05,
    "subsample": 0.85,
    "colsample_bytree": 0.80,
    "min_child_weight": 3,
    "gamma": 0.1,
    "reg_alpha": 0.05,
    "reg_lambda": 1.0,
    "scale_pos_weight": 1.0,
    "tree_method": "hist",
    "random_state": RANDOM_SEED,
    "n_jobs": -1,
    "eval_metric": "logloss",
}
