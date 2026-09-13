import json
import os
import sys

# Windows process safety
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

import joblib
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression


def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_dir = os.path.join(base_dir, "model")
    os.makedirs(model_dir, exist_ok=True)

    schema_path = os.path.join(model_dir, "feature_schema.json")
    with open(schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)

    feature_names = [f["name"] for f in schema["features"]]
    n_features = len(feature_names)
    print(f"Generating calibrated baseline for {n_features} features...")

    np.random.seed(42)
    n_samples = 200

    X = np.zeros((n_samples, n_features), dtype=np.float64)
    for idx, feat in enumerate(schema["features"]):
        min_v = float(feat["min"])
        max_v = float(feat["max"])
        X[:, idx] = np.random.uniform(min_v, max_v, size=n_samples)

    # Synthetic realistic delay probability formula based on domain drivers
    # High pending compensation, low ROW, high court stays -> High Delay Probability
    prob = (
        0.30 * (X[:, 10] / 100.0) +  # compensation_pending_pct
        0.25 * (1.0 - X[:, 3] / 100.0) +  # 1 - row_available_pct
        0.25 * np.clip(X[:, 15] / 5.0, 0, 1) +  # interim_stays_active
        0.20 * np.clip(X[:, 17] / 365.0, 0, 1)  # days_in_current_stage
    )
    prob = np.clip(prob + np.random.normal(0, 0.05, n_samples), 0, 1)
    y = (prob > 0.50).astype(int)

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression(random_state=42)),
    ])
    pipeline.fit(X, y)

    output_path = os.path.join(model_dir, "model.joblib")
    joblib.dump(pipeline, output_path)
    print(f"[OK] Successfully wrote model artifact to: {output_path}")


if __name__ == "__main__":
    main()
