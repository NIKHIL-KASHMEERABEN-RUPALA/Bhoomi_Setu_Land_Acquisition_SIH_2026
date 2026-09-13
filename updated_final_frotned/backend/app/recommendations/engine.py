from typing import Any, Dict, List
from app.models.decisions import AlertCategoryEnum
from app.models.projects import Project, RiskLevelEnum


class RecommendationEngine:
    """
    Transparent, rule-based decision intelligence engine.
    Does not make autonomous legal or financial commitments.
    Generates actionable administrative recommendations for Collectors and SLAOs.
    """

    @classmethod
    def evaluate_project(cls, project: Project) -> List[Dict[str, Any]]:
        recommendations = []
        comp = project.compensation_record
        legal_count = len(project.legal_cases) if project.legal_cases else 0
        stays_count = sum(1 for c in project.legal_cases if c.has_interim_stay) if project.legal_cases else 0

        # Rule 1: High Compensation Aging & Pendency
        pending_pct = (comp.pending_amount_crores / comp.sanctioned_amount_crores * 100.0) if (comp and comp.sanctioned_amount_crores > 0) else project.land_pending_pct
        if pending_pct > 25.0 or (comp and comp.aging_gt_90_days > 5.0):
            recommendations.append({
                "category": AlertCategoryEnum.COMPENSATION.value,
                "priority": RiskLevelEnum.CRITICAL.value if pending_pct > 40 else RiskLevelEnum.HIGH.value,
                "title": "Convene Special Beneficiary Compensation Disbursement Camp",
                "reason": f"Compensation pendency is at {round(pending_pct, 1)}% with significant awards crossing the 60-day threshold.",
                "recommended_action": "Release verified tranche funds immediately and schedule a 3-day on-site payment camp in priority villages.",
            })

        # Rule 2: Active Judicial Stays / Title Backlog
        if stays_count > 0 or legal_count > 10:
            recommendations.append({
                "category": AlertCategoryEnum.LEGAL.value,
                "priority": RiskLevelEnum.CRITICAL.value if stays_count > 2 else RiskLevelEnum.HIGH.value,
                "title": "Convene District Title-Clearing Cell for Expeditious Disposal",
                "reason": f"{legal_count} active litigation matters and {stays_count} judicial stays impacting the critical path alignment.",
                "recommended_action": "Publish a 14-day resolution docket, brief Government Pleader, and schedule mediation for family partition disputes.",
            })

        # Rule 3: ROW / Physical Possession Bottleneck
        if project.row_available_pct < 75.0 or project.possession_pct < 70.0:
            recommendations.append({
                "category": AlertCategoryEnum.DOCUMENTATION.value,
                "priority": RiskLevelEnum.HIGH.value if project.row_available_pct < 60.0 else RiskLevelEnum.MODERATE.value,
                "title": "Prioritize Joint Utility Shifting & Encroachment Removal",
                "reason": f"Continuous Right of Way is at {round(project.row_available_pct, 1)}%, lagging behind project execution milestones.",
                "recommended_action": "Coordinate with State Electricity Board and Water Authority for priority utility shifting on encumbered chainages.",
            })

        # Rule 4: R&R Resettlement Readiness
        if project.affected_families_count > 300 and project.families_relocated_count < (project.affected_families_count * 0.6):
            recommendations.append({
                "category": AlertCategoryEnum.R_AND_R.value,
                "priority": RiskLevelEnum.MODERATE.value,
                "title": "Validate Resettlement Site Readiness and Civic Infrastructure",
                "reason": "Resettlement site handover is on the critical path for possession certificate issuance.",
                "recommended_action": "Inspect resettlement colony infrastructure (roads, water, electricity) and secure formal gram sabha sign-offs.",
            })

        return recommendations
