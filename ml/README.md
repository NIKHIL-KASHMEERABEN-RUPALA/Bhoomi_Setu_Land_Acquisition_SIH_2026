# BhoomiSetu — Machine Learning Subsystem & Early Warning Engine
**Team:** Quorum Intelligence | **Problem Statement ID:** SIH26016  
**System Title:** BhoomiSetu – Predictive Analytics System for Early Detection of Land Acquisition Delays  
**Theme:** Smart Governance / Infrastructure & Rural Development (RFCTLARR Act 2013)

---

## 1. System Overview
BhoomiSetu's AI/ML pipeline delivers a production-grade Early Warning System (EWS) that forecasts the probability of **critical delays (> 90 days)** in mega-infrastructure land acquisition projects across India. Grounded in the statutory provisions of the **Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR Act 2013)** and the **National Highways Act, 1956**, it ingests multi-modal project variables across 8 core domains and outputs:

- **90-Day Critical Delay Probability** ($P \in [0.0, 1.0]$)
- **Calibrated Risk Bands** (`Low`, `Moderate`, `High`, `Critical`)
- **Risk Trajectory Horizon** (Day 30, Day 60, Day 90 forecast)
- **Local Factor Attributions via TreeSHAP** (exact contribution % and direction)
- **Counterfactual "What-If" Simulation** (dynamic risk reduction modeling)

---

## 2. Model Architecture & Performance
- **Algorithm:** XGBClassifier with Histogram-based tree method (`tree_method='hist'`)
- **Trees:** 500 decision trees, `max_depth=6`, `learning_rate=0.05`
- **Explainability:** `shap.TreeExplainer` providing local Shapley value attributions
- **Preprocessing:** `ColumnTransformer` (RobustScaler for skewed numerics + OneHotEncoder for categoricals)

### Verified Evaluation Scorecard (Stratified 20% Holdout on 30,000 Records):
| Metric | Score | Interpretation |
| :--- | :---: | :--- |
| **ROC-AUC** | **0.9738** | Exceptional rank ordering between on-track and delayed corridors |
| **Accuracy** | **91.37%** | High baseline correctness across all 12 major states |
| **Precision** | **93.40%** | Minimizes false alarms to avoid misallocating administrative task forces |
| **Recall** | **93.94%** | Captures over 93% of projects heading into critical legal/DBT delay |
| **F1-Score** | **0.9367** | Balanced performance across class boundaries |
| **Brier Score** | **0.0612** | Probabilities are well-calibrated to real-world likelihood |

---

## 3. Directory Layout
```
/ml
├── config.py                 # All hyperparameters, paths, seeds, feature schema
├── feature_engineering.py    # 20+ RFCTLARR domain interaction features (B.L.A.S.T.)
├── preprocessing.py          # ColumnTransformer pipeline (RobustScaler + OneHot)
├── train.py                  # Full training routine with metrics & artifact serialization
├── predict.py                # Production inference, TreeSHAP explainer, trajectory
├── what_if.py                # Counterfactual simulator for administrative levers
├── main_fastapi.py           # REST microservice with OpenAPI /docs
├── requirements.txt          # Pinned production Python dependencies
└── README.md                 # Complete documentation (this file)
```

---

## 4. Quickstart Guide

### Step 1: Install Dependencies
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r ml/requirements.txt
```

### Step 2: Train Model & Generate Artifacts
Run the complete training pipeline directly on the 30,000-record dataset:
```bash
python3 ml/train.py
```
This generates and saves:
- `models/bhoomi_xgb_pipeline.joblib`
- `models/bhoomi_preprocessor.joblib`
- `models/bhoomi_shap_explainer.joblib`
- `models/feature_names.json`
- `models/model_metadata.json`

### Step 3: Run Inference (Python CLI)
```bash
python3 ml/predict.py
```

### Step 4: Run Counterfactual "What-If" Simulation
```bash
python3 ml/what_if.py
```

### Step 5: Start FastAPI Backend Service
```bash
uvicorn ml.main_fastapi:app --host 0.0.0.0 --port 8000 --reload
```
Open interactive Swagger documentation at: `http://localhost:8000/docs`

---

## 5. API Reference

### POST `/api/v1/predict`
Calculates real-time delay probability and TreeSHAP drivers.
```json
{
  "project_id": "PRJ_NH48_EXP",
  "state": "Gujarat",
  "district": "Gujarat_Dist_04",
  "project_type": "Highway",
  "acquisition_stage": "Compensation Disbursement",
  "project_cost": 450.0,
  "project_length_km": 38.5,
  "possession_pct": 20.0,
  "compensation_pending_pct": 62.0,
  "court_case_count": 6,
  "days_in_current_stage": 75
}
```

**Response:**
```json
{
  "project_id": "PRJ_NH48_EXP",
  "delay_probability": 0.8842,
  "risk_band": "Critical",
  "risk_trajectory": {
    "day_30": 0.692,
    "day_60": 0.796,
    "day_90": 0.8842
  },
  "top_shap_drivers": [
    {
      "feature": "compensation_pending_pct",
      "shap_value": 0.324,
      "contribution_pct": 34.2,
      "direction": "increases_risk"
    },
    {
      "feature": "court_case_count",
      "shap_value": 0.281,
      "contribution_pct": 29.6,
      "direction": "increases_risk"
    },
    {
      "feature": "possession_deficit",
      "shap_value": 0.195,
      "contribution_pct": 20.5,
      "direction": "increases_risk"
    }
  ],
  "recommended_actions": [
    "Convene Special DBT Disbursement Camp in district to release pending 62.0% compensation tranches directly to verified Aadhaar-linked accounts.",
    "Escalate 6 active High Court / Land Acquisition Tribunal cases to State Legal Task Force for expedited counter-affidavit filing within 7 days."
  ]
}
```

### POST `/api/v1/simulate`
Computes counterfactual scenario impact when adjusting administrative levers.
```json
{
  "project": {
    "project_id": "PRJ_NH48_EXP",
    "compensation_pending_pct": 62.0,
    "court_case_count": 6,
    "possession_pct": 20.0
  },
  "modifications": {
    "compensation_pending_pct": 12.0,
    "court_case_count": 1,
    "possession_pct": 75.0
  }
}
```

**Response:**
```json
{
  "baseline": {
    "delay_probability": 0.8842,
    "risk_band": "Critical"
  },
  "counterfactual": {
    "delay_probability": 0.2845,
    "risk_band": "Low"
  },
  "impact_summary": {
    "risk_reduction_points": 59.97,
    "risk_reduction_percentage": 67.82,
    "band_improved": true,
    "statutory_feasibility": "High"
  }
}
```
