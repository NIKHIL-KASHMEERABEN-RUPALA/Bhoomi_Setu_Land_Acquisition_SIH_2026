"""
BhoomiSetu — Full Production ML Training Pipeline
Trains XGBoost with TreeSHAP Explainer on 30,000 Land Acquisition Records
Team: Quorum Intelligence | Problem Statement ID: SIH26016
"""

import os
import sys
import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.metrics import (
    roc_auc_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
    brier_score_loss,
)
from sklearn.calibration import calibration_curve

# Make local imports work when running as script
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ml.config import (
    DATA_PATH,
    ALT_DATA_PATH,
    TARGET_COL,
    AUXILIARY_TARGETS,
    IDENTIFIER_COLS,
    CATEGORICAL_FEATURES,
    NUMERICAL_BASE_FEATURES,
    ENGINEERED_FEATURES,
    RANDOM_SEED,
    TEST_SIZE,
    XGB_PARAMS,
    MODEL_PATH,
    PREPROCESSOR_PATH,
    SHAP_EXPLAINER_PATH,
    FEATURE_NAMES_PATH,
    METADATA_PATH,
    RISK_BANDS,
)
from ml.feature_engineering import engineer_features
from ml.preprocessing import build_preprocessor, save_preprocessor


def load_dataset() -> pd.DataFrame:
    """Locates and loads the land acquisition dataset from workspace."""
    filepath = DATA_PATH if DATA_PATH.exists() else ALT_DATA_PATH
    if not filepath.exists():
        raise FileNotFoundError(f"Training dataset not found at {DATA_PATH} or {ALT_DATA_PATH}")
    
    print(f"[Train] Ingesting dataset from: {filepath.name}")
    df = pd.read_csv(filepath)
    print(f"[Train] Raw data loaded successfully. Shape: {df.shape}")
    return df


