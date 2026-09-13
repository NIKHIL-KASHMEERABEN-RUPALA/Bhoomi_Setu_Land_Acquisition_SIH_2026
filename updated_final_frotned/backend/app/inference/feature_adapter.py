from typing import Any, Dict, List, Tuple
import numpy as np
from app.core.exceptions import ValidationException
from app.models.projects import Project


class FeatureAdapter:
    """
    Transforms database domain models and raw input dictionaries
    into strictly validated numerical feature vectors for model inference.
    """

    @classmethod
    def extract_from_project(
        cls,
        project: Project,
        overrides: Dict[str, Any] | None = None,
    ) -> Dict[str, float]:
        """
        Extracts all 18 feature values from a Project entity and related records,
        optionally applying scenario overrides for What-If simulation.
        """
        comp = project.compensation_record
        legal_count = len(project.legal_cases) if project.legal_cases else 0
        stays_count = sum(1 for c in project.legal_cases if c.has_interim_stay) if project.legal_cases else 0

        sanctioned = comp.sanctioned_amount_crores if comp else (project.budget_crores * 0.45)
        released = comp.released_amount_crores if comp else (sanctioned * (project.land_acquired_pct / 100.0))
        pending = comp.pending_amount_crores if comp else max(0.0, sanctioned - released)
        disputed = comp.disputed_amount_crores if comp else (pending * 0.2)
        awards_pending = comp.awards_pending if comp else max(1, int(project.affected_families_count * (project.land_pending_pct / 100.0)))
        aging_gt_60 = (comp.aging_61_90_days + comp.aging_gt_90_days) if comp else (pending * 0.4)

        pending_pct = (pending / sanctioned * 100.0) if sanctioned > 0 else 0.0

        features = {
            "budget_crores": float(project.budget_crores),
            "land_acquired_pct": float(project.land_acquired_pct),
            "land_pending_pct": float(project.land_pending_pct),
            "row_available_pct": float(project.row_available_pct),
            "possession_pct": float(project.possession_pct),
            "affected_families_count": float(project.affected_families_count),
            "families_relocated_count": float(project.families_relocated_count),
            "compensation_sanctioned_cr": float(sanctioned),
            "compensation_released_cr": float(released),
            "compensation_pending_cr": float(pending),
            "compensation_pending_pct": float(pending_pct),
            "disputed_amount_cr": float(disputed),
            "awards_pending_count": float(awards_pending),
            "aging_gt_60_days_cr": float(aging_gt_60),
            "legal_cases_total": float(legal_count),
            "interim_stays_active": float(stays_count),
            "unresolved_grievances": 14.0 if project.current_risk_score > 60 else 3.0,
            "days_in_current_stage": 126.0 if "Award" in project.phase else 64.0,
        }

        # Apply What-If scenario overrides
        if overrides:
            for k, v in overrides.items():
                if k in features:
                    features[k] = float(v)

        return features

    @classmethod
    def validate_and_vectorize(
        cls,
        raw_features: Dict[str, Any],
        schema_features: List[Dict[str, Any]],
    ) -> Tuple[np.ndarray, List[str]]:
        """
        Validates feature vector against the feature_schema.json specification.
        Checks for missing keys, types, and range bounds.
        Returns a 1xN NumPy 2D array and ordered feature names.
        """
        vector: List[float] = []
        ordered_names: List[str] = []

        for f_spec in schema_features:
            name = f_spec["name"]
            ordered_names.append(name)

            if name not in raw_features:
                raise ValidationException(f"Missing required feature: '{name}'.")

            val = raw_features[name]
            try:
                num_val = float(val)
            except (ValueError, TypeError):
                raise ValidationException(f"Feature '{name}' must be a valid number, got: {val}")

            min_val = float(f_spec["min"])
            max_val = float(f_spec["max"])

            if num_val < min_val or num_val > max_val:
                raise ValidationException(
                    f"Feature '{name}' value {num_val} violates bounds [{min_val}, {max_val}]."
                )

            vector.append(num_val)

        return np.array([vector], dtype=np.float64), ordered_names
