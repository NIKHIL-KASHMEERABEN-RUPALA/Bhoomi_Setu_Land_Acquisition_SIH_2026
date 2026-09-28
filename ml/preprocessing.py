"""
BhoomiSetu — Preprocessing Pipeline Architecture
Robust scaling for skewed financial/delay metrics and One-Hot Encoding for state/district/stage
Team: Quorum Intelligence | Problem Statement ID: SIH26016
"""

from typing import List, Tuple
import joblib
from pathlib import Path
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, RobustScaler
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

from ml.config import (
    CATEGORICAL_FEATURES,
    NUMERICAL_BASE_FEATURES,
    ENGINEERED_FEATURES,
    PREPROCESSOR_PATH,
)


def build_preprocessor(
    categorical_cols: List[str] = CATEGORICAL_FEATURES,
    numerical_cols: List[str] = None,
) -> ColumnTransformer:
    """
    Builds a scikit-learn ColumnTransformer that scales continuous features with RobustScaler
    (outlier-resistant) and one-hot encodes categorical administrative variables.

    Parameters:
        categorical_cols: List of categorical feature names.
        numerical_cols: List of numeric feature names (defaults to base + engineered).

    Returns:
        ColumnTransformer pipeline ready for fitting.
    """
    if numerical_cols is None:
        numerical_cols = NUMERICAL_BASE_FEATURES + ENGINEERED_FEATURES

    # Numerical sub-pipeline: Median Imputation + Robust Scaling
    numeric_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", RobustScaler(with_centering=True, with_scaling=True)),
        ]
    )

    # Categorical sub-pipeline: Constant Imputation + OneHotEncoder
    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
            (
                "onehot",
                OneHotEncoder(
                    handle_unknown="ignore",
                    sparse_output=False,
                ),
            ),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numerical_cols),
            ("cat", categorical_transformer, categorical_cols),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )

    return preprocessor


def save_preprocessor(preprocessor: ColumnTransformer, filepath: Path = PREPROCESSOR_PATH) -> None:
    """Serializes the fitted preprocessor to disk using joblib."""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(preprocessor, filepath)
    print(f"[Preprocessing] Preprocessor successfully saved to: {filepath}")


def load_preprocessor(filepath: Path = PREPROCESSOR_PATH) -> ColumnTransformer:
    """Loads a pre-fitted ColumnTransformer from disk."""
    if not filepath.exists():
        raise FileNotFoundError(f"Preprocessor artifact not found at: {filepath}")
    return joblib.load(filepath)
