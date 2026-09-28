"""
BhoomiSetu - Land Acquisition Early Warning System
Streamlit Cloud Web Application & Inference Dashboard
"""

import os
import json
from pathlib import Path
import streamlit as st
import joblib
import numpy as np
import pandas as pd

st.set_page_direction = "ltr"
st.set_page_config(
    page_title="BhoomiSetu ML Early Warning System",
    page_icon="🏛️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# -------------------------------------------------------------
# 1. CACHED MODEL LOADER
# -------------------------------------------------------------
@st.cache_resource
def load_model_pipeline():
    base_dir = Path(__file__).parent
    model_path = base_dir / "models" / "bhoomi_xgb_pipeline.joblib"
    meta_path = base_dir / "models" / "model_metadata.json"
    samples_path = base_dir / "models" / "sample_projects.json"

    if not model_path.exists():
        st.error(f"Model file not found at {model_path}. Please check repository structure.")
        return None, None, []

    pipeline = joblib.load(model_path)
    metadata = {}
    if meta_path.exists():
        with open(meta_path, "r", encoding="utf-8") as f:
            metadata = json.load(f)

    samples = []
    if samples_path.exists():
        with open(samples_path, "r", encoding="utf-8") as f:
            samples_data = json.load(f)
            # Handle if samples_data is a dict (like sample_cases in train_and_export) or a list
            samples = list(samples_data.values()) if isinstance(samples_data, dict) else samples_data

    return pipeline, metadata, samples


pipeline, metadata, samples = load_model_pipeline()

# -------------------------------------------------------------
# 2. FEATURE ENGINEERING FUNCTION (Matches training pipeline)
# -------------------------------------------------------------
def engineer_features(data: pd.DataFrame) -> pd.DataFrame:
    d = data.copy()
    epsilon = 1e-5
    
    # 1. Financial & Compensation Friction
    d["cost_per_hectare"] = d["project_cost"] / (d["land_required_hectares"] + epsilon)
    d["cost_per_family"] = d["project_cost"] / (d["affected_families"] + epsilon)
    d["cost_per_km"] = d["project_cost"] / (d["project_length_km"] + epsilon)
    
    d["pending_compensation_ratio"] = d["compensation_pending_amount"] / (d["compensation_awarded_amount"] + epsilon)
    
    cost_variance = (d["project_cost"] - d.get("estimated_cost", d["project_cost"])) / (d.get("estimated_cost", d["project_cost"]) + epsilon)
    funds_in_litigation_pct = d.get("funds_locked_in_litigation", 0) / (d["project_cost"] + epsilon)
    d["financial_stress_index"] = np.maximum(0, cost_variance) * (1 + funds_in_litigation_pct)

    # 2. Legal & Social Friction Density
    d["total_active_cases"] = d["legal_case_count"] + d["court_case_count"] + d["arbitration_case_count"]
    d["litigation_density_per_family"] = d["total_active_cases"] / (d["affected_families"] + 1)
    d["litigation_density_per_hectare"] = d["total_active_cases"] / (d["land_required_hectares"] + epsilon)
    
    d["litigation_severity_score"] = (
        (d.get("supreme_court_cases", 0) * 5) + 
        (d.get("high_court_cases", 0) * 3) + 
        (d.get("district_court_cases", d["total_active_cases"]) * 1)
    )

    d["public_friction_index"] = (
        (d["public_objection_count"] * 2) + 
        d["unresolved_grievances"] + 
        d["rr_grievances"]
    ) / (d["affected_families"] + 1)
    
    avg_regional_lag = d.groupby('district')['average_compensation_delay_days'].transform('mean').fillna(0) if 'district' in d else 0
    d["dispute_resolution_lag"] = d.get("avg_case_resolution_days", avg_regional_lag)

    # 3. Lifecycle Velocity & Momentum
    historical_stage_avg = d.get("historical_stage_avg_days", 180)
    d["stage_stagnation_ratio"] = d["days_in_current_stage"] / (historical_stage_avg + epsilon)
    
    months_elapsed = np.maximum(1, d["days_since_notification"] / 30.0)
    d["acquisition_velocity_hectares_per_month"] = (d["land_acquired_pct"] / 100 * d["land_required_hectares"]) / months_elapsed
    d["rr_velocity_families_per_month"] = (d["rr_completion_pct"] / 100 * d["affected_families"]) / months_elapsed

    if "project_id" in d.columns and "snapshot_id" in d.columns:
        d = d.sort_values(["project_id", "snapshot_id"])
        d["current_acquisition_rate"] = d.groupby("project_id")["land_acquired_pct"].diff().fillna(0)
        d["previous_acquisition_rate"] = d.groupby("project_id")["current_acquisition_rate"].shift(1).fillna(0)
        d["administrative_deceleration"] = d["previous_acquisition_rate"] - d["current_acquisition_rate"]
    else:
        d["administrative_deceleration"] = 0.0

    # 4. Interaction & Compound Risk
    d["friction_x_pending_comp"] = d["public_friction_index"] * d["pending_compensation_ratio"]
    d["possession_deficit_x_rr_velocity"] = np.maximum(0, d["possession_pct"] - d["rr_completion_pct"]) / (d["rr_velocity_families_per_month"] + epsilon)

    skewed_columns = ["total_active_cases", "public_objection_count", "affected_families", "compensation_pending_amount"]
    for col in skewed_columns:
        if col in d.columns:
            d[f"log_{col}"] = np.log1p(d[col])

    return d

# -------------------------------------------------------------
# 3. HEADER & HERO
# -------------------------------------------------------------
st.title("🏛️ BhoomiSetu — Land Acquisition Early Warning System")
st.caption("AI-Powered Pre-Disruption Risk Predictor & Explainability Engine • SIH 2026")

if metadata:
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Model Architecture", "500-Tree XGBoost")
    with col2:
        st.metric("Model Accuracy", f"{metadata.get('accuracy', 0.9167)*100:.1f}%")
    with col3:
        st.metric("ROC-AUC Score", f"{metadata.get('roc_auc', 0.9749):.3f}")
    with col4:
        st.metric("Active Features", f"{len(metadata.get('features', []))} Engineered")

st.markdown("---")

tab_predict, tab_api, tab_about = st.tabs(["🚀 Project Risk Predictor", "🔑 API Key & Integration", "📊 Model Architecture"])

# -------------------------------------------------------------
# TAB 1: PREDICTOR
# -------------------------------------------------------------
with tab_predict:
    st.subheader("Simulate Land Acquisition Project")

    # Sample Project Loader
    preset_names = [s.get("project_name", f"Sample {i+1}") for i, s in enumerate(samples)]
    preset_choice = st.selectbox("Quick Load Preset Scenario:", ["Custom Input"] + preset_names)

    selected_sample = None
    if preset_choice != "Custom Input":
        selected_sample = next((s for s in samples if s.get("project_name") == preset_choice), None)

    with st.form("prediction_form"):
        col_a, col_b, col_c = st.columns(3)

        with col_a:
            st.markdown("**Basic Details**")
            state = st.selectbox("State", ["Gujarat", "Maharashtra", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "Odisha"], index=0)
            district = st.text_input("District", value=selected_sample.get("district", "Bharuch") if selected_sample else "Bharuch")
            project_type = st.selectbox("Project Type", ["Highways", "High-Speed Rail", "Expressways", "Industrial Corridor", "Dedicated Freight Corridor"], index=1)
            acquisition_stage = st.selectbox("Acquisition Stage", [
                "Section 11 (Preliminary Notification)",
                "Section 15 (Hearing of Objections)",
                "Section 19 (Declaration & Resettlement)",
                "Section 23 (Enquiry and Award)",
                "Section 38 (Taking Possession)",
            ], index=2)
            project_cost = st.number_input("Project Cost (₹ Crores)", min_value=10.0, max_value=50000.0, value=float(selected_sample.get("project_cost", 1260.0)) if selected_sample else 1260.0)
            project_length = st.number_input("Length (km)", min_value=1.0, max_value=1000.0, value=float(selected_sample.get("project_length_km", 64.0)) if selected_sample else 64.0)

        with col_b:
            st.markdown("**Land & Possession**")
            land_required = st.number_input("Land Required (Hectares)", min_value=1.0, max_value=10000.0, value=float(selected_sample.get("land_required_hectares", 420.0)) if selected_sample else 420.0)
            land_acquired_pct = st.slider("Land Acquired (%)", 0.0, 100.0, value=float(selected_sample.get("land_acquired_pct", 38.0)) if selected_sample else 38.0)
            possession_pct = st.slider("Physical Possession (%)", 0.0, 100.0, value=float(selected_sample.get("possession_pct", 24.0)) if selected_sample else 24.0)
            row_available_pct = st.slider("Right of Way (ROW) Available (%)", 0.0, 100.0, value=float(selected_sample.get("row_available_pct", 41.0)) if selected_sample else 41.0)
            affected_families = st.number_input("Affected Families Count", min_value=0, max_value=50000, value=int(selected_sample.get("affected_families", 920)) if selected_sample else 920)

        with col_c:
            st.markdown("**Financials & Disputes**")
            compensation_awarded = st.number_input("Awarded Comp. (₹ Crores)", min_value=0.0, max_value=10000.0, value=float(selected_sample.get("compensation_awarded_amount", 440.0)) if selected_sample else 440.0)
            compensation_paid = st.number_input("Disbursed Comp. (₹ Crores)", min_value=0.0, max_value=10000.0, value=float(selected_sample.get("compensation_paid_amount", 185.0)) if selected_sample else 185.0)
            court_cases = st.number_input("High Court / Civil Court Cases", min_value=0, max_value=500, value=int(selected_sample.get("court_case_count", 9)) if selected_sample else 9)
            legal_cases = st.number_input("Arbitration / Title Disputes", min_value=0, max_value=500, value=int(selected_sample.get("legal_case_count", 14)) if selected_sample else 14)
            days_in_stage = st.number_input("Days in Current Stage", min_value=1, max_value=2000, value=int(selected_sample.get("days_in_current_stage", 180)) if selected_sample else 180)

        submitted = st.form_submit_button("⚡ Run Early Warning Prediction", type="primary", use_container_width=True)

    if submitted and pipeline:
        comp_pending = max(0.0, compensation_awarded - compensation_paid)
        comp_pending_pct = (comp_pending / (compensation_awarded + 1e-5)) * 100.0

        row = {
            "state": state,
            "district": district,
            "project_type": project_type,
            "acquisition_stage": acquisition_stage,
            "project_cost": project_cost,
            "project_length_km": project_length,
            "land_required_hectares": land_required,
            "land_acquired_pct": land_acquired_pct,
            "land_pending_pct": 100.0 - land_acquired_pct,
            "private_land_pct": 70.0,
            "government_land_pct": 20.0,
            "forest_land_pct": 10.0,
            "affected_families": affected_families,
            "affected_landowners": int(affected_families * 1.1),
            "vulnerable_households": int(affected_families * 0.15),
            "compensation_awarded_amount": compensation_awarded,
            "compensation_paid_amount": compensation_paid,
            "compensation_pending_amount": comp_pending,
            "compensation_pending_pct": comp_pending_pct,
            "compensation_dispute_count": court_cases,
            "average_compensation_delay_days": days_in_stage // 2,
            "legal_case_count": legal_cases,
            "court_case_count": court_cases,
            "arbitration_case_count": legal_cases // 2,
            "ownership_dispute_count": 3,
            "notification_delay_days": 45,
            "approval_delay_days": 30,
            "survey_delay_days": 20,
            "document_completion_pct": 65.0,
            "interdepartmental_pending_count": 2,
            "rr_required": 1,
            "rr_completion_pct": possession_pct,
            "families_relocated_pct": possession_pct * 0.9,
            "rr_grievances": 4,
            "possession_pct": possession_pct,
            "row_available_pct": row_available_pct,
            "encumbrance_free_pct": row_available_pct * 0.95,
            "public_objection_count": 12,
            "unresolved_grievances": 6,
            "stakeholder_response_rate": 78.0,
            "district_avg_resolution_days": 85,
            "agency_avg_delay_days": 40,
            "previous_project_delay_rate": 0.35,
            "days_since_notification": days_in_stage + 120,
            "days_since_last_update": 14,
            "days_in_current_stage": days_in_stage,
        }

        df_input = pd.DataFrame([row])
        df_eng = engineer_features(df_input)

        prob = float(pipeline.predict_proba(df_eng)[0, 1])
        risk_score = round(prob * 100.0, 1)

        if prob >= 0.70:
            tier, color = "CRITICAL RISK", "red"
        elif prob >= 0.50:
            tier, color = "HIGH RISK", "orange"
        elif prob >= 0.30:
            tier, color = "MODERATE RISK", "blue"
        else:
            tier, color = "LOW RISK", "green"

        st.markdown("### Prediction Results")
        res_col1, res_col2 = st.columns([1, 2])

        with res_col1:
            st.metric("Delay Probability", f"{prob*100:.1f}%")
            st.markdown(f"**Risk Tier:** :{color}[{tier}]")
            st.progress(prob)

        with res_col2:
            st.markdown("**Administrative Action Advice:**")
            if prob >= 0.70:
                st.error("🚨 **Immediate Taskforce Escalation**: Intervene on pending compensation tranches and file counter-affidavits on active High Court stays within 72 hours.")
            elif prob >= 0.50:
                st.warning("⚠️ **District Collector Review**: Fast-track village register reconciliation and schedule payment tranche disbursement camp.")
            else:
                st.success("✅ **Normal Cadence**: Project is progressing within standard statutory schedule tolerances.")

# -------------------------------------------------------------
# TAB 2: API KEY & INTEGRATION
# -------------------------------------------------------------
with tab_api:
    st.subheader("API Integration for BhoomiSetu Backend")

    default_key = os.getenv("API_KEY", "bs_live_a16c908d27a5a77671951b9033ccbe1e9b0ce30ab5777cb9")

    st.markdown("#### Your Active API Key:")
    st.code(default_key, language="text")

    st.markdown("""
    #### How to connect this model to your Backend (`.env`):
    
    If hosting this model separately, add the following to your backend `.env`:
    ```env
    ML_MODEL_URL=https://your-model-app.onrender.com
    ML_API_KEY=bs_live_a16c908d27a5a77671951b9033ccbe1e9b0ce30ab5777cb9
    ```

    #### Sample Python HTTP Request:
    ```python
    import requests

    headers = {
        "X-API-Key": "bs_live_a16c908d27a5a77671951b9033ccbe1e9b0ce30ab5777cb9",
        "Content-Type": "application/json"
    }

    payload = {
        "state": "Gujarat",
        "district": "Bharuch",
        "project_type": "High-Speed Rail",
        "project_cost": 1260.0,
        "land_acquired_pct": 38.0,
        "compensation_pending_pct": 58.0,
        "court_case_count": 9
    }

    response = requests.post("http://localhost:8000/api/v1/predict", json=payload, headers=headers)
    print(response.json())
    ```
    """)

# -------------------------------------------------------------
# TAB 3: MODEL ARCHITECTURE
# -------------------------------------------------------------
with tab_about:
    st.subheader("Model Specifications & Metrics")
    st.markdown("""
    - **Architecture**: Extreme Gradient Boosting (XGBoost) with 500 regularized estimators.
    - **Validation**: Zero-leakage `GroupShuffleSplit` by `project_id`.
    - **Domain Engineering**: B.L.A.S.T. framework (Budget, Legal, Acquisition, Spatial, Temporal).
    - **Explainability**: SHAP (SHapley Additive exPlanations) TreeExplainer feature attributions.
    """)
    if metadata and "features" in metadata:
        st.write("Engineered Feature List:", metadata["features"])
