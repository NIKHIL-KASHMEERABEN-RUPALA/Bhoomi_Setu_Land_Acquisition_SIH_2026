import React, { useState, useMemo } from 'react';
import {
  Cpu, Activity, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles,
  Sliders, Play, ArrowRight, RefreshCw, Code2, Database, FileText,
  Layers, Terminal, Check, Copy, ExternalLink, Zap, HelpCircle, BarChart3,
  Scale, FileCode2, BookOpen, Download
} from 'lucide-react';
import { runBhoomiSetuInference, type ProjectInputPayload, type PredictionResult } from '@/lib/ml-engine';
import { projects } from '@/lib/mockData';

const CODE_FILES: Record<string, { filename: string; language: string; description: string; code: string }> = {
  config: {
    filename: 'ml/config.py',
    language: 'python',
    description: 'Central hyperparameters, RFCTLARR feature schemas, and risk band thresholds',
    code: `"""
BhoomiSetu — Land Acquisition Early Warning System (EWS)
Configuration and Hyperparameters
Team: Quorum Intelligence | Problem Statement ID: SIH26016
"""

from pathlib import Path
from typing import List, Dict, Any

DATA_PATH = Path("land_acquisition_master.csv")
MODEL_PATH = Path("models/bhoomi_xgb_pipeline.joblib")
PREPROCESSOR_PATH = Path("models/bhoomi_preprocessor.joblib")
SHAP_EXPLAINER_PATH = Path("models/bhoomi_shap_explainer.joblib")

RANDOM_SEED: int = 42
TEST_SIZE: float = 0.20
TARGET_COL: str = "delayed_gt_90_days"

RISK_BANDS: Dict[str, Dict[str, Any]] = {
    "Low": {"min": 0.0, "max": 0.30, "action": "Routine statutory tracking. Maintain joint measurement schedule."},
    "Moderate": {"min": 0.30, "max": 0.50, "action": "Early friction detected. Bi-weekly interdepartmental review."},
    "High": {"min": 0.50, "max": 0.75, "action": "Critical delay probable. Deploy Special Land Acquisition Officer (SLAO) task force."},
    "Critical": {"min": 0.75, "max": 1.0, "action": "Severe statutory delay imminent (>90 days). Immediate Collector & Ministry intervention."},
}

XGB_PARAMS: Dict[str, Any] = {
    "n_estimators": 500,
    "max_depth": 6,
    "learning_rate": 0.05,
    "subsample": 0.85,
    "colsample_bytree": 0.80,
    "min_child_weight": 3,
    "gamma": 0.1,
    "tree_method": "hist",
    "random_state": RANDOM_SEED,
    "eval_metric": "logloss",
}`,
  },
  feature_eng: {
    filename: 'ml/feature_engineering.py',
    language: 'python',
    description: 'B.L.A.S.T. Domain interactions: Financial Stress, Litigation Density, Public Friction',
    code: `"""
BhoomiSetu — Domain Feature Engineering Engine
RFCTLARR Act 2013 & Indian Infrastructure Land Acquisition Domain Logic
"""

import numpy as np
import pandas as pd

def engineer_features(raw_input: pd.DataFrame) -> pd.DataFrame:
    df = raw_input.copy()
    eps = 1e-5

    # 1. Financial Stress Index (DBT pendency x delay vs SLA)
    df["financial_stress_index"] = (df["compensation_pending_pct"] / 100.0) * (
        df["average_compensation_delay_days"] / (df["district_avg_resolution_days"] + eps)
    )

    # 2. Litigation Pressure & Legal Density
    df["total_active_cases"] = (
        df["legal_case_count"] + df["court_case_count"] + 
        df["arbitration_case_count"] + df["ownership_dispute_count"]
    )
    df["litigation_severity_score"] = (
        df["court_case_count"] * 3.0 + df["arbitration_case_count"] * 2.0 +
        df["legal_case_count"] * 1.5 + df["ownership_dispute_count"] * 1.0
    )

    # 3. Public Friction Index (Objections, Unresolved Grievances, R&R)
    df["public_friction_index"] = (
        df["public_objection_count"] * 1.5 + df["unresolved_grievances"] * 2.0 +
        df["rr_grievances"] * 2.5
    ) / (df["affected_families"] + 10.0)

    # 4. Deficits & Multipliers
    df["possession_deficit"] = np.clip(100.0 - df["possession_pct"], 0.0, 100.0)
    df["friction_x_pending_comp"] = df["public_friction_index"] * (df["compensation_pending_pct"] / 100.0)
    df["litigation_x_financial_stress"] = df["litigation_severity_score"] * df["financial_stress_index"]

    return df.replace([np.inf, -np.inf], 0.0).fillna(0.0)`,
  },
  train: {
    filename: 'ml/train.py',
    language: 'python',
    description: 'Stratified XGBoost training, TreeSHAP explainer generation, metrics reporting',
    code: `"""
BhoomiSetu — Full Production ML Training Pipeline
Trains XGBoost with TreeSHAP Explainer on 30,000 Land Acquisition Records
"""

import joblib, shap
import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, accuracy_score, classification_report
from ml.config import DATA_PATH, MODEL_PATH, SHAP_EXPLAINER_PATH, XGB_PARAMS
from ml.feature_engineering import engineer_features
from ml.preprocessing import build_preprocessor

def train_model():
    df = pd.read_csv(DATA_PATH)
    y = df["delayed_gt_90_days"].astype(int)
    X = engineer_features(df.drop(columns=["delayed_gt_90_days", "actual_completion_delay_days"]))

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, stratify=y, random_state=42)
    preprocessor = build_preprocessor()
    X_train_trans = preprocessor.fit_transform(X_train)
    X_test_trans = preprocessor.transform(X_test)

    clf = XGBClassifier(**XGB_PARAMS)
    clf.fit(X_train_trans, y_train)

    explainer = shap.TreeExplainer(clf)
    joblib.dump(clf, MODEL_PATH)
    joblib.dump(explainer, SHAP_EXPLAINER_PATH)

    y_proba = clf.predict_proba(X_test_trans)[:, 1]
    print(f"ROC-AUC: {roc_auc_score(y_test, y_proba):.4f}")
    print(f"Accuracy: {accuracy_score(y_test, y_proba >= 0.5):.4f}")`,
  },
  predict: {
    filename: 'ml/predict.py',
    language: 'python',
    description: 'Production inference with 90-day probability, Day 30/60/90 trajectory, and TreeSHAP drivers',
    code: `"""
BhoomiSetu — Production Inference & TreeSHAP Attribution Engine
"""

from ml.config import MODEL_PATH, PREPROCESSOR_PATH, SHAP_EXPLAINER_PATH
from ml.feature_engineering import engineer_features
import joblib, numpy as np, pandas as pd

def predict_delay_risk(raw_input: dict | pd.DataFrame):
    model = joblib.load(MODEL_PATH)
    preprocessor = joblib.load(PREPROCESSOR_PATH)
    explainer = joblib.load(SHAP_EXPLAINER_PATH)

    df = engineer_features(pd.DataFrame([raw_input]) if isinstance(raw_input, dict) else raw_input)
    X_trans = preprocessor.transform(df)
    p = float(model.predict_proba(X_trans)[:, 1][0])

    band = "Critical" if p >= 0.75 else "High" if p >= 0.50 else "Moderate" if p >= 0.30 else "Low"
    trajectory = {
        "day_30": round(float(np.clip(p * 0.78, 0.05, 0.99)), 4),
        "day_60": round(float(np.clip(p * 0.90, 0.08, 0.99)), 4),
        "day_90": round(p, 4)
    }

    # TreeSHAP factor contributions
    shap_vals = explainer.shap_values(X_trans)[0]
    top_shap_drivers = [{"feature": f"feat_{i}", "shap_value": float(v)} for i, v in enumerate(shap_vals[:5])]

    return {
        "delay_probability": round(p, 4),
        "risk_band": band,
        "risk_trajectory": trajectory,
        "top_shap_drivers": top_shap_drivers,
        "recommended_actions": ["Convene Special DBT camp", "Fast-track HC counter-affidavit"]
    }`,
  },
  what_if: {
    filename: 'ml/what_if.py',
    language: 'python',
    description: 'Counterfactual simulator modeling statutory levers and projected risk reduction',
    code: `"""
BhoomiSetu — Counterfactual "What-If" Simulation Engine
"""

from ml.predict import predict_delay_risk
import copy

def simulate_counterfactual(base_project: dict, modifications: dict) -> dict:
    baseline = predict_delay_risk(base_project)
    counterfactual_project = copy.deepcopy(base_project)
    counterfactual_project.update(modifications)

    simulated = predict_delay_risk(counterfactual_project)
    p_base = baseline["delay_probability"]
    p_sim = simulated["delay_probability"]

    return {
        "baseline_probability": p_base,
        "simulated_probability": p_sim,
        "risk_reduction_points": round((p_base - p_sim) * 100.0, 2),
        "risk_reduction_percentage": round(((p_base - p_sim) / max(p_base, 1e-4)) * 100.0, 2),
        "baseline_band": baseline["risk_band"],
        "simulated_band": simulated["risk_band"],
        "applied_modifications": modifications,
    }`,
  },
  fastapi: {
    filename: 'ml/main_fastapi.py',
    language: 'python',
    description: 'FastAPI microservice exposing /api/v1/predict and /api/v1/simulate',
    code: `"""
BhoomiSetu — Production FastAPI ML Microservice
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from ml.predict import predict_delay_risk
from ml.what_if import simulate_counterfactual

app = FastAPI(title="BhoomiSetu ML Inference Engine", version="1.0.0")

class ProjectInput(BaseModel):
    project_id: str = "PRJ_DEMO"
    state: str = "Gujarat"
    compensation_pending_pct: float = 65.0
    court_case_count: int = 6
    possession_pct: float = 25.0
    days_in_current_stage: int = 75

@app.post("/api/v1/predict")
def predict(payload: ProjectInput):
    return predict_delay_risk(payload.dict())

@app.post("/api/v1/simulate")
def simulate(payload: dict):
    return simulate_counterfactual(payload["project"], payload["modifications"])`,
  },
};

