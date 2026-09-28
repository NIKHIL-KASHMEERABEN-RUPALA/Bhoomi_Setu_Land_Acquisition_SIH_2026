import { runBhoomiSetuInference } from './src/lib/ml-engine.ts';

const testInput = {
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
};

const result = runBhoomiSetuInference(testInput);
console.log('=== BHOOMISETU ML INFERENCE TEST OUTPUT ===');
console.log('PROJECT ID:', result.project_id);
console.log('DELAY PROBABILITY:', (result.delay_probability * 100).toFixed(1) + '%');
console.log('RISK SCORE:', result.risk_score);
console.log('RISK LEVEL:', result.risk_level);
console.log('PREDICTED DELAY WINDOW:', result.predicted_delay_window);
console.log('\nTOP SHAPLEY FACTOR ATTRIBUTIONS (TreeSHAP):');
result.top_shap_drivers.forEach((d, i) => {
  console.log(` ${i + 1}. [${d.direction === 'increases_risk' ? '+' : '-'}${d.impact_score} pts] ${d.label} -> ${d.value}`);
});
console.log('\nRECOMMENDED STRATEGY:\n', result.recommended_strategy);
console.log('\nWHAT-IF SCENARIOS:');
result.what_if_suggestions.forEach(s => {
  console.log(` • ${s.action}: ${s.current_value} -> ${s.target_value} (Reduces Risk by ${s.projected_risk_reduction_pct}%)`);
});
