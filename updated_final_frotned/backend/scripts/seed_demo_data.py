"""
Gujarat Infrastructure Synthetic Demo Data Seeder for BhoomiSetu.
Seeds administrative officers, Gujarat districts, major infrastructure projects,
financial tranches, court cases, alerts, and baseline ML predictions.
Labeled strictly as demo/synthetic for SIH presentation.
"""

import asyncio
import json
import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date, datetime, timezone
from sqlalchemy import select
from app.core.security import get_password_hash
from app.db.base import Base
from app.db.session import get_engine, get_sessionmaker
from app.models.audit import AuditLog
from app.models.compensation import CompensationDispute, CompensationRecord
from app.models.decisions import Alert, AlertCategoryEnum, AlertStatusEnum, Intervention, InterventionStatusEnum, Recommendation
from app.models.geography import District, State, Taluka, Village
from app.models.legal import LegalCase
from app.models.predictions import ModelVersion, Prediction, PredictionFactor
from app.models.projects import AcquisitionStage, Milestone, Project, ProjectCorridor, ProjectTypeEnum, RiskLevelEnum, StageStatusEnum
from app.models.social import RehabilitationResettlement
from app.models.users import RoleEnum, User


async def seed_data():
    print("[*] Starting BhoomiSetu Gujarat Synthetic Data Seeder...")

    engine = get_engine()
    # Create all database tables if they do not exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    sessionmaker = get_sessionmaker()
    async with sessionmaker() as db:
        # Check if already seeded
        existing_user = await db.execute(select(User).where(User.email == "admin@bhoomi.gov.in"))
        if existing_user.scalar_one_or_none():
            print("[INFO] Database already contains seed records. Skipping redundant seed.")
            return

        print("[*] Seeding State (Gujarat)...")
        state_gj = State(id="s-gj", name="Gujarat", code="GJ")
        db.add(state_gj)
        await db.flush()

        print("[*] Seeding 8 Gujarat Districts...")
        district_data = [
            {"id": "d-01", "name": "Kutch", "x": 19.0, "y": 39.0, "monitored": 14, "at_risk": 7, "delay": 6.4, "risk_rate": 50.0, "comp": 22.8, "legal": 31},
            {"id": "d-02", "name": "Bharuch", "x": 47.0, "y": 69.0, "monitored": 12, "at_risk": 5, "delay": 4.6, "risk_rate": 41.7, "comp": 16.2, "legal": 24},
            {"id": "d-03", "name": "Surat", "x": 51.0, "y": 84.0, "monitored": 18, "at_risk": 6, "delay": 3.2, "risk_rate": 33.3, "comp": 12.8, "legal": 19},
            {"id": "d-04", "name": "Ahmedabad", "x": 35.0, "y": 49.0, "monitored": 23, "at_risk": 3, "delay": 1.8, "risk_rate": 13.0, "comp": 4.1, "legal": 11},
            {"id": "d-05", "name": "Vadodara", "x": 55.0, "y": 58.0, "monitored": 16, "at_risk": 4, "delay": 2.7, "risk_rate": 25.0, "comp": 8.4, "legal": 15},
            {"id": "d-06", "name": "Rajkot", "x": 30.0, "y": 57.0, "monitored": 11, "at_risk": 3, "delay": 3.1, "risk_rate": 27.3, "comp": 6.9, "legal": 13},
            {"id": "d-07", "name": "Anand", "x": 48.0, "y": 58.0, "monitored": 9, "at_risk": 2, "delay": 2.2, "risk_rate": 22.2, "comp": 3.8, "legal": 7},
            {"id": "d-08", "name": "Mehsana", "x": 39.0, "y": 34.0, "monitored": 10, "at_risk": 2, "delay": 1.9, "risk_rate": 20.0, "comp": 3.2, "legal": 8},
        ]
        districts_map = {}
        for d in district_data:
            dist = District(
                id=d["id"],
                state_id=state_gj.id,
                name=d["name"],
                map_x=d["x"],
                map_y=d["y"],
                monitored_projects_count=d["monitored"],
                at_risk_projects_count=d["at_risk"],
                average_delay_months=d["delay"],
                risk_rate_pct=d["risk_rate"],
                compensation_pending_crores=d["comp"],
                legal_cases_count=d["legal"],
            )
            db.add(dist)
            districts_map[d["name"]] = dist
        await db.flush()

        print("[*] Seeding Government Administrative Officers (Argon2id)...")
        users = [
            User(id="u-admin-01", email="admin@bhoomi.gov.in", hashed_password=get_password_hash("Admin@Bhoomi2025!"), full_name="Sanjay Verma, IAS", role=RoleEnum.CENTRAL_ADMIN),
            User(id="u-state-01", email="state.gujarat@bhoomi.gov.in", hashed_password=get_password_hash("Gujarat@Admin2025!"), full_name="R. K. Shah, IAS", role=RoleEnum.STATE_ADMIN, state_id=state_gj.id),
            User(id="u-kutch-01", email="collector.kutch@bhoomi.gov.in", hashed_password=get_password_hash("Kutch@Collector2025!"), full_name="Amit Nagpal, IAS", role=RoleEnum.DISTRICT_OFFICER, state_id=state_gj.id, district_id="d-01"),
            User(id="u-anand-01", email="collector.anand@bhoomi.gov.in", hashed_password=get_password_hash("Anand@Collector2025!"), full_name="Meera Joshi, GAS", role=RoleEnum.DISTRICT_OFFICER, state_id=state_gj.id, district_id="d-07"),
            User(id="u-ahmedabad-01", email="collector.ahmedabad@bhoomi.gov.in", hashed_password=get_password_hash("Ahmedabad@Collector2025!"), full_name="Pravin Solanki, IAS", role=RoleEnum.DISTRICT_OFFICER, state_id=state_gj.id, district_id="d-04"),
            User(id="u-analyst-01", email="analyst@bhoomi.gov.in", hashed_password=get_password_hash("Analyst@Bhoomi2025!"), full_name="Arjun Patel", role=RoleEnum.ANALYST, state_id=state_gj.id),
            User(id="u-viewer-01", email="viewer@bhoomi.gov.in", hashed_password=get_password_hash("Viewer@Bhoomi2025!"), full_name="Public Information Desk", role=RoleEnum.VIEWER),
        ]
        db.add_all(users)
        await db.flush()

        print("[*] Seeding 5 Flagship Gujarat Infrastructure Projects...")
        projects_data = [
            {
                "id": "p-001",
                "name": "Dholera–Ahmedabad Connector",
                "code": "DAC/GJ/14",
                "district": "Ahmedabad",
                "type": ProjectTypeEnum.EXPRESSWAY,
                "phase": "Possession & handover",
                "risk_level": RiskLevelEnum.LOW,
                "risk_score": 24.0,
                "delay_prob": 0.18,
                "delay_window": "On track",
                "budget": 890.0,
                "families": 430,
                "relocated": 415,
                "acquired": 92.0,
                "pending": 8.0,
                "row": 88.0,
                "possession": 85.0,
                "blocker": "3 residual cases",
            },
            {
                "id": "p-002",
                "name": "Mumbai–Ahmedabad High-Speed Rail · GJ-2",
                "code": "MAHSR/GJ/02",
                "district": "Anand",
                "type": ProjectTypeEnum.HIGH_SPEED_RAIL,
                "phase": "Award & compensation",
                "risk_level": RiskLevelEnum.HIGH,
                "risk_score": 69.0,
                "delay_prob": 0.64,
                "delay_window": "4–7 months",
                "budget": 1260.0,
                "families": 920,
                "relocated": 580,
                "acquired": 74.0,
                "pending": 26.0,
                "row": 68.0,
                "possession": 62.0,
                "blocker": "214 awards pending payment",
            },
            {
                "id": "p-003",
                "name": "Delhi–Mumbai Expressway · Gujarat Package",
                "code": "DME/GJ/07",
                "district": "Bharuch",
                "type": ProjectTypeEnum.EXPRESSWAY,
                "phase": "Social impact assessment",
                "risk_level": RiskLevelEnum.MODERATE,
                "risk_score": 49.0,
                "delay_prob": 0.42,
                "delay_window": "2–4 months",
                "budget": 742.0,
                "families": 610,
                "relocated": 380,
                "acquired": 58.0,
                "pending": 42.0,
                "row": 54.0,
                "possession": 48.0,
                "blocker": "Village register reconciliation",
            },
            {
                "id": "p-004",
                "name": "Western Dedicated Freight Corridor · Package 8",
                "code": "WDFC/GJ/08",
                "district": "Kutch",
                "type": ProjectTypeEnum.FREIGHT_CORRIDOR,
                "phase": "Award & compensation",
                "risk_level": RiskLevelEnum.CRITICAL,
                "risk_score": 84.0,
                "delay_prob": 0.79,
                "delay_window": "8–12 months",
                "budget": 488.0,
                "families": 1180,
                "relocated": 620,
                "acquired": 61.0,
                "pending": 39.0,
                "row": 49.0,
                "possession": 42.0,
                "blocker": "87 survey numbers under legal review",
            },
            {
                "id": "p-005",
                "name": "Surat Metro · North–South Extension",
                "code": "SM/NSE/GJ",
                "district": "Surat",
                "type": ProjectTypeEnum.METRO_RAIL,
                "phase": "Social impact assessment",
                "risk_level": RiskLevelEnum.MODERATE,
                "risk_score": 43.0,
                "delay_prob": 0.37,
                "delay_window": "2–4 months",
                "budget": 384.0,
                "families": 260,
                "relocated": 190,
                "acquired": 48.0,
                "pending": 52.0,
                "row": 44.0,
                "possession": 40.0,
                "blocker": "17 co-owner records pending partition",
            },
        ]

        for p_data in projects_data:
            dist = districts_map[p_data["district"]]
            proj = Project(
                id=p_data["id"],
                name=p_data["name"],
                project_code=p_data["code"],
                state_id=state_gj.id,
                district_id=dist.id,
                project_type=p_data["type"],
                phase=p_data["phase"],
                budget_crores=p_data["budget"],
                expenditure_crores=round(p_data["budget"] * 0.65, 1),
                current_risk_level=p_data["risk_level"],
                current_risk_score=p_data["risk_score"],
                delay_probability=p_data["delay_prob"],
                predicted_delay_window=p_data["delay_window"],
                model_confidence=0.88,
                land_acquired_pct=p_data["acquired"],
                land_pending_pct=p_data["pending"],
                row_available_pct=p_data["row"],
                possession_pct=p_data["possession"],
                affected_families_count=p_data["families"],
                families_relocated_count=p_data["relocated"],
            )

            # Stages
            stages = [
                AcquisitionStage(stage_name="Preliminary notification", stage_order=1, status=StageStatusEnum.COMPLETE, duration="28d", expected_duration="30d", delay_days=-2, responsible_authority="Revenue Department"),
                AcquisitionStage(stage_name="Social impact assessment", stage_order=2, status=StageStatusEnum.CURRENT if p_data["phase"] == "Social impact assessment" else StageStatusEnum.COMPLETE, duration="64d" if p_data["phase"] == "Social impact assessment" else "58d", expected_duration="60d", delay_days=4 if p_data["phase"] == "Social impact assessment" else -2, responsible_authority="District Collector", primary_blocker=p_data["blocker"] if p_data["phase"] == "Social impact assessment" else None),
                AcquisitionStage(stage_name="Award & compensation", stage_order=3, status=StageStatusEnum.CURRENT if p_data["phase"] == "Award & compensation" else (StageStatusEnum.COMPLETE if p_data["phase"] == "Possession & handover" else StageStatusEnum.PENDING), duration="126d" if p_data["phase"] == "Award & compensation" else ("84d" if p_data["phase"] == "Possession & handover" else "—"), expected_duration="90d", delay_days=36 if p_data["phase"] == "Award & compensation" else 0, responsible_authority="Special LAO", primary_blocker=p_data["blocker"] if p_data["phase"] == "Award & compensation" else None),
                AcquisitionStage(stage_name="Possession & handover", stage_order=4, status=StageStatusEnum.CURRENT if p_data["phase"] == "Possession & handover" else StageStatusEnum.PENDING, duration="37d" if p_data["phase"] == "Possession & handover" else "—", expected_duration="45d", delay_days=-8 if p_data["phase"] == "Possession & handover" else 0, responsible_authority="Project Director", primary_blocker=p_data["blocker"] if p_data["phase"] == "Possession & handover" else None),
            ]
            proj.lifecycle_stages = stages

            # Milestones
            milestones = [
                Milestone(statutory_section="RFCTLARR Section 4(1)", title="Preliminary Notification Publication", target_date=date(2024, 1, 15), achieved_date=date(2024, 1, 12), is_statutory_sla_breached=False),
                Milestone(statutory_section="RFCTLARR Section 11(1)", title="Declaration of Acquisition Scheme", target_date=date(2024, 4, 30), achieved_date=date(2024, 4, 28), is_statutory_sla_breached=False),
                Milestone(statutory_section="RFCTLARR Section 19(1)", title="Final Award Determination", target_date=date(2024, 8, 15), achieved_date=date(2024, 9, 20) if p_data["risk_score"] > 60 else date(2024, 8, 10), is_statutory_sla_breached=p_data["risk_score"] > 60),
                Milestone(statutory_section="RFCTLARR Section 23", title="Possession Handover Certificate", target_date=date(2025, 6, 30), achieved_date=None, is_statutory_sla_breached=False),
            ]
            proj.milestones = milestones

            # Financial records with realistic aging buckets
            sanctioned = round(p_data["budget"] * 0.45, 1)
            released = round(sanctioned * (p_data["acquired"] / 100.0), 1)
            pending = round(sanctioned - released, 1)
            comp_record = CompensationRecord(
                project_id=p_data["id"],
                sanctioned_amount_crores=sanctioned,
                released_amount_crores=released,
                utilized_amount_crores=round(released * 0.9, 1),
                pending_amount_crores=pending,
                disputed_amount_crores=round(pending * 0.28, 1),
                awards_total=int(p_data["families"] * 0.8),
                awards_disbursed=int(p_data["families"] * (p_data["acquired"] / 100.0)),
                awards_pending=int(p_data["families"] * (p_data["pending"] / 100.0)),
                aging_0_30_days=round(pending * 0.35, 1),
                aging_31_60_days=round(pending * 0.25, 1),
                aging_61_90_days=round(pending * 0.20, 1),
                aging_gt_90_days=round(pending * 0.20, 1),
            )
            proj.compensation_record = comp_record

            # Legal cases
            if p_data["risk_score"] > 60:
                legal = LegalCase(
                    project_id=p_data["id"],
                    case_number="SCA/4821/2024",
                    court_name="High Court of Gujarat",
                    case_type="Title Dispute & Compensation Enhancement",
                    has_interim_stay=True,
                    filing_date=date(2024, 5, 12),
                    last_hearing_date=date(2025, 5, 20),
                    next_hearing_date=date(2025, 6, 28),
                    status="Stay Granted",
                    summary="Interim injunction on 18 survey numbers pending family partition verification.",
                )
                proj.legal_cases.append(legal)

            # R&R
            rr = RehabilitationResettlement(
                project_id=p_data["id"],
                affected_families_count=p_data["families"],
                relocated_families_count=p_data["relocated"],
                sites_ready_pct=round(p_data["possession"] * 0.95, 1),
                infrastructure_ready=p_data["risk_score"] < 60,
                pending_amenities_count=2 if p_data["risk_score"] > 60 else 0,
            )

            # Baseline Prediction
            pred = Prediction(
                project_id=p_data["id"],
                model_version_tag="1.0.0",
                delay_probability=p_data["delay_prob"],
                risk_level=p_data["risk_level"],
                prediction_date=datetime.now(timezone.utc),
                input_features_json=json.dumps({"budget_crores": p_data["budget"], "pending_pct": p_data["pending"]}),
            )
            proj.predictions.append(pred)

            db.add(proj)
            db.add(rr)

        print("[*] Seeding Corridors...")
        corridors = [
            ProjectCorridor(id="c-01", name="Western Dedicated Freight Corridor", code="WDFC/GJ", route_description="Kutch → Mehsana → Ahmedabad → Bharuch", risk_level=RiskLevelEnum.CRITICAL, risk_score=84.0, projects_count=8, exposed_value_crores=1240.0, lead_signal="Title review backlog", nodes_json=json.dumps([{"label": "Kutch", "x": 17, "y": 38, "riskLevel": "Critical"}, {"label": "Mehsana", "x": 39, "y": 33, "riskLevel": "Low"}, {"label": "Ahmedabad", "x": 35, "y": 49, "riskLevel": "Low"}, {"label": "Bharuch", "x": 47, "y": 70, "riskLevel": "High"}])),
            ProjectCorridor(id="c-02", name="Mumbai–Ahmedabad High-Speed Rail", code="MAHSR/GJ", route_description="Ahmedabad → Anand → Surat", risk_level=RiskLevelEnum.HIGH, risk_score=69.0, projects_count=6, exposed_value_crores=980.0, lead_signal="Compensation aging", nodes_json=json.dumps([{"label": "Ahmedabad", "x": 35, "y": 49, "riskLevel": "Low"}, {"label": "Anand", "x": 48, "y": 58, "riskLevel": "High"}, {"label": "Surat", "x": 51, "y": 84, "riskLevel": "Moderate"}])),
            ProjectCorridor(id="c-03", name="Dholera SIR Connector", code="DSC/GJ", route_description="Ahmedabad → Dholera", risk_level=RiskLevelEnum.LOW, risk_score=24.0, projects_count=4, exposed_value_crores=620.0, lead_signal="Residual cases", nodes_json=json.dumps([{"label": "Ahmedabad", "x": 35, "y": 49, "riskLevel": "Low"}, {"label": "Dholera", "x": 30, "y": 66, "riskLevel": "Low"}])),
        ]
        db.add_all(corridors)

        print("[*] Seeding Alerts...")
        alerts = [
            Alert(id="a-01", project_id="p-004", category=AlertCategoryEnum.LEGAL, severity=RiskLevelEnum.CRITICAL, primary_cause="87 survey numbers remain under title review", predicted_delay="8–12 months", confidence=0.92, recommended_intervention="Convene district title-clearing cell and publish a 14-day resolution docket", status=AlertStatusEnum.OPEN),
            Alert(id="a-02", project_id="p-002", category=AlertCategoryEnum.COMPENSATION, severity=RiskLevelEnum.HIGH, primary_cause="214 awards have crossed the 60-day payment threshold", predicted_delay="4–7 months", confidence=0.86, recommended_intervention="Release the verified tranche and schedule a beneficiary payment camp", status=AlertStatusEnum.ASSIGNED),
            Alert(id="a-03", project_id="p-003", category=AlertCategoryEnum.DOCUMENTATION, severity=RiskLevelEnum.MODERATE, primary_cause="Village register reconciliation is behind the SIA critical path", predicted_delay="2–4 months", confidence=0.78, recommended_intervention="Deploy the district record reconciliation cell for two weeks", status=AlertStatusEnum.MONITORING),
            Alert(id="a-04", project_id="p-005", category=AlertCategoryEnum.OWNERSHIP, severity=RiskLevelEnum.MODERATE, primary_cause="17 co-owner records require partition validation", predicted_delay="2–4 months", confidence=0.81, recommended_intervention="Start pre-award mediation in the three priority villages", status=AlertStatusEnum.OPEN),
            Alert(id="a-05", project_id="p-001", category=AlertCategoryEnum.R_AND_R, severity=RiskLevelEnum.LOW, primary_cause="Three residual cases have moved the handover date", predicted_delay="1–2 months", confidence=0.72, recommended_intervention="Confirm site readiness with the R&R authority", status=AlertStatusEnum.OPEN),
        ]
        db.add_all(alerts)

        print("[*] Seeding Interventions...")
        interventions = [
            Intervention(id="i-01", project_id="p-004", title="Clear Kutch title review docket", owner="Legal Cell — Kutch", status=InterventionStatusEnum.OPEN, due_date=date(2025, 6, 18)),
            Intervention(id="i-02", project_id="p-002", title="Release verified compensation tranche", owner="Finance — Anand", status=InterventionStatusEnum.IN_PROGRESS, due_date=date(2025, 6, 22)),
            Intervention(id="i-03", project_id="p-003", title="Reconcile Bharuch village registers", owner="Records — Bharuch", status=InterventionStatusEnum.IN_PROGRESS, due_date=date(2025, 6, 26)),
        ]
        db.add_all(interventions)

        print("[*] Seeding Audit Entries...")
        audit_entries = [
            AuditLog(id="au-001", actor_id="user-01", actor_email="state.gujarat@bhoomi.gov.in", actor_role="State Control Room", action="Generated policy briefing", resource_type="Briefing", resource_id="BRF-GJ-250612-01", request_id="req-001", status="Success", detail="Portfolio briefing generated for all monitored Gujarat projects at 88% model confidence."),
            AuditLog(id="au-002", actor_id="user-02", actor_email="collector.anand@bhoomi.gov.in", actor_role="District Program Unit", action="Accepted intervention", resource_type="Intervention", resource_id="INT-KUTCH-004", request_id="req-002", status="Success", detail="Title-clearing docket accepted by Legal Cell — Kutch; due 18 Jun 2025."),
            AuditLog(id="au-003", actor_id="user-01", actor_email="state.gujarat@bhoomi.gov.in", actor_role="State Control Room", action="Export requested", resource_type="Project", resource_id="WDFC/GJ/08", request_id="req-003", status="Review", detail="Export contains project-level affected-family data and requires second-person review."),
        ]
        db.add_all(audit_entries)

        await db.commit()
        print("[SUCCESS] All Gujarat synthetic data seeded successfully into SQLite/PostgreSQL database!")


if __name__ == "__main__":
    asyncio.run(seed_data())
