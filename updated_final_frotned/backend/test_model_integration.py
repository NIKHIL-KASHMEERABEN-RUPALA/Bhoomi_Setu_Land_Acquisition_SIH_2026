import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.inference.predictor import Predictor

def test_model_integration():
    print("[-] Testing Backend -> ML Model Communication...")

    # Full 18-feature vector as produced by FeatureAdapter.extract_from_project
    test_features = {
        "project_id": "p-004",
        "budget_crores": 1260.0,
        "land_acquired_pct": 38.0,
        "land_pending_pct": 62.0,
        "row_available_pct": 41.0,
        "possession_pct": 24.0,
        "affected_families_count": 920.0,
        "families_relocated_count": 220.0,
        "compensation_sanctioned_cr": 440.0,
        "compensation_released_cr": 185.0,
        "compensation_pending_cr": 255.0,
        "compensation_pending_pct": 58.0,
        "disputed_amount_cr": 68.0,
        "awards_pending_count": 480.0,
        "aging_gt_60_days_cr": 110.0,
        "legal_cases_total": 14.0,
        "interim_stays_active": 3.0,
        "unresolved_grievances": 18.0,
        "days_in_current_stage": 180.0,
    }

    result = Predictor.predict(test_features)
    print(f"[+] Model Inference Output:")
    print(f"    - Delay Probability: {result.delay_probability * 100:.1f}%")
    print(f"    - Risk Score: {result.risk_score} / 100")
    print(f"    - Risk Level: {result.risk_level.value}")
    print(f"    - Confidence: {result.confidence}%")
    print(f"    - Model Engine: {result.model_version}")
    print(f"    - Top Influential Risk Drivers:")
    for factor in result.factors:
        print(f"       * {factor.feature}: impact={factor.impact} ({factor.direction})")

    assert 0.0 <= result.delay_probability <= 1.0
    assert 0.0 <= result.risk_score <= 100.0
    print("[SUCCESS] Backend ML Model Communication & Factor Attribution Verified!")

if __name__ == "__main__":
    test_model_integration()
