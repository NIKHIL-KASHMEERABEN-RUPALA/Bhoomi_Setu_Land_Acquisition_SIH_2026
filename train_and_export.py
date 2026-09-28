"""
BhoomiSetu - Land Acquisition Early Warning System (EWS)
Training & Model Serialization Script
Smart India Hackathon 2026
"""

import os
import json
import time
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import GroupShuffleSplit
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, average_precision_score
from xgboost import XGBClassifier
import shap

RANDOM_SEED = 42
MODELS_DIR = Path("models")
MODELS_DIR.mkdir(parents=True, exist_ok=True)

DATA_PATH = Path("land_acquisition_master.csv")
if not DATA_PATH.exists():
    raise FileNotFoundError(f"Cannot find {DATA_PATH.resolve()}")

print(f"[*] Loading dataset from {DATA_PATH}...")
df = pd.read_csv(DATA_PATH)
print(f"[+] Loaded {len(df)} rows, {len(df.columns)} columns across {df['project_id'].nunique()} unique projects.")

# ============================================================
# DOMAIN FEATURE ENGINEERING (B.L.A.S.T.)
# ============================================================
print("[*] Performing domain feature engineering...")

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

df = engineer_features(df)

BASE_FEATURES = [
    "state", "district", "project_type",
    "project_cost", "project_length_km", "land_required_hectares",
    "land_acquired_pct", "land_pending_pct", "private_land_pct", "government_land_pct", "forest_land_pct",
    "affected_families", "affected_landowners", "vulnerable_households",
    "compensation_awarded_amount", "compensation_paid_amount", "compensation_pending_amount",
    "compensation_pending_pct", "compensation_dispute_count", "average_compensation_delay_days",
    "legal_case_count", "court_case_count", "arbitration_case_count", "ownership_dispute_count",
    "notification_delay_days", "approval_delay_days", "survey_delay_days",
    "document_completion_pct", "interdepartmental_pending_count",
    "rr_required", "rr_completion_pct", "families_relocated_pct", "rr_grievances",
    "possession_pct", "row_available_pct", "encumbrance_free_pct",
    "public_objection_count", "unresolved_grievances", "stakeholder_response_rate",
    "district_avg_resolution_days", "agency_avg_delay_days", "previous_project_delay_rate",
    "days_since_notification", "days_since_last_update", "days_in_current_stage",
    "acquisition_stage"
]

ENGINEERED_FEATURES = [
    "cost_per_hectare", "cost_per_family", "cost_per_km", 
    "pending_compensation_ratio", "financial_stress_index",
    "total_active_cases", "litigation_density_per_family", "litigation_density_per_hectare",
    "litigation_severity_score", "public_friction_index", "dispute_resolution_lag",
    "stage_stagnation_ratio", "acquisition_velocity_hectares_per_month", "rr_velocity_families_per_month",
    "administrative_deceleration", "friction_x_pending_comp", "possession_deficit_x_rr_velocity",
    "log_total_active_cases", "log_public_objection_count", "log_affected_families", "log_compensation_pending_amount"
]

ALL_FEATURES = BASE_FEATURES + ENGINEERED_FEATURES

X = df[ALL_FEATURES].copy()
y = df["delayed_gt_90_days"].astype(int).copy()
groups = df["project_id"].copy()

# ============================================================
# TRAIN / TEST SPLIT (Zero project leakage)
# ============================================================
print("[*] Partitioning cohorts using GroupShuffleSplit (project_id zero leakage)...")
gss_test = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=RANDOM_SEED)
train_val_idx, test_idx = next(gss_test.split(X, y, groups=groups))

X_train_val = X.iloc[train_val_idx]
y_train_val = y.iloc[train_val_idx]
groups_train_val = groups.iloc[train_val_idx]

X_test = X.iloc[test_idx]
y_test = y.iloc[test_idx]

gss_val = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=RANDOM_SEED)
train_idx, val_idx = next(gss_val.split(X_train_val, y_train_val, groups=groups_train_val))

X_train = X_train_val.iloc[train_idx]
y_train = y_train_val.iloc[train_idx]

X_val = X_train_val.iloc[val_idx]
y_val = y_train_val.iloc[val_idx]

print(f"[+] Train: {len(X_train)} rows | Validation: {len(X_val)} rows | Test: {len(X_test)} rows")

# Preprocessing pipeline
numeric_features = X.select_dtypes(include=["int64", "float64"]).columns.tolist()
categorical_features = X.select_dtypes(include=["object", "str"]).columns.tolist()

numeric_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler())
])

categorical_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
])

preprocessor = ColumnTransformer([
    ("numeric", numeric_pipeline, numeric_features),
    ("categorical", categorical_pipeline, categorical_features)
])

# XGBoost Champion Model
xgb_classifier = XGBClassifier(
    objective="binary:logistic",
    n_estimators=500,
    learning_rate=0.03,
    max_depth=6,
    min_child_weight=3,
    subsample=0.8,
    colsample_bytree=0.8,
    reg_alpha=0.1,
    reg_lambda=1.0,
    eval_metric="auc",
    random_state=RANDOM_SEED,
    n_jobs=-1,
    tree_method="hist"
)

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", xgb_classifier)
])

print("[*] Training XGBoost Champion Pipeline...")
t0 = time.time()
pipeline.fit(X_train, y_train)
fit_time = time.time() - t0
print(f"[+] Model fit completed in {fit_time:.2f} seconds.")

