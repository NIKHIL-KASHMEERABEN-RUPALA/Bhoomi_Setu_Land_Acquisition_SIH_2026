import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Zap,
  Activity,
  ShieldAlert,
  Clock3,
  Scale,
  TrendingDown,
  Info,
} from 'lucide-react';
import { runBhoomiSetuInference, type PredictionResult, type ShapDriver, type WhatIfSuggestion } from '@/lib/ml-engine';

export interface ProjectIndicatorInputs {
  project_id: string;
  project_type: string;
  state: string;
  district: string;
  acquisition_stage: string;
  project_cost: number;
  land_acquired_pct: number;
  possession_pct: number;
  compensation_pending_pct: number;
  court_case_count: number;
  legal_case_count: number;
  public_objection_count: number;
  days_in_current_stage: number;
  days_since_notification: number;
}

const PRESETS: Record<string, { title: string; badge: string; color: string; inputs: ProjectIndicatorInputs }> = {
  CRITICAL: {
    title: 'Critical Risk Railway Corridor',
    badge: '🔴 Critical Risk (PRJ_CRITICAL)',
    color: '#E85D68',
    inputs: {
      project_id: 'PRJ_CRITICAL',
      project_type: 'Railways',
      state: 'Madhya Pradesh',
      district: 'Madhya Pradesh_Dist_20',
      acquisition_stage: 'Section 19 (Declaration)',
      project_cost: 50,
      land_acquired_pct: 20,
      possession_pct: 3.9,
      compensation_pending_pct: 40,
      court_case_count: 20,
      legal_case_count: 26,
      public_objection_count: 20,
      days_in_current_stage: 42,
      days_since_notification: 30,
    },
  },
  HIGH: {
    title: 'High Risk Freight Corridor',
    badge: '🟠 High Risk Corridor (P0091)',
    color: '#F2A51A',
    inputs: {
      project_id: 'P0091',
      project_type: 'Highway',
      state: 'Maharashtra',
      district: 'Maharashtra_Dist_13',
      acquisition_stage: 'Award Declaration',
      project_cost: 427.97,
      land_acquired_pct: 38.0,
      possession_pct: 28.0,
      compensation_pending_pct: 62.0,
      court_case_count: 5,
      legal_case_count: 9,
      public_objection_count: 12,
      days_in_current_stage: 90,
      days_since_notification: 110,
    },
  },
  MODERATE: {
    title: 'Moderate Delay Node',
    badge: '🟡 Moderate Node (P0015)',
    color: '#D98A08',
    inputs: {
      project_id: 'P0015',
      project_type: 'Highway',
      state: 'Karnataka',
      district: 'Karnataka_Dist_03',
      acquisition_stage: 'Compensation Disbursement',
      project_cost: 166.82,
      land_acquired_pct: 65.0,
      possession_pct: 58.0,
      compensation_pending_pct: 32.0,
      court_case_count: 2,
      legal_case_count: 3,
      public_objection_count: 6,
      days_in_current_stage: 35,
      days_since_notification: 120,
    },
  },
  LOW: {
    title: 'Low Risk Industrial Spur',
    badge: '🟢 Low Risk Spur (P0009)',
    color: '#16A878',
    inputs: {
      project_id: 'P0009',
      project_type: 'Industrial Corridor',
      state: 'Gujarat',
      district: 'Gujarat_Dist_05',
      acquisition_stage: 'Possession Handover',
      project_cost: 266.95,
      land_acquired_pct: 92.0,
      possession_pct: 88.0,
      compensation_pending_pct: 10.0,
      court_case_count: 0,
      legal_case_count: 1,
      public_objection_count: 1,
      days_in_current_stage: 20,
      days_since_notification: 180,
    },
  },
};