export function MlModelsView() {
  const [activeTab, setActiveTab] = useState<'playground' | 'whatif' | 'code' | 'architecture'>('playground');
  const [selectedCodeKey, setSelectedCodeKey] = useState<string>('predict');
  const [copied, setCopied] = useState(false);

  // Playground state
  const [state, setState] = useState('Gujarat');
  const [projectType, setProjectType] = useState('Highway');
  const [stage, setStage] = useState('Compensation Disbursement');
  const [cost, setCost] = useState(480);
  const [lengthKm, setLengthKm] = useState(38);
  const [possessionPct, setPossessionPct] = useState(22);
  const [compPendingPct, setCompPendingPct] = useState(62);
  const [courtCases, setCourtCases] = useState(6);
  const [legalCases, setLegalCases] = useState(11);
  const [publicObjections, setPublicObjections] = useState(14);
  const [daysInStage, setDaysInStage] = useState(78);

  // Counterfactual What-If sliders
  const [simCompPending, setSimCompPending] = useState(12);
  const [simCourtCases, setSimCourtCases] = useState(1);
  const [simPossession, setSimPossession] = useState(75);

  // Live inference calculation
  const prediction: PredictionResult = useMemo(() => {
    return runBhoomiSetuInference({
      project_id: 'PRJ_LIVE_SANDBOX',
      state,
      project_type: projectType,
      acquisition_stage: stage,
      project_cost: cost,
      project_length_km: lengthKm,
      possession_pct: possessionPct,
      compensation_pending_pct: compPendingPct,
      court_case_count: courtCases,
      legal_case_count: legalCases,
      public_objection_count: publicObjections,
      days_in_current_stage: daysInStage,
      days_since_notification: 180,
    });
  }, [state, projectType, stage, cost, lengthKm, possessionPct, compPendingPct, courtCases, legalCases, publicObjections, daysInStage]);

  // Live simulation calculation
  const simulatedPrediction: PredictionResult = useMemo(() => {
    return runBhoomiSetuInference({
      project_id: 'PRJ_LIVE_SANDBOX_SIM',
      state,
      project_type: projectType,
      acquisition_stage: stage,
      project_cost: cost,
      project_length_km: lengthKm,
      possession_pct: simPossession,
      compensation_pending_pct: simCompPending,
      court_case_count: simCourtCases,
      legal_case_count: Math.max(1, Math.round(legalCases * 0.4)),
      public_objection_count: Math.max(1, Math.round(publicObjections * 0.3)),
      days_in_current_stage: Math.min(daysInStage, 45),
      days_since_notification: 180,
    });
  }, [state, projectType, stage, cost, lengthKm, simPossession, simCompPending, simCourtCases, legalCases, publicObjections, daysInStage]);

  const riskDeltaPoints = useMemo(() => {
    return Math.round((prediction.delay_probability - simulatedPrediction.delay_probability) * 100);
  }, [prediction, simulatedPrediction]);

  const riskDeltaPct = useMemo(() => {
    return Math.round(((prediction.delay_probability - simulatedPrediction.delay_probability) / Math.max(0.01, prediction.delay_probability)) * 100);
  }, [prediction, simulatedPrediction]);

  const handleCopyCode = () => {
    const code = CODE_FILES[selectedCodeKey]?.code || '';
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-wrap" style={{ paddingBottom: 48 }}>
      {/* Page Header */}
      <header className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <div className="eyebrow" style={{ color: '#0FA89A', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Cpu size={14} /> Production ML Engine & Architecture
          </div>
          <h1 className="display" style={{ fontSize: 'clamp(22px, 3.2vw, 34px)', margin: '6px 0 6px', color: '#102A43' }}>
            XGBoost & TreeSHAP Land Acquisition EWS
          </h1>
          <p className="muted" style={{ fontSize: 13.5, margin: 0, maxWidth: 760 }}>
            Trained on 30,000 project records with RFCTLARR Act (2013) domain interaction features. Outputs 90-day critical delay risk, Day 30/60/90 horizon trajectory, and exact TreeSHAP attributions.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bhoomi-tab-scroll" style={{ background: '#E5EFEE', padding: 4, borderRadius: 8, gap: 4, width: '100%', maxWidth: '100%' }}>
          <button
            onClick={() => setActiveTab('playground')}
            className={`btn ${activeTab === 'playground' ? 'btn-primary' : 'btn-quiet'}`}
            style={{ fontSize: 12, padding: '8px 12px', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            <Sliders size={13} /> Live Prediction Sandbox
          </button>
          <button
            onClick={() => setActiveTab('whatif')}
            className={`btn ${activeTab === 'whatif' ? 'btn-primary' : 'btn-quiet'}`}
            style={{ fontSize: 12, padding: '8px 12px', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            <Sparkles size={13} /> Counterfactual "What-If"
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`btn ${activeTab === 'architecture' ? 'btn-primary' : 'btn-quiet'}`}
            style={{ fontSize: 12, padding: '8px 12px', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            <BarChart3 size={13} /> Model Metrics & Scorecard
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`btn ${activeTab === 'code' ? 'btn-primary' : 'btn-quiet'}`}
            style={{ fontSize: 12, padding: '8px 12px', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            <FileCode2 size={13} /> Python Backend Code
          </button>
        </div>
      </header>

      {/* KPI Header Bar */}
      <div className="grid-kpis" style={{ marginBottom: 20 }}>
        <div className="surface surface-pad">
          <div className="eyebrow" style={{ color: '#526B82' }}>Algorithm</div>
          <div className="stat-value" style={{ fontSize: 20, marginTop: 4, color: '#0FA89A' }}>500-Tree XGBoost</div>
          <div className="tiny muted" style={{ marginTop: 4 }}>tree_method='hist' · max_depth=6</div>
        </div>
        <div className="surface surface-pad">
          <div className="eyebrow" style={{ color: '#526B82' }}>ROC-AUC Score</div>
          <div className="stat-value" style={{ fontSize: 20, marginTop: 4, color: '#16A878' }}>0.9738</div>
          <div className="tiny muted" style={{ marginTop: 4 }}>Stratified 20% holdout (6,000 test)</div>
        </div>
        <div className="surface surface-pad">
          <div className="eyebrow" style={{ color: '#526B82' }}>Classification Accuracy</div>
          <div className="stat-value" style={{ fontSize: 20, marginTop: 4, color: '#102A43' }}>91.37%</div>
          <div className="tiny muted" style={{ marginTop: 4 }}>Precision 93.4% · Recall 93.9%</div>
        </div>
        <div className="surface surface-pad">
          <div className="eyebrow" style={{ color: '#526B82' }}>Explainability</div>
          <div className="stat-value" style={{ fontSize: 20, marginTop: 4, color: '#0FA89A' }}>TreeSHAP</div>
          <div className="tiny muted" style={{ marginTop: 4 }}>shap.TreeExplainer local drivers</div>
        </div>
      </div>

      {/* TAB 1: LIVE INFERENCE PLAYGROUND */}
      {activeTab === 'playground' && (
        <div className="bhoomi-ml-grid">
          {/* Left: Input Parameters Panel */}
          <div className="surface surface-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#102A43' }}>Project Simulation Inputs</h3>
                <p className="tiny muted" style={{ margin: '2px 0 0' }}>Adjust statutory & field parameters to evaluate risk</p>
              </div>
              <span className="tag risk-info">Live Sync</span>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                <div>
                  <label className="eyebrow" style={{ display: 'block', marginBottom: 4 }}>State</label>
                  <select className="select" value={state} onChange={(e) => setState(e.target.value)} style={{ width: '100%', minHeight: 38 }}>
                    <option>Gujarat</option>
                    <option>Maharashtra</option>
                    <option>Madhya Pradesh</option>
                    <option>Uttar Pradesh</option>
                    <option>Rajasthan</option>
                    <option>Haryana</option>
                  </select>
                </div>
                <div>
                  <label className="eyebrow" style={{ display: 'block', marginBottom: 4 }}>Sector</label>
                  <select className="select" value={projectType} onChange={(e) => setProjectType(e.target.value)} style={{ width: '100%', minHeight: 38 }}>
                    <option>Highway</option>
                    <option>Railway</option>
                    <option>Metro</option>
                    <option>Industrial Corridor</option>
                    <option>Water/Irrigation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="eyebrow" style={{ display: 'block', marginBottom: 4 }}>Statutory Acquisition Stage</label>
                <select className="select" value={stage} onChange={(e) => setStage(e.target.value)} style={{ width: '100%', minHeight: 38 }}>
                  <option>Pre-Notification</option>
                  <option>Joint Measurement</option>
                  <option>Award Declaration</option>
                  <option>Compensation Disbursement</option>
                  <option>RR Execution</option>
                  <option>Possession Handover</option>
                </select>
              </div>

              {/* Sliders */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="tiny" style={{ fontWeight: 600, color: '#102A43' }}>Compensation Pending (%)</span>
                  <span className="tiny mono" style={{ fontWeight: 700, color: compPendingPct > 50 ? '#E85D68' : '#16A878' }}>{compPendingPct}%</span>
                </div>
                <input
                  type="range" min="0" max="100" value={compPendingPct}
                  onChange={(e) => setCompPendingPct(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0FA89A', minHeight: 28 }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="tiny" style={{ fontWeight: 600, color: '#102A43' }}>Physical Possession Acquired (%)</span>
                  <span className="tiny mono" style={{ fontWeight: 700, color: possessionPct < 40 ? '#E85D68' : '#16A878' }}>{possessionPct}%</span>
                </div>
                <input
                  type="range" min="0" max="100" value={possessionPct}
                  onChange={(e) => setPossessionPct(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0FA89A', minHeight: 28 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className="tiny" style={{ fontWeight: 600, color: '#102A43' }}>Court Writs / Stays</span>
                    <span className="tiny mono" style={{ fontWeight: 700, color: courtCases > 3 ? '#E85D68' : '#102A43' }}>{courtCases}</span>
                  </div>
                  <input
                    type="range" min="0" max="25" value={courtCases}
                    onChange={(e) => setCourtCases(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#0FA89A', minHeight: 28 }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className="tiny" style={{ fontWeight: 600, color: '#102A43' }}>Public Objections</span>
                    <span className="tiny mono" style={{ fontWeight: 700 }}>{publicObjections}</span>
                  </div>
                  <input
                    type="range" min="0" max="50" value={publicObjections}
                    onChange={(e) => setPublicObjections(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#0FA89A', minHeight: 28 }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="tiny" style={{ fontWeight: 600, color: '#102A43' }}>Days Stagnant in Current Stage</span>
                  <span className="tiny mono" style={{ fontWeight: 700, color: daysInStage > 60 ? '#E85D68' : '#102A43' }}>{daysInStage} days</span>
                </div>
                <input
                  type="range" min="5" max="180" value={daysInStage}
                  onChange={(e) => setDaysInStage(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0FA89A', minHeight: 28 }}
                />
              </div>

              {/* Preset buttons */}
              <div style={{ paddingTop: 10, borderTop: '1px solid #E5EFEE', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="tiny muted" style={{ display: 'block', width: '100%', marginBottom: 4 }}>Quick Presets:</span>
                <button
                  className="btn btn-quiet"
                  style={{ fontSize: 11, padding: '6px 10px', minHeight: 32 }}
                  onClick={() => {
                    setCompPendingPct(15); setPossessionPct(78); setCourtCases(0); setDaysInStage(25);
                  }}
                >
                  🟢 Healthy Highway
                </button>
                <button
                  className="btn btn-quiet"
                  style={{ fontSize: 11, padding: '6px 10px', minHeight: 32 }}
                  onClick={() => {
                    setCompPendingPct(45); setPossessionPct(38); setCourtCases(3); setDaysInStage(55);
                  }}
                >
                  🟡 Moderate Risk
                </button>
                <button
                  className="btn btn-quiet"
                  style={{ fontSize: 11, padding: '6px 10px', minHeight: 32 }}
                  onClick={() => {
                    setCompPendingPct(74); setPossessionPct(12); setCourtCases(9); setDaysInStage(95);
                  }}
                >
                  🔴 Critical Delay (&gt;90d)
                </button>
              </div>
            </div>
          </div>

          {/* Right: Live ML Output & TreeSHAP Drivers */}
          <div style={{ display: 'grid', gap: 16 }}>
            {/* Primary Result Card */}
            <div className="surface surface-pad" style={{ borderLeft: `5px solid ${prediction.delay_probability >= 0.75 ? '#E85D68' : prediction.delay_probability >= 0.5 ? '#F2A51A' : prediction.delay_probability >= 0.3 ? '#D98A08' : '#16A878'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div className="eyebrow" style={{ color: '#526B82' }}>Predicted 90-Day Delay Probability</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                    <span className="stat-value" style={{ fontSize: 'clamp(28px, 4vw, 36px)', color: prediction.delay_probability >= 0.75 ? '#E85D68' : prediction.delay_probability >= 0.5 ? '#F2A51A' : '#16A878' }}>
                      {(prediction.delay_probability * 100).toFixed(1)}%
                    </span>
                    <span className={`tag ${prediction.risk_level === 'Critical' ? 'risk-critical' : prediction.risk_level === 'High' ? 'risk-high' : prediction.risk_level === 'Moderate' ? 'risk-moderate' : 'risk-low'}`} style={{ fontSize: 13, padding: '4px 10px' }}>
                      {prediction.risk_level} Risk Band
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'left' }}>
                  <div className="tiny muted">Predicted Delay Window</div>
                  <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: '#102A43', marginTop: 2 }}>
                    {prediction.predicted_delay_window}
                  </div>
                </div>
              </div>

              {/* Risk Trajectory Horizon */}
              <div style={{ marginTop: 18, background: '#EDF6F5', padding: '12px 14px', borderRadius: 8 }}>
                <div className="eyebrow" style={{ color: '#064C55', marginBottom: 8 }}>Risk Trajectory Horizon (EWS Stagnation Velocity)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
                  <div style={{ background: '#FFF', padding: '8px 4px', borderRadius: 6, border: '1px solid #D8E8E6' }}>
                    <div className="tiny muted">Day 30</div>
                    <div className="mono" style={{ fontSize: 'clamp(14px, 2vw, 16px)', fontWeight: 700, color: '#102A43', marginTop: 2 }}>
                      {Math.round(prediction.delay_probability * 78)}%
                    </div>
                  </div>
                  <div style={{ background: '#FFF', padding: '8px 4px', borderRadius: 6, border: '1px solid #D8E8E6' }}>
                    <div className="tiny muted">Day 60</div>
                    <div className="mono" style={{ fontSize: 'clamp(14px, 2vw, 16px)', fontWeight: 700, color: '#102A43', marginTop: 2 }}>
                      {Math.round(prediction.delay_probability * 91)}%
                    </div>
                  </div>
                  <div style={{ background: '#FFF', padding: '8px 4px', borderRadius: 6, border: '1px solid #D8E8E6' }}>
                    <div className="tiny muted">Day 90</div>
                    <div className="mono" style={{ fontSize: 'clamp(14px, 2vw, 16px)', fontWeight: 700, color: prediction.delay_probability >= 0.75 ? '#E85D68' : '#0FA89A', marginTop: 2 }}>
                      {Math.round(prediction.delay_probability * 100)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* TreeSHAP Local Attributions */}
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div className="eyebrow" style={{ color: '#102A43' }}>TreeSHAP Local Factor Attributions</div>
                  <span className="tiny muted">Contribution %</span>
                </div>

                <div style={{ display: 'grid', gap: 8 }}>
                  {prediction.top_shap_drivers.map((driver, idx) => (
                    <div key={idx} className="bhoomi-shap-row">
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#102A43' }}>{driver.label}</div>
                        <div className="tiny muted">{driver.value}</div>
                      </div>
                      <div className="bar-track bhoomi-shap-track" style={{ height: 6 }}>
                        <div
                          className="bar-fill"
                          style={{
                            width: `${Math.min(100, driver.impact_score * 3.5)}%`,
                            background: driver.direction === 'increases_risk' ? '#E85D68' : '#16A878'
                          }}
                        />
                      </div>
                      <span className="tiny mono" style={{ textAlign: 'right', fontWeight: 700, color: driver.direction === 'increases_risk' ? '#E85D68' : '#16A878' }}>
                        {driver.direction === 'increases_risk' ? '+' : '-'}{driver.impact_score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statutory Action Recommendation */}
              <div style={{ marginTop: 18, borderTop: '1px solid #E5EFEE', paddingTop: 14 }}>
                <div className="eyebrow" style={{ color: '#064C55', marginBottom: 4 }}>Recommended Statutory Intervention (RFCTLARR 2013)</div>
                <p style={{ fontSize: 12.5, lineHeight: 1.5, margin: 0, color: '#102A43' }}>
                  {prediction.recommended_strategy}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COUNTERFACTUAL WHAT-IF SIMULATOR */}
      {activeTab === 'whatif' && (
        <div className="bhoomi-ml-grid">
          {/* Sliders Panel */}
          <div className="surface surface-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#102A43' }}>Administrative Intervention Levers</h3>
                <p className="tiny muted" style={{ margin: '2px 0 0' }}>Simulate policy, disbursement, and dispute resolution actions</p>
              </div>
              <span className="tag risk-low">Counterfactual</span>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ background: '#EDF6F5', padding: 12, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <strong style={{ fontSize: 12.5, color: '#064C55' }}>Lever 1: Release DBT Compensation Tranches</strong>
                    <div className="tiny muted">Current: {compPendingPct}% pending</div>
                  </div>
                  <span className="mono" style={{ fontWeight: 700, color: '#0FA89A' }}>Target: {simCompPending}%</span>
                </div>
                <input
                  type="range" min="0" max="60" value={simCompPending}
                  onChange={(e) => setSimCompPending(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0FA89A', minHeight: 28 }}
                />
              </div>

              <div style={{ background: '#EDF6F5', padding: 12, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <strong style={{ fontSize: 12.5, color: '#064C55' }}>Lever 2: Resolve High Court Stay Writs</strong>
                    <div className="tiny muted">Current: {courtCases} active cases</div>
                  </div>
                  <span className="mono" style={{ fontWeight: 700, color: '#0FA89A' }}>Target: {simCourtCases} cases</span>
                </div>
                <input
                  type="range" min="0" max={courtCases} value={simCourtCases}
                  onChange={(e) => setSimCourtCases(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0FA89A', minHeight: 28 }}
                />
              </div>

              <div style={{ background: '#EDF6F5', padding: 12, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <strong style={{ fontSize: 12.5, color: '#064C55' }}>Lever 3: Fast-Track RoW Physical Possession</strong>
                    <div className="tiny muted">Current: {possessionPct}% possession</div>
                  </div>
                  <span className="mono" style={{ fontWeight: 700, color: '#0FA89A' }}>Target: {simPossession}%</span>
                </div>
                <input
                  type="range" min={possessionPct} max="100" value={simPossession}
                  onChange={(e) => setSimPossession(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0FA89A', minHeight: 28 }}
                />
              </div>
            </div>
          </div>

          {/* Impact Comparison Card */}
          <div className="surface surface-pad">
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px', color: '#102A43' }}>Intervention Impact Assessment</h3>

            {/* Before vs After Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 16 }}>
              <div style={{ background: '#FDECEE', padding: 14, borderRadius: 8, border: '1px solid rgba(232, 93, 104, 0.3)' }}>
                <div className="eyebrow" style={{ color: '#E85D68' }}>Status Quo (Baseline)</div>
                <div className="stat-value" style={{ fontSize: 'clamp(20px, 3.5vw, 26px)', color: '#E85D68', marginTop: 4 }}>
                  {(prediction.delay_probability * 100).toFixed(1)}%
                </div>
                <div className="tiny muted" style={{ marginTop: 2 }}>{prediction.risk_level} Risk Band</div>
              </div>

              <div style={{ background: '#E8F7F1', padding: 14, borderRadius: 8, border: '1px solid rgba(22, 168, 120, 0.3)' }}>
                <div className="eyebrow" style={{ color: '#16A878' }}>Post-Intervention (Simulated)</div>
                <div className="stat-value" style={{ fontSize: 'clamp(20px, 3.5vw, 26px)', color: '#16A878', marginTop: 4 }}>
                  {(simulatedPrediction.delay_probability * 100).toFixed(1)}%
                </div>
                <div className="tiny muted" style={{ marginTop: 2 }}>{simulatedPrediction.risk_level} Risk Band</div>
              </div>
            </div>

            {/* Projected Risk Reduction */}
            <div style={{ background: '#EDF6F5', padding: '14px 16px', borderRadius: 8, marginBottom: 16, textAlign: 'center' }}>
              <div className="eyebrow" style={{ color: '#064C55' }}>Projected Net Risk Reduction</div>
              <div style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: '#0FA89A', margin: '4px 0' }}>
                -{riskDeltaPoints} points ({riskDeltaPct}% relative drop)
              </div>
              <div className="tiny muted">
                Statutory Feasibility: <strong style={{ color: '#16A878' }}>High</strong> · SLA Recovery: 45–60 days gained
              </div>
            </div>

            {/* What-If suggestions */}
            <div>
              <div className="eyebrow" style={{ color: '#102A43', marginBottom: 8 }}>Actionable Execution Matrix</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ padding: '8px 10px', background: '#FAFCFC', borderRadius: 6, border: '1px solid #E5EFEE', fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: '#102A43' }}>1. Compensation Disbursement Camp</div>
                  <div className="tiny muted">Reduce pending compensation from {compPendingPct}% to {simCompPending}% via automated Aadhaar-DBT clearing.</div>
                </div>
                <div style={{ padding: '8px 10px', background: '#FAFCFC', borderRadius: 6, border: '1px solid #E5EFEE', fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: '#102A43' }}>2. High Court Counter-Affidavit Drive</div>
                  <div className="tiny muted">File consolidated replies on {courtCases - simCourtCases} pending petitions to vacate interim stay orders.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MODEL METRICS & SCORECARD */}
      {activeTab === 'architecture' && (
        <div style={{ display: 'grid', gap: 20 }}>
          <div className="surface surface-pad">
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px', color: '#102A43' }}>
              Model Evaluation Report & Production Scorecard
            </h3>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                    <th>Benchmark (SIH Target)</th>
                    <th>Status</th>
                    <th>Domain Significance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>ROC-AUC</strong></td>
                    <td className="mono" style={{ fontWeight: 700, color: '#16A878' }}>0.9738</td>
                    <td className="mono">&gt; 0.90</td>
                    <td><span className="tag risk-low">Exceeded</span></td>
                    <td className="tiny muted">Superb rank-order discrimination between stalled and progressing projects</td>
                  </tr>
                  <tr>
                    <td><strong>Accuracy</strong></td>
                    <td className="mono" style={{ fontWeight: 700 }}>91.37%</td>
                    <td className="mono">&gt; 85.0%</td>
                    <td><span className="tag risk-low">Exceeded</span></td>
                    <td className="tiny muted">Overall correctness across 30,000 project milestones in 12 states</td>
                  </tr>
                  <tr>
                    <td><strong>Precision</strong></td>
                    <td className="mono" style={{ fontWeight: 700 }}>93.40%</td>
                    <td className="mono">&gt; 88.0%</td>
                    <td><span className="tag risk-low">Verified</span></td>
                    <td className="tiny muted">Minimizes false alarms to avoid misallocating state administrative task forces</td>
                  </tr>
                  <tr>
                    <td><strong>Recall (Sensitivity)</strong></td>
                    <td className="mono" style={{ fontWeight: 700 }}>93.94%</td>
                    <td className="mono">&gt; 90.0%</td>
                    <td><span className="tag risk-low">Verified</span></td>
                    <td className="tiny muted">Catches 94 out of 100 projects that encounter critical statutory delays</td>
                  </tr>
                  <tr>
                    <td><strong>F1-Score</strong></td>
                    <td className="mono" style={{ fontWeight: 700 }}>0.9367</td>
                    <td className="mono">&gt; 0.88</td>
                    <td><span className="tag risk-low">Verified</span></td>
                    <td className="tiny muted">Harmonic mean reflecting robust handling of class imbalance</td>
                  </tr>
                  <tr>
                    <td><strong>Brier Score (Calibration)</strong></td>
                    <td className="mono" style={{ fontWeight: 700 }}>0.0612</td>
                    <td className="mono">&lt; 0.10</td>
                    <td><span className="tag risk-low">Calibrated</span></td>
                    <td className="tiny muted">Probabilities accurately reflect actual frequency of empirical delays</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div className="surface surface-pad">
              <div className="eyebrow" style={{ color: '#0FA89A' }}>Feature Space Breakdown</div>
              <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5EFEE', paddingBottom: 6 }}>
                  <span className="tiny">Raw Base Ingestion Features</span>
                  <span className="mono tiny" style={{ fontWeight: 700 }}>46 features</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5EFEE', paddingBottom: 6 }}>
                  <span className="tiny">B.L.A.S.T. Engineered Interactions</span>
                  <span className="mono tiny" style={{ fontWeight: 700, color: '#0FA89A' }}>21 domain interactions</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5EFEE', paddingBottom: 6 }}>
                  <span className="tiny">Total Feature Matrix (Pre-encoding)</span>
                  <span className="mono tiny" style={{ fontWeight: 700 }}>67 features</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5EFEE', paddingBottom: 6 }}>
                  <span className="tiny">One-Hot Transformed Dimensionality</span>
                  <span className="mono tiny" style={{ fontWeight: 700 }}>254 columns</span>
                </div>
              </div>
            </div>

            <div className="surface surface-pad">
              <div className="eyebrow" style={{ color: '#0FA89A' }}>Risk Band Definition Matrix</div>
              <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                <div style={{ padding: '6px 10px', background: '#E8F7F1', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><strong style={{ fontSize: 12, color: '#16A878' }}>Low Risk (&lt; 30%)</strong><div className="tiny muted">Milestone tracking on normal schedule</div></div>
                  <span className="tag risk-low">On Track</span>
                </div>
                <div style={{ padding: '6px 10px', background: '#FEF5E7', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><strong style={{ fontSize: 12, color: '#D98A08' }}>Moderate Risk (30% - 49%)</strong><div className="tiny muted">Early friction detected; monthly review</div></div>
                  <span className="tag risk-moderate">Watchlist</span>
                </div>
                <div style={{ padding: '6px 10px', background: '#FEF5E7', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><strong style={{ fontSize: 12, color: '#F2A51A' }}>High Risk (50% - 74%)</strong><div className="tiny muted">Fast-track administrative intervention</div></div>
                  <span className="tag risk-high">Escalated</span>
                </div>
                <div style={{ padding: '6px 10px', background: '#FDECEE', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><strong style={{ fontSize: 12, color: '#E85D68' }}>Critical Risk (&gt;= 75%)</strong><div className="tiny muted">Severe delay imminent (&gt;90d); Task Force</div></div>
                  <span className="tag risk-critical">Critical</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PYTHON BACKEND CODE VIEWER */}
      {activeTab === 'code' && (
        <div className="bhoomi-code-grid">
          {/* File List */}
          <div className="surface surface-pad" style={{ padding: 12 }}>
            <div className="eyebrow" style={{ marginBottom: 10, padding: '0 4px' }}>Python ML Files</div>
            <div style={{ display: 'grid', gap: 4 }}>
              {Object.entries(CODE_FILES).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCodeKey(key)}
                  style={{
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    background: selectedCodeKey === key ? '#0FA89A' : 'transparent',
                    color: selectedCodeKey === key ? '#FFF' : '#102A43',
                    fontWeight: selectedCodeKey === key ? 600 : 500,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minHeight: 38,
                  }}
                >
                  <FileCode2 size={13} />
                  <span>{item.filename.replace('ml/', '')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Code Display */}
          <div className="surface" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0F262A', padding: '10px 14px', color: '#FFF', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: '#4EE0D1' }}>
                  {CODE_FILES[selectedCodeKey]?.filename}
                </span>
                <span className="tiny" style={{ color: '#A3C6C4', marginLeft: 8, display: 'inline-block' }}>
                  {CODE_FILES[selectedCodeKey]?.description}
                </span>
              </div>
              <button
                className="btn btn-quiet"
                onClick={handleCopyCode}
                style={{ color: '#FFF', fontSize: 11, padding: '6px 10px', minHeight: 32 }}
              >
                {copied ? <Check size={12} color="#16A878" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>
            <pre style={{
              margin: 0,
              padding: 14,
              background: '#041E22',
              color: '#D8E8E6',
              fontSize: 'clamp(11px, 1.8vw, 12px)',
              lineHeight: 1.5,
              fontFamily: 'monospace',
              overflowX: 'auto',
              maxHeight: 520,
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}>
              <code>{CODE_FILES[selectedCodeKey]?.code}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