# Validation Metrics
val_probs = pipeline.predict_proba(X_val)[:, 1]
val_preds = (val_probs >= 0.50).astype(int)

metrics = {
    "accuracy": round(float(accuracy_score(y_val, val_preds)), 4),
    "precision": round(float(precision_score(y_val, val_preds, zero_division=0)), 4),
    "recall": round(float(recall_score(y_val, val_preds, zero_division=0)), 4),
    "f1": round(float(f1_score(y_val, val_preds, zero_division=0)), 4),
    "roc_auc": round(float(roc_auc_score(y_val, val_probs)), 4),
    "pr_auc": round(float(average_precision_score(y_val, val_probs)), 4),
    "optimal_threshold": 0.50
}
print("[+] Validation Performance Metrics:", json.dumps(metrics, indent=2))

# ============================================================
# PRECOMPUTE SHAP EXPLAINER & BACKGROUND
# ============================================================
print("[*] Preparing SHAP TreeExplainer...")
trained_preprocessor = pipeline.named_steps["preprocessor"]
trained_classifier = pipeline.named_steps["classifier"]

explainer = shap.TreeExplainer(trained_classifier)

feature_names = trained_preprocessor.get_feature_names_out().tolist()

# Clean feature names (remove prefixes like numeric__, categorical__)
clean_feature_names = [f.replace("numeric__", "").replace("categorical__", "") for f in feature_names]

# Save pipeline & explainer
pipeline_file = MODELS_DIR / "bhoomi_xgb_pipeline.joblib"
explainer_file = MODELS_DIR / "bhoomi_shap_explainer.joblib"

joblib.dump(pipeline, pipeline_file, compress=3)
joblib.dump(explainer, explainer_file, compress=3)
print(f"[+] Saved pipeline to {pipeline_file}")
print(f"[+] Saved SHAP explainer to {explainer_file}")

# Collect sample test cases representing risk tiers
test_df_raw = df.iloc[test_idx].copy()
test_probs = pipeline.predict_proba(X_test)[:, 1]
test_df_raw["predicted_prob"] = test_probs

def get_risk_tier(p: float) -> str:
    if p < 0.40: return "LOW"
    elif p < 0.60: return "MODERATE"
    elif p < 0.80: return "HIGH"
    else: return "CRITICAL"

test_df_raw["risk_tier"] = test_df_raw["predicted_prob"].apply(get_risk_tier)

sample_cases = {}
for tier in ["LOW", "MODERATE", "HIGH", "CRITICAL"]:
    tier_subset = test_df_raw[test_df_raw["risk_tier"] == tier]
    if len(tier_subset) > 0:
        sample_row = tier_subset.iloc[0]
        # Store only base features for client input
        client_input = {col: (int(sample_row[col]) if isinstance(sample_row[col], (np.integer, int)) 
                              else (round(float(sample_row[col]), 4) if isinstance(sample_row[col], (np.floating, float)) 
                                    else str(sample_row[col]))) 
                        for col in BASE_FEATURES}
        sample_cases[tier] = {
            "title": f"Sample {tier.capitalize()} Risk Project",
            "project_id": str(sample_row["project_id"]),
            "state": str(sample_row["state"]),
            "district": str(sample_row["district"]),
            "project_type": str(sample_row["project_type"]),
            "probability": round(float(sample_row["predicted_prob"]), 4),
            "risk_tier": tier,
            "inputs": client_input
        }

sample_cases_file = MODELS_DIR / "sample_projects.json"
with open(sample_cases_file, "w", encoding="utf-8") as f:
    json.dump(sample_cases, f, indent=2)
print(f"[+] Saved sample projects to {sample_cases_file}")

# Model Metadata
metadata = {
    "model_name": "BhoomiSetu Land Acquisition Early Warning System",
    "version": "1.0.0",
    "algorithm": "XGBClassifier (500 trees, max_depth=6, hist)",
    "training_date": time.strftime("%Y-%m-%d %H:%M:%S"),
    "base_features": BASE_FEATURES,
    "engineered_features": ENGINEERED_FEATURES,
    "total_input_features": len(BASE_FEATURES),
    "total_model_features": len(ALL_FEATURES),
    "transformed_feature_count": len(feature_names),
    "transformed_feature_names": clean_feature_names,
    "metrics": metrics,
    "risk_tiers": {
        "LOW": {"threshold": "< 40%", "action": "Normal operational track. Milestone monitoring on standard schedule."},
        "MODERATE": {"threshold": "40% - 59%", "action": "Early warnings detected. Monthly inter-departmental review recommended."},
        "HIGH": {"threshold": "60% - 79%", "action": "Significant compensation/dispute backlog. Fast-track administrative intervention."},
        "CRITICAL": {"threshold": ">= 80%", "action": "Severe delay imminent (> 90 days). Escalate to Ministry / Special Task Force."}
    },
    "unique_states": sorted(df["state"].dropna().unique().tolist()),
    "unique_districts": sorted(df["district"].dropna().unique().tolist()),
    "unique_project_types": sorted(df["project_type"].dropna().unique().tolist()),
    "unique_acquisition_stages": sorted(df["acquisition_stage"].dropna().unique().tolist())
}

metadata_file = MODELS_DIR / "model_metadata.json"
with open(metadata_file, "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2)
print(f"[+] Saved model metadata to {metadata_file}")
print("[+] TRAINING & EXPORT COMPLETED SUCCESSFULLY!")
