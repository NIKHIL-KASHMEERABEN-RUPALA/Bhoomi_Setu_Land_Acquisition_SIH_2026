"""
BhoomiSetu — Counterfactual "What-If" Simulation Engine
Evaluates statutory interventions (e.g., disbursing pending compensation, resolving court stays)
and quantifies real-time risk reduction.
Team: Quorum Intelligence | Problem Statement ID: SIH26016
"""

import sys
from pathlib import Path
from typing import Dict, Any, List
import copy

# Make local imports work when running as script
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ml.predict import predict_delay_risk


def simulate_counterfactual(
    base_project: Dict[str, Any],
    modifications: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Simulates operational interventions by modifying specific project levers.

    Parameters:
        base_project: Dictionary representing current project state.
        modifications: Dictionary of counterfactual parameter overrides.
                       e.g., {"compensation_pending_pct": 10.0, "court_case_count": 0, "possession_pct": 80.0}

    Returns:
        Structured simulation response with before/after probabilities, risk reduction,
        and lever sensitivity breakdown.
    """
    # 1. Baseline Prediction
    baseline_result = predict_delay_risk(base_project)
    p_base = baseline_result["delay_probability"]

    # 2. Apply modifications to create counterfactual project
    simulated_project = copy.deepcopy(base_project)
    for key, new_val in modifications.items():
        simulated_project[key] = new_val

    # Ensure dependent features maintain consistency
    if "compensation_pending_pct" in modifications:
        pct = float(modifications["compensation_pending_pct"])
        awarded = float(simulated_project.get("compensation_awarded_amount", 100.0) or 100.0)
        simulated_project["compensation_pending_amount"] = (pct / 100.0) * awarded
        simulated_project["compensation_paid_amount"] = awarded - simulated_project["compensation_pending_amount"]

    if "possession_pct" in modifications:
        poss = float(modifications["possession_pct"])
        if "row_available_pct" not in modifications:
            simulated_project["row_available_pct"] = min(poss + 5.0, 100.0)

    # 3. Counterfactual Prediction
    simulated_result = predict_delay_risk(simulated_project)
    p_sim = simulated_result["delay_probability"]

    # 4. Impact Analytics
    risk_reduction_points = round((p_base - p_sim) * 100.0, 2)
    risk_reduction_pct = round(((p_base - p_sim) / max(p_base, 1e-4)) * 100.0, 2)

    # 5. Individual Lever Sensitivity Analysis (one-by-one test)
    lever_breakdown = []
    for lever_name, lever_val in modifications.items():
        single_lever_dict = copy.deepcopy(base_project)
        single_lever_dict[lever_name] = lever_val
        single_res = predict_delay_risk(single_lever_dict)
        p_single = single_res["delay_probability"]
        delta_single = round((p_base - p_single) * 100.0, 2)
        lever_breakdown.append({
            "lever": lever_name,
            "baseline_value": base_project.get(lever_name),
            "simulated_value": lever_val,
            "isolated_risk_reduction_points": delta_single,
        })

    # Sort levers by highest impact
    lever_breakdown.sort(key=lambda x: x["isolated_risk_reduction_points"], reverse=True)

    return {
        "project_id": base_project.get("project_id", "SIMULATED_PROJECT"),
        "baseline": {
            "delay_probability": round(p_base, 4),
            "risk_band": baseline_result["risk_band"],
            "risk_trajectory": baseline_result["risk_trajectory"],
        },
        "counterfactual": {
            "delay_probability": round(p_sim, 4),
            "risk_band": simulated_result["risk_band"],
            "risk_trajectory": simulated_result["risk_trajectory"],
        },
        "impact_summary": {
            "risk_reduction_points": risk_reduction_points,
            "risk_reduction_percentage": risk_reduction_pct,
            "band_improved": baseline_result["risk_band"] != simulated_result["risk_band"],
            "statutory_feasibility": "High" if abs(risk_reduction_points) > 15 else "Moderate",
        },
        "applied_modifications": modifications,
        "lever_sensitivities": lever_breakdown,
        "recommended_next_actions": simulated_result["recommended_actions"],
    }


if __name__ == "__main__":
    sample_project = {
        "project_id": "PRJ_NH48_EXPANSION",
        "state": "Gujarat",
        "district": "Gujarat_Dist_04",
        "project_type": "Highway",
        "acquisition_stage": "Compensation Disbursement",
        "project_cost": 500.0,
        "project_length_km": 42.0,
        "land_required_hectares": 140.0,
        "possession_pct": 20.0,
        "compensation_pending_pct": 65.0,
        "court_case_count": 8,
        "days_in_current_stage": 90,
    }

    test_modifications = {
        "compensation_pending_pct": 10.0,
        "court_case_count": 1,
        "possession_pct": 75.0,
    }

    try:
        sim_result = simulate_counterfactual(sample_project, test_modifications)
        print("=== BHOOMISETU WHAT-IF COUNTERFACTUAL RESULT ===")
        import json
        print(json.dumps(sim_result, indent=2))
    except Exception as e:
        print(f"What-if test note: {e}")