export function ProjectIndicatorMatrixModal({ onClose }: { onClose: () => void }) {
  const [activePreset, setActivePreset] = useState<string>('CRITICAL');
  const [inputs, setInputs] = useState<ProjectIndicatorInputs>(PRESETS.CRITICAL.inputs);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionOutputView>(() => {
    const init = runBhoomiSetuInference(PRESETS.CRITICAL.inputs);
    return mapResultToView(init);
  });

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const selectPreset = (key: string) => {
    setActivePreset(key);
    const newInputs = PRESETS[key].inputs;
    setInputs(newInputs);
    runPredictionWithInputs(newInputs);
  };

  const handleChange = (field: keyof ProjectIndicatorInputs, value: any) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  async function runPredictionWithInputs(currentInputs: ProjectIndicatorInputs) {
    setIsLoading(true);

    try {
      // 1. Attempt server-side inference API
      const [response] = await Promise.all([
        fetch('/api/v1/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentInputs),
        }),
        new Promise((resolve) => setTimeout(resolve, 320)), // Smooth animation feedback
      ]);

      if (response && response.ok) {
        const data: PredictionResult = await response.json();
        setResult(mapResultToView(data));
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.warn('[BhoomiSetu] Remote inference route fallback to embedded XGBoost engine:', e);
    }

    // 2. Direct client-side embedded inference fallback
    await new Promise((resolve) => setTimeout(resolve, 200));
    const directResult = runBhoomiSetuInference(currentInputs);
    setResult(mapResultToView(directResult));
    setIsLoading(false);
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runPredictionWithInputs(inputs);
  };

  const getRiskColors = (level: string) => {
    switch (level) {
      case 'Critical':
        return { bg: '#FDECEE', border: '#E85D68', text: '#E85D68', tag: 'risk-critical' };
      case 'High':
        return { bg: '#FEF5E7', border: '#F2A51A', text: '#D98A08', tag: 'risk-high' };
      case 'Moderate':
        return { bg: '#EEF6FB', border: '#5BA7D9', text: '#2176AE', tag: 'risk-moderate' };
      default:
        return { bg: '#E8F7F1', border: '#16A878', text: '#16A878', tag: 'risk-low' };
    }
  };

  const riskColors = getRiskColors(result.risk_level);

  return (
    <div
      className="matrix-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      data-testid="modal-ai-assist-matrix"
    >
      <div className="matrix-modal-container">
        {/* Modal Header */}
        <div className="matrix-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="matrix-header-icon">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="matrix-header-title">Project Indicator Matrix</div>
              <div className="matrix-header-sub">
                Pre-Disruption AI Risk Predictor • 500-Tree XGBoost & TreeSHAP Attributions
              </div>
            </div>
          </div>
          <button onClick={onClose} className="matrix-close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="matrix-modal-body">
          {/* Left Column: Form & Presets */}
          <div className="matrix-form-column">
            {/* Quick Presets */}
            <div className="matrix-presets-row">
              {Object.entries(PRESETS).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectPreset(key)}
                  className={`matrix-preset-pill ${activePreset === key ? 'active' : ''}`}
                  data-testid={`preset-pill-${key.toLowerCase()}`}
                >
                  {item.badge}
                </button>
              ))}
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="matrix-inputs-grid">
                {/* Row 1: Project ID & Project Type */}
                <div className="matrix-field">
                  <label>PROJECT ID</label>
                  <input
                    type="text"
                    value={inputs.project_id}
                    onChange={(e) => handleChange('project_id', e.target.value)}
                    required
                  />
                </div>

                <div className="matrix-field">
                  <label>PROJECT TYPE</label>
                  <select
                    value={inputs.project_type}
                    onChange={(e) => handleChange('project_type', e.target.value)}
                  >
                    <option value="Railways">Railways (Freight / High-Speed)</option>
                    <option value="Highway">Highway / Expressway</option>
                    <option value="Industrial Corridor">Industrial Corridor</option>
                    <option value="Metro">Metro Urban Transit</option>
                    <option value="Water/Irrigation">Water & Irrigation</option>
                  </select>
                </div>

                {/* Row 2: State & District */}
                <div className="matrix-field">
                  <label>STATE</label>
                  <input
                    type="text"
                    value={inputs.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    required
                  />
                </div>

                <div className="matrix-field">
                  <label>DISTRICT</label>
                  <input
                    type="text"
                    value={inputs.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    required
                  />
                </div>

                {/* Row 3: Acquisition Stage & Project Cost */}
                <div className="matrix-field">
                  <label>ACQUISITION STAGE</label>
                  <select
                    value={inputs.acquisition_stage}
                    onChange={(e) => handleChange('acquisition_stage', e.target.value)}
                  >
                    <option value="Section 19 (Declaration)">Section 19 (Declaration & Resettlement)</option>
                    <option value="Section 23 (Award)">Section 23 (Enquiry & Award)</option>
                    <option value="Section 11 (Preliminary Notification)">Section 11 (Preliminary Notification)</option>
                    <option value="Joint Measurement">Joint Measurement Survey (JMS)</option>
                    <option value="Compensation Disbursement">Compensation Disbursement</option>
                    <option value="Possession Handover">Section 38 (Physical Possession)</option>
                    <option value="RR Execution">R&R Execution</option>
                  </select>
                </div>

                <div className="matrix-field">
                  <label>PROJECT COST (₹ CR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.project_cost}
                    onChange={(e) => handleChange('project_cost', parseFloat(e.target.value) || 0)}
                  />
                </div>

                {/* Row 4: Land Acquired (%) & Possession (%) */}
                <div className="matrix-field">
                  <label>LAND ACQUIRED (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.land_acquired_pct}
                    onChange={(e) => handleChange('land_acquired_pct', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="matrix-field">
                  <label>POSSESSION (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.possession_pct}
                    onChange={(e) => handleChange('possession_pct', parseFloat(e.target.value) || 0)}
                  />
                </div>

                {/* Row 5: Comp. Pending (%) & Court Cases (Writs) */}
                <div className="matrix-field">
                  <label>COMP. PENDING (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.compensation_pending_pct}
                    onChange={(e) => handleChange('compensation_pending_pct', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="matrix-field">
                  <label>COURT CASES (WRITS)</label>
                  <input
                    type="number"
                    value={inputs.court_case_count}
                    onChange={(e) => handleChange('court_case_count', parseInt(e.target.value) || 0)}
                  />
                </div>

                {/* Row 6: Legal Cases Count & Public Objections */}
                <div className="matrix-field">
                  <label>LEGAL CASES COUNT</label>
                  <input
                    type="number"
                    value={inputs.legal_case_count}
                    onChange={(e) => handleChange('legal_case_count', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="matrix-field">
                  <label>PUBLIC OBJECTIONS</label>
                  <input
                    type="number"
                    value={inputs.public_objection_count}
                    onChange={(e) => handleChange('public_objection_count', parseInt(e.target.value) || 0)}
                  />
                </div>

                {/* Row 7: Days in Current Stage & Days Since Notification */}
                <div className="matrix-field">
                  <label>DAYS IN CURRENT STAGE</label>
                  <input
                    type="number"
                    value={inputs.days_in_current_stage}
                    onChange={(e) => handleChange('days_in_current_stage', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="matrix-field">
                  <label>DAYS SINCE NOTIFICATION</label>
                  <input
                    type="number"
                    value={inputs.days_since_notification}
                    onChange={(e) => handleChange('days_since_notification', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="matrix-submit-btn"
                disabled={isLoading}
                data-testid="button-run-ai-prediction"
              >
                {isLoading ? (
                  <>
                    <Activity size={18} className="spin-animation" />
                    <span>Analyzing 62 B.L.A.S.T. & 254 transformed features...</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Run Real-Time AI Prediction</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Live XAI Results */}
          <div className="matrix-result-column">
            <div className="matrix-result-card">
              <div className="matrix-result-header">
                <span className="eyebrow" style={{ color: '#0FA89A' }}>EARLY WARNING SIGNAL</span>
                <span className="matrix-confidence-pill">Confidence: {result.confidence}%</span>
              </div>

              {/* Circular Delay Probability Gauge */}
              <div className="matrix-gauge-container">
                <div
                  className="matrix-gauge-circle"
                  style={{
                    borderColor: riskColors.border,
                    boxShadow: `0 0 24px ${riskColors.border}33`,
                  }}
                >
                  <span className="matrix-gauge-number">
                    {`${Math.round(result.delay_probability * 100)}%`}
                  </span>
                  <span className="matrix-gauge-label">DELAY PROBABILITY</span>
                </div>

                <div className="matrix-risk-summary">
                  <div className={`matrix-risk-tier-badge ${riskColors.tag}`}>
                    {`${result.risk_level.toUpperCase()} RISK`}
                  </div>
                  <div className="matrix-delay-window">
                    <Clock3 size={14} />
                    <span>{result.delay_window}</span>
                  </div>
                </div>
              </div>

              {/* Recommended Strategy Box */}
              <div className="matrix-strategy-box">
                <div className="matrix-strategy-title">
                  <ShieldAlert size={16} color={riskColors.text} />
                  <span>Recommended Administrative Intervention</span>
                </div>
                <div className="matrix-strategy-text">
                  {result.recommended_strategy}
                </div>
              </div>

              {/* SHAP Factor Attributions */}
              <div className="matrix-shap-section">
                <div className="matrix-shap-title">
                  <span>Top Contributing Bottlenecks (TreeSHAP)</span>
                  <span className="tiny muted">Local Attribution</span>
                </div>

                <div className="matrix-shap-list">
                  {result.factors.map((f, idx) => (
                    <div key={f.feature + idx} className="matrix-shap-item">
                      <div className="matrix-shap-info">
                        <span className="matrix-shap-name">{f.label}</span>
                        <span className="matrix-shap-val mono">{f.value}</span>
                      </div>
                      <div className="matrix-shap-track">
                        <div
                          className="matrix-shap-fill"
                          style={{
                            width: `${Math.min(100, Math.max(12, f.impact * 2.8))}%`,
                            background: f.impact > 25 ? '#E85D68' : f.impact > 12 ? '#F2A51A' : '#0FA89A',
                          }}
                        />
                      </div>
                      <div className="matrix-shap-footer">
                        <span className="tiny muted" style={{ fontSize: 11 }}>{f.description}</span>
                        <span className="mono tiny" style={{ fontWeight: 700, color: f.impact > 20 ? '#E85D68' : '#0FA89A', whiteSpace: 'nowrap' }}>
                          +{f.impact} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* What-If Counterfactual Recommendations */}
              {result.what_if_suggestions && result.what_if_suggestions.length > 0 && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #D8E8E6' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#102A43', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Scale size={14} color="#0FA89A" />
                    <span>Sensitivity & Counterfactual Delays (What-If)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {result.what_if_suggestions.map((s, i) => (
                      <div
                        key={i}
                        style={{
                          background: '#F5FAF9',
                          border: '1px solid #D8E8E6',
                          borderRadius: 8,
                          padding: '8px 12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: 12,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: '#102A43' }}>{s.action}</div>
                          <div className="muted" style={{ fontSize: 11 }}>
                            Current: <span className="mono">{String(s.current_value)}</span> → Target: <span className="mono" style={{ color: '#0FA89A', fontWeight: 600 }}>{String(s.target_value)}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16A878', fontWeight: 700, fontSize: 12 }}>
                          <TrendingDown size={14} />
                          <span>-{s.projected_risk_reduction_pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PredictionOutputView {
  delay_probability: number;
  risk_score: number;
  risk_level: 'Critical' | 'High' | 'Moderate' | 'Low';
  confidence: number;
  delay_window: string;
  recommended_strategy: string;
  factors: Array<{
    feature: string;
    label: string;
    impact: number;
    direction: 'increases_risk' | 'decreases_risk';
    value: string;
    description: string;
  }>;
  what_if_suggestions: WhatIfSuggestion[];
}

function mapResultToView(data: PredictionResult): PredictionOutputView {
  return {
    delay_probability: data.delay_probability,
    risk_score: data.risk_score,
    risk_level: data.risk_level,
    confidence: data.confidence,
    delay_window: data.predicted_delay_window,
    recommended_strategy: data.recommended_strategy,
    factors: (data.top_shap_drivers || data.factor_attributions || []).map((f) => ({
      feature: f.feature,
      label: f.label,
      impact: f.impact_score,
      direction: f.direction,
      value: f.value,
      description: f.description || '',
    })),
    what_if_suggestions: data.what_if_suggestions || [],
  };
}
