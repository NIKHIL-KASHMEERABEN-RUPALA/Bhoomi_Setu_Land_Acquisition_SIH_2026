"""
BhoomiSetu — Production Inference & TreeSHAP Attribution Engine
High-throughput prediction for 90-day critical delay probability with multi-horizon risk trajectory
Team: Quorum Intelligence | Problem Statement ID: SIH26016
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, Any, List, Union, Optional
import numpy as np
import pandas as pd
import joblib

# Make local imports work when running as script
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ml.config import (
    MODEL_PATH,
    PREPROCESSOR_PATH,
    SHAP_EXPLAINER_PATH,
    METADATA_PATH,
    FEATURE_NAMES_PATH,
    RISK_BANDS,
)
from ml.feature_engineering import engineer_features

# Global memory cache for fast warm-start API calls
_CACHED_MODEL = None
_CACHED_PREPROCESSOR = None
_CACHED_EXPLAINER = None
_CACHED_METADATA = None
_CACHED_FEATURE_NAMES = None


def load_artifacts():
    """
    Loads all serialized production ML artifacts into memory with caching.
    """
    global _CACHED_MODEL, _CACHED_PREPROCESSOR, _CACHED_EXPLAINER, _CACHED_METADATA, _CACHED_FEATURE_NAMES

    if _CACHED_MODEL is not None and _CACHED_PREPROCESSOR is not None:
        return _CACHED_MODEL, _CACHED_PREPROCESSOR, _CACHED_EXPLAINER, _CACHED_METADATA, _CACHED_FEATURE_NAMES

    # Load Model
    if MODEL_PATH.exists():
        _CACHED_MODEL = joblib.load(MODEL_PATH)
    else:
        raise FileNotFoundError(f"Model artifact not found at {MODEL_PATH}")

    # Load Preprocessor
    if PREPROCESSOR_PATH.exists():
        _CACHED_PREPROCESSOR = joblib.load(PREPROCESSOR_PATH)
    elif hasattr(_CACHED_MODEL, "named_steps") and "preprocessor" in _CACHED_MODEL.named_steps:
        _CACHED_PREPROCESSOR = _CACHED_MODEL.named_steps["preprocessor"]
    else:
        _CACHED_PREPROCESSOR = None

    # Load SHAP Explainer
    if SHAP_EXPLAINER_PATH.exists():
        try:
            _CACHED_EXPLAINER = joblib.load(SHAP_EXPLAINER_PATH)
        except Exception:
            _CACHED_EXPLAINER = None

    # Load Feature Names
    if FEATURE_NAMES_PATH.exists():
        try:
            with open(FEATURE_NAMES_PATH, "r", encoding="utf-8") as f:
                _CACHED_FEATURE_NAMES = json.load(f)
        except Exception:
            _CACHED_FEATURE_NAMES = None

    # Load Metadata
    if METADATA_PATH.exists():
        try:
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                _CACHED_METADATA = json.load(f)
        except Exception:
            _CACHED_METADATA = {}

    return _CACHED_MODEL, _CACHED_PREPROCESSOR, _CACHED_EXPLAINER, _CACHED_METADATA, _CACHED_FEATURE_NAMES


def get_risk_band(probability: float) -> str:
    """Maps probability to Low, Moderate, High, or Critical risk band."""
    if probability < 0.30:
        return "Low"
    elif probability < 0.50:
        return "Moderate"
    elif probability < 0.75:
        return "High"
    else:
        return "Critical"


def compute_risk_trajectory(p90: float, days_in_stage: float, pendency_pct: float) -> Dict[str, float]:
    """
    Simulates Day 30, Day 60, and Day 90 risk accumulation trajectory based on
    current stagnation velocity and pending compensation friction.
    """
    # Baseline growth dynamics
    friction_factor = 1.0 + (pendency_pct / 200.0) + min(days_in_stage / 180.0, 0.5)
    
    # Day 30 is short horizon, dampens towards baseline
    d30 = float(np.clip(p90 * 0.78 * friction_factor, 0.05, 0.99))
    # Day 60 is mid horizon
    d60 = float(np.clip(p90 * 0.90 * friction_factor, 0.08, 0.99))
    # Day 90 is full horizon probability
    d90 = float(np.clip(p90, 0.05, 0.99))

    # Ensure strictly non-decreasing trajectory
    d60 = max(d30, d60)
    d90 = max(d60, d90)

    return {
        "day_30": round(d30, 4),
        "day_60": round(d60, 4),
        "day_90": round(d90, 4),
    }


def generate_recommended_actions(
    raw_input: Dict[str, Any],
    top_drivers: List[Dict[str, Any]],
    risk_band: str,
) -> List[str]:
    """
    Generates tailored, actionable statutory interventions under RFCTLARR Act 2013.
    """
    actions = []

    # Priority 1: High pending compensation
    comp_pending = float(raw_input.get("compensation_pending_pct", 0) or 0)
    if comp_pending > 40.0:
        actions.append(
            f"Convene Special DBT Disbursement Camp in district to release pending {comp_pending:.1f}% compensation tranches directly to verified Aadhaar-linked accounts."
        )

    # Priority 2: Court cases / legal writs
    court_cases = int(raw_input.get("court_case_count", 0) or 0)
    if court_cases > 0:
        actions.append(
            f"Escalate {court_cases} active High Court / Land Acquisition Tribunal cases to State Legal Task Force for expedited counter-affidavit filing within 7 days."
        )

    # Priority 3: Possession Deficit / RoW
    possession_pct = float(raw_input.get("possession_pct", 0) or 0)
    if possession_pct < 60.0:
        actions.append(
            f"Physical possession stands at only {possession_pct:.1f}%. Mobilize joint Revenue-NHAI/Agency survey team to secure encumbrance-free contiguous Right-of-Way."
        )

    # Priority 4: Public Objections / R&R Grievances
    objections = int(raw_input.get("public_objection_count", 0) or 0)
    rr_grievances = int(raw_input.get("rr_grievances", 0) or 0)
    if objections > 10 or rr_grievances > 5:
        actions.append(
            f"Schedule mauza-level grievance redressal hearing with Village Gram Sabha to resolve {objections} pending objections and {rr_grievances} R&R disputes."
        )

    # Priority 5: Stage Stagnation
    days_stage = int(raw_input.get("days_in_current_stage", 0) or 0)
    if days_stage > 60:
        actions.append(
            f"Project has stagnated in current stage for {days_stage} days (exceeds SLA). District Collector to issue Section 19/23 administrative compliance notice."
        )

    if not actions:
        if risk_band in ["High", "Critical"]:
            actions.append("Establish District Collector Task Force for daily milestone review and interdepartmental clearances.")
        else:
            actions.append("Maintain routine statutory timeline monitoring and bi-weekly milestone audit.")

    return actions


def compute_shap_explanations(
    model: Any,
    explainer: Any,
    transformed_row: np.ndarray,
    feature_names: List[str],
    top_k: int = 5,
) -> List[Dict[str, Any]]:
    """
    Computes local TreeSHAP factor attributions or fast Tree feature-weight attributions.
    """
    shap_drivers = []

    if explainer is not None:
        try:
            # TreeSHAP computation
            shap_values = explainer.shap_values(transformed_row)
            if isinstance(shap_values, list):
                # Binary classification: index 1 corresponds to positive critical delay
                vals = np.array(shap_values[1] if len(shap_values) > 1 else shap_values[0]).flatten()
            else:
                vals = np.array(shap_values).flatten()

            total_abs = np.sum(np.abs(vals)) + 1e-6
            top_indices = np.argsort(np.abs(vals))[::-1][:top_k]

            for idx in top_indices:
                feat_name = feature_names[idx] if idx < len(feature_names) else f"feature_{idx}"
                s_val = float(vals[idx])
                contrib = round(float((abs(s_val) / total_abs) * 100), 2)
                shap_drivers.append({
                    "feature": feat_name,
                    "shap_value": round(s_val, 4),
                    "contribution_pct": contrib,
                    "direction": "increases_risk" if s_val > 0 else "decreases_risk",
                })
            return shap_drivers
        except Exception:
            pass

    # Heuristic fallback if explainer not loaded
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
        top_indices = np.argsort(importances)[::-1][:top_k]
        total_imp = np.sum(importances[top_indices]) + 1e-6
        for idx in top_indices:
            feat_name = feature_names[idx] if idx < len(feature_names) else f"feature_{idx}"
            imp = float(importances[idx])
            shap_drivers.append({
                "feature": feat_name,
                "shap_value": round(imp, 4),
                "contribution_pct": round(float((imp / total_imp) * 100), 2),
                "direction": "increases_risk",
            })

    return shap_drivers


def predict_delay_risk(raw_input: Union[Dict[str, Any], pd.DataFrame]) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Production inference function.
    Accepts a single raw project input dictionary or a DataFrame of multiple projects.

    Returns structured inference output with delay probability, risk band,
    trajectory, TreeSHAP drivers, and actionable recommendations.
    """
    model, preprocessor, explainer, metadata, feature_names = load_artifacts()

    # Determine batch vs single
    is_single = isinstance(raw_input, dict)
    if is_single:
        input_df = pd.DataFrame([raw_input])
    else:
        input_df = raw_input.copy()

    # 1. Feature Engineering
    engineered_df = engineer_features(input_df)

    # 2. Preprocessing
    if preprocessor is not None:
        X_trans = preprocessor.transform(engineered_df)
    elif hasattr(model, "predict_proba"):
        # Model pipeline itself includes preprocessor
        X_trans = engineered_df
    else:
        raise RuntimeError("Neither standalone preprocessor nor pipeline preprocessor is available.")

    # 3. Model Inference
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(X_trans)[:, 1]
    else:
        # Pipeline predict
        probabilities = model.predict(X_trans)

    # Ensure feature names are aligned
    if feature_names is None:
        if hasattr(preprocessor, "get_feature_names_out"):
            try:
                feature_names = preprocessor.get_feature_names_out().tolist()
            except Exception:
                feature_names = [f"f_{i}" for i in range(X_trans.shape[1])]
        else:
            feature_names = [f"f_{i}" for i in range(X_trans.shape[1])]

    results = []
    for i in range(len(input_df)):
        p = float(probabilities[i])
        band = get_risk_band(p)
        raw_row = input_df.iloc[i].to_dict()

        # Days in stage & pendency for trajectory
        days_stage = float(raw_row.get("days_in_current_stage", 0) or 0)
        pendency_pct = float(raw_row.get("compensation_pending_pct", 0) or 0)
        trajectory = compute_risk_trajectory(p, days_stage, pendency_pct)

        # TreeSHAP drivers
        row_vec = X_trans[i:i+1] if isinstance(X_trans, np.ndarray) else X_trans.iloc[i:i+1]
        shap_drivers = compute_shap_explanations(
            model=model,
            explainer=explainer,
            transformed_row=row_vec,
            feature_names=feature_names,
            top_k=5,
        )

        # Recommended actions
        actions = generate_recommended_actions(raw_row, shap_drivers, band)

        project_id = str(raw_row.get("project_id", f"PRJ_{i+1:04d}"))

        result_payload = {
            "project_id": project_id,
            "delay_probability": round(p, 4),
            "risk_band": band,
            "risk_trajectory": trajectory,
            "top_shap_drivers": shap_drivers,
            "recommended_actions": actions,
        }
        results.append(result_payload)

    return results[0] if is_single else results


if __name__ == "__main__":
    # Test sample execution
    sample_project = {
        "project_id": "PRJ_DELHI_MUMBAI_EXP",
        "state": "Gujarat",
        "district": "Gujarat_Dist_04",
        "project_type": "Highway",
        "acquisition_stage": "Compensation Disbursement",
        "project_cost": 450.0,
        "project_length_km": 38.5,
        "land_required_hectares": 120.0,
        "land_acquired_pct": 35.0,
        "land_pending_pct": 65.0,
        "possession_pct": 18.0,
        "row_available_pct": 22.0,
        "compensation_awarded_amount": 180.0,
        "compensation_paid_amount": 70.0,
        "compensation_pending_amount": 110.0,
        "compensation_pending_pct": 61.1,
        "court_case_count": 6,
        "legal_case_count": 12,
        "public_objection_count": 14,
        "days_in_current_stage": 75,
        "days_since_notification": 210,
    }

    try:
        output = predict_delay_risk(sample_project)
        print("=== BHOOMISETU PREDICTION ENGINE TEST ===")
        print(json.dumps(output, indent=2))
    except Exception as e:
        print(f"Prediction test note: {e}")