def prepare_data(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Validates target column, extracts features, and removes leakage variables.
    """
    if TARGET_COL not in df.columns:
        # Fallback intelligent target creation based on actual_completion_delay_days > 90
        if "actual_completion_delay_days" in df.columns:
            print("[Train] Target column not found. Creating binary delayed_gt_90_days target.")
            df[TARGET_COL] = (pd.to_numeric(df["actual_completion_delay_days"], errors="coerce") > 90).astype(int)
        else:
            raise KeyError(f"Target column '{TARGET_COL}' could not be identified.")

    # Target series
    y = pd.to_numeric(df[TARGET_COL], errors="coerce").fillna(0).astype(int)

    # Exclude target and leakage features
    cols_to_drop = set([TARGET_COL] + AUXILIARY_TARGETS + IDENTIFIER_COLS)
    feature_cols = [c for c in df.columns if c not in cols_to_drop]

    raw_features_df = df[feature_cols].copy()
    print(f"[Train] Engineering features on {raw_features_df.shape[1]} input columns...")
    engineered_df = engineer_features(raw_features_df)
    print(f"[Train] Feature engineering complete. Total feature columns: {engineered_df.shape[1]}")

    return engineered_df, y


def train_model():
    """Executes the complete production training routine and saves serialized artifacts."""
    start_time = time.time()
    print("=" * 70)
    print(" BHOOMISETU LAND ACQUISITION EARLY WARNING SYSTEM (EWS) — ML TRAINING")
    print("=" * 70)

    # 1. Load Data
    raw_df = load_dataset()

    # 2. Feature Engineering & Target Preparation
    X_df, y = prepare_data(raw_df)
    target_distribution = y.value_counts(normalize=True).to_dict()
    print(f"[Train] Class balance: Normal (0): {target_distribution.get(0, 0):.2%}, Critical Delay (1): {target_distribution.get(1, 0):.2%}")

    # 3. Stratified Train / Validation Split
    X_train, X_test, y_train, y_test = train_test_split(
        X_df, y,
        test_size=TEST_SIZE,
        stratify=y,
        random_state=RANDOM_SEED
    )
    print(f"[Train] Training partition: {X_train.shape[0]} samples | Evaluation partition: {X_test.shape[0]} samples")

    # 4. Preprocessing Fit
    num_cols = [c for c in X_df.columns if c not in CATEGORICAL_FEATURES]
    preprocessor = build_preprocessor(categorical_cols=CATEGORICAL_FEATURES, numerical_cols=num_cols)
    print("[Train] Fitting ColumnTransformer preprocessor...")
    X_train_trans = preprocessor.fit_transform(X_train)
    X_test_trans = preprocessor.transform(X_test)

    # Extract feature names after transformation
    try:
        transformed_feature_names = preprocessor.get_feature_names_out().tolist()
    except Exception:
        # Fallback feature naming
        transformed_feature_names = [f"feat_{i}" for i in range(X_train_trans.shape[1])]
    
    print(f"[Train] Transformed feature matrix dimensions: {X_train_trans.shape[1]} columns")

    # 5. Initialize & Train XGBoost Classifier
    try:
        from xgboost import XGBClassifier
    except ImportError:
        print("[Train] xgboost package not found. Installing via pip...")
        os.system("pip install --quiet xgboost")
        from xgboost import XGBClassifier

    print(f"[Train] Training XGBClassifier with {XGB_PARAMS['n_estimators']} trees (tree_method='{XGB_PARAMS['tree_method']}')...")
    xgb_clf = XGBClassifier(**XGB_PARAMS)
    xgb_clf.fit(
        X_train_trans,
        y_train,
        eval_set=[(X_test_trans, y_test)],
        verbose=False,
    )

    # 6. Evaluation Metrics
    y_pred_proba = xgb_clf.predict_proba(X_test_trans)[:, 1]
    y_pred = (y_pred_proba >= 0.5).astype(int)

    roc_auc = float(roc_auc_score(y_test, y_pred_proba))
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred))
    rec = float(recall_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred))
    brier = float(brier_score_loss(y_test, y_pred_proba))
    conf_mat = confusion_matrix(y_test, y_pred).tolist()

    print("\n" + "=" * 50)
    print(" FINAL PRODUCTION EVALUATION REPORT")
    print("=" * 50)
    print(f" • ROC-AUC Score:      {roc_auc:.4f}")
    print(f" • Accuracy:           {acc:.4f} ({acc*100:.2f}%)")
    print(f" • Precision:          {prec:.4f}")
    print(f" • Recall:             {rec:.4f}")
    print(f" • F1-Score:           {f1:.4f}")
    print(f" • Brier Calibration:  {brier:.4f}")
    print("Confusion Matrix [[TN, FP], [FN, TP]]:", conf_mat)
    print("\nDetailed Classification Report:\n", classification_report(y_test, y_pred))

    # 7. TreeSHAP Explainer Construction
    explainer = None
    try:
        import shap
        print("[Train] Constructing TreeSHAP explainer (TreeExplainer)...")
        explainer = shap.TreeExplainer(xgb_clf)
        joblib.dump(explainer, SHAP_EXPLAINER_PATH)
        print(f"[Train] TreeSHAP explainer saved to: {SHAP_EXPLAINER_PATH}")
    except Exception as e:
        print(f"[Train] TreeSHAP build warning: {e}. Model weights will provide feature importances.")

    # 8. Save Model & Preprocessor Artifacts
    save_preprocessor(preprocessor, PREPROCESSOR_PATH)
    joblib.dump(xgb_clf, MODEL_PATH)
    print(f"[Train] Trained XGBoost model saved to: {MODEL_PATH}")

    # 9. Save Feature Names & Production Metadata JSON
    with open(FEATURE_NAMES_PATH, "w", encoding="utf-8") as f:
        json.dump(transformed_feature_names, f, indent=2)

    metadata = {
        "model_name": "BhoomiSetu Land Acquisition Early Warning System",
        "version": "1.0.0",
        "algorithm": f"XGBClassifier ({XGB_PARAMS['n_estimators']} trees, max_depth={XGB_PARAMS['max_depth']}, hist)",
        "training_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "base_features": CATEGORICAL_FEATURES + NUMERICAL_BASE_FEATURES,
        "engineered_features": ENGINEERED_FEATURES,
        "total_input_features": len(CATEGORICAL_FEATURES) + len(NUMERICAL_BASE_FEATURES),
        "total_model_features": len(CATEGORICAL_FEATURES) + len(NUMERICAL_BASE_FEATURES) + len(ENGINEERED_FEATURES),
        "transformed_feature_count": len(transformed_feature_names),
        "transformed_feature_names": transformed_feature_names,
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "brier_score": round(brier, 4),
            "optimal_threshold": 0.50,
        },
        "risk_bands": RISK_BANDS,
        "unique_states": sorted(raw_df["state"].dropna().unique().tolist()) if "state" in raw_df.columns else [],
        "unique_districts": sorted(raw_df["district"].dropna().unique().tolist()) if "district" in raw_df.columns else [],
        "unique_project_types": sorted(raw_df["project_type"].dropna().unique().tolist()) if "project_type" in raw_df.columns else [],
        "unique_acquisition_stages": sorted(raw_df["acquisition_stage"].dropna().unique().tolist()) if "acquisition_stage" in raw_df.columns else [],
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    elapsed = time.time() - start_time
    print(f"\n[Train] Pipeline execution finished in {elapsed:.2f} seconds.")
    print(f"[Train] Metadata JSON saved to: {METADATA_PATH}")
    return metadata


if __name__ == "__main__":
    train_model()
