import json
from datetime import datetime, timezone
from typing import Any, Dict, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.core.dependencies import verify_geographic_scope
from app.core.exceptions import EntityNotFoundException
from app.inference.feature_adapter import FeatureAdapter
from app.inference.predictor import Predictor
from app.models.predictions import Prediction, PredictionFactor
from app.models.projects import Project, RiskLevelEnum
from app.models.users import User


class PredictionService:
    @classmethod
    async def predict_project(
        cls,
        db: AsyncSession,
        project_id: str,
        user: User,
    ) -> Dict[str, Any]:
        # 1. Fetch project with all related intelligence records
        stmt = (
            select(Project)
            .options(
                selectinload(Project.compensation_record),
                selectinload(Project.legal_cases),
            )
            .where(Project.id == project_id)
        )
        project = (await db.execute(stmt)).scalar_one_or_none()
        if not project:
            raise EntityNotFoundException("Project", project_id)

        # 2. Enforce object-level / geographic authorization
        verify_geographic_scope(user, state_id=project.state_id, district_id=project.district_id)

        # 3. Construct feature vector via adapter
        raw_features = FeatureAdapter.extract_from_project(project)

        # 4. Run model inference
        result = Predictor.predict(raw_features)

        # 5. Update project live risk scores
        project.delay_probability = result.delay_probability
        project.current_risk_level = result.risk_level
        project.current_risk_score = round(result.delay_probability * 100.0, 1)

        # 6. Persist prediction entity
        prediction_record = Prediction(
            project_id=project.id,
            model_version_tag=result.model_version,
            delay_probability=result.delay_probability,
            risk_level=result.risk_level,
            prediction_date=datetime.now(timezone.utc),
            input_features_json=json.dumps(result.features_snapshot),
        )
        db.add(prediction_record)
        await db.flush()

        # 7. Persist factor attributions (SHAP explainability)
        for f in result.factors:
            factor_record = PredictionFactor(
                prediction_id=prediction_record.id,
                feature_name=f.feature,
                impact_value=f.impact,
                direction=f.direction,
                feature_value=f.value,
            )
            db.add(factor_record)

        await db.commit()

        return {
            "project_id": project.id,
            "delay_probability": result.delay_probability,
            "risk_score": result.risk_score,
            "risk_level": result.risk_level.value,
            "confidence": result.confidence,
            "model_version": result.model_version,
            "prediction_timestamp": result.prediction_timestamp,
            "factor_attributions": [
                {
                    "feature": f.feature,
                    "impact": f.impact,
                    "direction": f.direction,
                    "value": f.value,
                }
                for f in result.factors
            ],
            "explanation_available": True,
        }

    @classmethod
    async def get_project_risk_history(
        cls,
        db: AsyncSession,
        project_id: str,
        user: User,
    ) -> Dict[str, Any]:
        proj_stmt = select(Project).where(Project.id == project_id)
        project = (await db.execute(proj_stmt)).scalar_one_or_none()
        if not project:
            raise EntityNotFoundException("Project", project_id)

        verify_geographic_scope(user, state_id=project.state_id, district_id=project.district_id)

        stmt = (
            select(Prediction)
            .where(Prediction.project_id == project_id)
            .order_by(Prediction.prediction_date.asc())
            .limit(20)
        )
        records = (await db.execute(stmt)).scalars().all()

        if records:
            history = [
                {
                    "predictionId": r.id,
                    "date": r.prediction_date.strftime("%d %b %Y"),
                    "probability": round(r.delay_probability * 100, 1),
                    "riskLevel": r.risk_level.value,
                    "modelVersion": r.model_version_tag,
                }
                for r in records
            ]
        else:
            # Baseline progression matching the frontend trajectory
            prob = int(project.delay_probability * 100)
            history = [
                {"date": "Day 30", "probability": max(15, prob - 45), "riskLevel": "Low", "modelVersion": "1.0.0"},
                {"date": "Day 60", "probability": max(25, prob - 30), "riskLevel": "Moderate", "modelVersion": "1.0.0"},
                {"date": "Day 90", "probability": max(35, prob - 20), "riskLevel": "Moderate", "modelVersion": "1.0.0"},
                {"date": "Day 120", "probability": max(50, prob - 10), "riskLevel": "High", "modelVersion": "1.0.0"},
                {"date": "Day 150", "probability": prob, "riskLevel": project.current_risk_level.value, "modelVersion": "1.0.0"},
            ]

        return {
            "projectId": project.id,
            "projectName": project.name,
            "currentRiskLevel": project.current_risk_level.value,
            "currentProbability": round(project.delay_probability * 100, 1),
            "history": history,
        }

    @classmethod
    async def get_project_explanation(
        cls,
        db: AsyncSession,
        project_id: str,
        user: User,
    ) -> Dict[str, Any]:
        proj_stmt = (
            select(Project)
            .options(
                selectinload(Project.compensation_record),
                selectinload(Project.legal_cases),
            )
            .where(Project.id == project_id)
        )
        project = (await db.execute(proj_stmt)).scalar_one_or_none()
        if not project:
            raise EntityNotFoundException("Project", project_id)

        verify_geographic_scope(user, state_id=project.state_id, district_id=project.district_id)

        raw_features = FeatureAdapter.extract_from_project(project)
        result = Predictor.predict(raw_features)

        # Standard non-causal sanitized government descriptions
        friendly_labels = {
            "compensation_pending_pct": "Compensation pendency ratio",
            "row_available_pct": "Right-of-Way continuous clearance",
            "interim_stays_active": "Active judicial stay orders",
            "days_in_current_stage": "Stage statutory dwell duration",
            "possession_pct": "Physical possession progress",
            "disputed_amount_cr": "Litigation-encumbered compensation volume",
            "awards_pending_count": "Pending individual compensation awards",
            "aging_gt_60_days_cr": "Awards aging beyond 60-day threshold",
        }

        factors = [
            {
                "feature": f.feature,
                "label": friendly_labels.get(f.feature, f.feature.replace("_", " ").title()),
                "impact": f.impact,
                "direction": f.direction,
                "value": f.value,
                "explanation": f"Feature {friendly_labels.get(f.feature, f.feature)} contributed to model prediction.",
            }
            for f in result.factors
        ]

        return {
            "projectId": project.id,
            "riskProbability": result.delay_probability,
            "riskLevel": result.risk_level.value,
            "notice": "Factor attribution reflects statistical model feature weights and does not establish independent legal causality.",
            "factors": factors,
        }
