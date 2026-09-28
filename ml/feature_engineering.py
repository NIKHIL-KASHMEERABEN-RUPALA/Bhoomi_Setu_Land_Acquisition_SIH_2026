"""
BhoomiSetu — Domain Feature Engineering Engine
RFCTLARR Act 2013 & Indian Infrastructure Land Acquisition Domain Logic
Team: Quorum Intelligence | Problem Statement ID: SIH26016
"""

from typing import Union, Dict, Any
import numpy as np
import pandas as pd


def engineer_features(raw_input: Union[pd.DataFrame, Dict[str, Any]]) -> pd.DataFrame:
    """
    Applies B.L.A.S.T. (Boundary, Legal, Administrative, Social, Tenure) feature engineering
    to extract 20+ high-value non-linear interaction features grounded in the RFCTLARR Act 2013.

    Parameters:
        raw_input: DataFrame or dictionary containing raw project acquisition parameters.

    Returns:
        pd.DataFrame with all original base features plus engineered domain interaction features.
    """
    if isinstance(raw_input, dict):
        df = pd.DataFrame([raw_input])
    else:
        df = raw_input.copy()

    # Ensure numeric columns are strictly float64
    numeric_cols = [
        "project_cost", "project_length_km", "land_required_hectares", "land_acquired_pct",
        "land_pending_pct", "private_land_pct", "government_land_pct", "forest_land_pct",
        "affected_families", "affected_landowners", "vulnerable_households",
        "compensation_awarded_amount", "compensation_paid_amount", "compensation_pending_amount",
        "compensation_pending_pct", "compensation_dispute_count", "average_compensation_delay_days",
        "legal_case_count", "court_case_count", "arbitration_case_count", "ownership_dispute_count",
        "notification_delay_days", "approval_delay_days", "survey_delay_days",
        "document_completion_pct", "interdepartmental_pending_count", "rr_required",
        "rr_completion_pct", "families_relocated_pct", "rr_grievances", "possession_pct",
        "row_available_pct", "encumbrance_free_pct", "public_objection_count",
        "unresolved_grievances", "stakeholder_response_rate", "district_avg_resolution_days",
        "agency_avg_delay_days", "previous_project_delay_rate", "days_since_notification",
        "days_since_last_update", "days_in_current_stage"
    ]

    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)
        else:
            df[col] = 0.0

    # Ensure categorical columns exist and are clean strings
    cat_cols = ["state", "district", "project_type", "acquisition_stage"]
    for col in cat_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()
        else:
            df[col] = "Unknown"

    eps = 1e-5

    # 1. Financial Exposure & Capital Intensity
    df["cost_per_hectare"] = df["project_cost"] / (df["land_required_hectares"] + eps)
    df["cost_per_family"] = df["project_cost"] / (df["affected_families"] + eps)
    df["cost_per_km"] = df["project_cost"] / (df["project_length_km"] + eps)
    df["pending_compensation_ratio"] = df["compensation_pending_amount"] / (df["compensation_awarded_amount"] + eps)

    # 2. Financial Stress Index (DBT Pendency x Delay Days vs District SLA)
    df["financial_stress_index"] = (df["compensation_pending_pct"] / 100.0) * (
        df["average_compensation_delay_days"] / (df["district_avg_resolution_days"] + eps)
    )

    # 3. Litigation Pressure & Legal Density
    df["total_active_cases"] = (
        df["legal_case_count"]
        + df["court_case_count"]
        + df["arbitration_case_count"]
        + df["ownership_dispute_count"]
    )
    df["litigation_density_per_family"] = df["total_active_cases"] / (df["affected_families"] + 1.0)
    df["litigation_density_per_hectare"] = df["total_active_cases"] / (df["land_required_hectares"] + 0.1)

    # High Court writs (court_case_count) have 3x severity over ordinary title claims
    df["litigation_severity_score"] = (
        df["court_case_count"] * 3.0
        + df["arbitration_case_count"] * 2.0
        + df["legal_case_count"] * 1.5
        + df["ownership_dispute_count"] * 1.0
    )

    # 4. Public Friction Index (Objections, Unresolved Grievances, R&R Dissatisfaction)
    df["public_friction_index"] = (
        df["public_objection_count"] * 1.5
        + df["unresolved_grievances"] * 2.0
        + df["rr_grievances"] * 2.5
    ) / (df["affected_families"] + 10.0)

    # 5. Administrative Latency & Stage Stagnation
    df["dispute_resolution_lag"] = df["average_compensation_delay_days"] / (df["district_avg_resolution_days"] + 1.0)
    df["stage_stagnation_ratio"] = df["days_in_current_stage"] / (df["agency_avg_delay_days"] + 1.0)
    df["administrative_latency_sum"] = (
        df["notification_delay_days"]
        + df["approval_delay_days"]
        + df["survey_delay_days"]
    )

    # 6. Physical Possession & Right-of-Way (RoW) Deficits
    df["possession_deficit"] = np.clip(100.0 - df["possession_pct"], 0.0, 100.0)
    df["row_deficit"] = np.clip(100.0 - df["row_available_pct"], 0.0, 100.0)

    # 7. Multi-Engine Compound Interactions
    df["friction_x_pending_comp"] = df["public_friction_index"] * (df["compensation_pending_pct"] / 100.0)
    df["possession_deficit_x_rr_deficit"] = df["possession_deficit"] * (np.clip(100.0 - df["rr_completion_pct"], 0.0, 100.0) / 100.0)
    df["litigation_x_financial_stress"] = df["litigation_severity_score"] * df["financial_stress_index"]

    # 8. Tenure & Vulnerability Vulnerability Multipliers
    df["encumbrance_vulnerability_index"] = (np.clip(100.0 - df["encumbrance_free_pct"], 0.0, 100.0)) * (df["private_land_pct"] / 100.0)
    df["vulnerability_ratio"] = df["vulnerable_households"] / (df["affected_families"] + eps)

    # 9. Log transforms for highly skewed count features
    df["log_total_active_cases"] = np.log1p(np.maximum(df["total_active_cases"], 0.0))
    df["log_public_objection_count"] = np.log1p(np.maximum(df["public_objection_count"], 0.0))
    df["log_affected_families"] = np.log1p(np.maximum(df["affected_families"], 0.0))
    df["log_compensation_pending_amount"] = np.log1p(np.maximum(df["compensation_pending_amount"], 0.0))

    # Replace any potential inf or NaN
    df = df.replace([np.inf, -np.inf], 0.0).fillna(0.0)

    return df
