import csv
import json
import os
import uuid
from datetime import date, datetime, timezone
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.db.session import get_db
from app.models.audit import AuditLog
from app.models.decisions import (
    Alert,
    AlertCategoryEnum,
    AlertStatusEnum,
    Intervention,
    InterventionStatusEnum,
)
from app.models.geography import District, State
from app.models.projects import (
    Project,
    ProjectTypeEnum,
    RiskLevelEnum,
)
from app.schemas.ingest import IngestPayload, IngestResponse

router = APIRouter(prefix="/ingest", tags=["Data Ingestion & Dataset Generation"])


def map_risk_level(val: str) -> RiskLevelEnum:
    v = val.strip().capitalize()
    if v == "Critical":
        return RiskLevelEnum.CRITICAL
    if v == "High":
        return RiskLevelEnum.HIGH
    if v == "Moderate":
        return RiskLevelEnum.MODERATE
    return RiskLevelEnum.LOW


def map_alert_category(val: str) -> AlertCategoryEnum:
    v = val.strip().lower()
    if "legal" in v:
        return AlertCategoryEnum.LEGAL
    if "comp" in v:
        return AlertCategoryEnum.COMPENSATION
    if "doc" in v or "record" in v:
        return AlertCategoryEnum.DOCUMENTATION
    if "owner" in v or "title" in v:
        return AlertCategoryEnum.OWNERSHIP
    return AlertCategoryEnum.R_AND_R


def map_alert_status(val: str) -> AlertStatusEnum:
    v = val.strip().capitalize()
    if v == "Assigned":
        return AlertStatusEnum.ASSIGNED
    if v == "Monitoring":
        return AlertStatusEnum.MONITORING
    if v == "Resolved":
        return AlertStatusEnum.RESOLVED
    return AlertStatusEnum.OPEN


def map_intervention_status(val: str) -> InterventionStatusEnum:
    v = val.strip().lower()
    if "progress" in v:
        return InterventionStatusEnum.IN_PROGRESS
    if "comp" in v:
        return InterventionStatusEnum.COMPLETE
    return InterventionStatusEnum.OPEN


@router.post(
    "",
    response_model=IngestResponse,
    status_code=status.HTTP_200_OK,
    summary="Ingest real-time frontend telemetry, generate local dataset, and upload to PostgreSQL",
)
async def ingest_realtime_data(
    payload: IngestPayload,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Receives frontend telemetry / dataset payload, generates local physical dataset files
    (JSON and CSV) in backend/data/, and uploads/upserts records into the connected database (Supabase/PostgreSQL).
    """
    sync_time = datetime.now(timezone.utc)
    backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    data_dir = os.path.join(backend_root, "data")
    os.makedirs(data_dir, exist_ok=True)

    json_path = os.path.join(data_dir, "generated_dataset.json")
    projects_csv_path = os.path.join(data_dir, "projects_dataset.csv")
    districts_csv_path = os.path.join(data_dir, "districts_dataset.csv")
    generated_files = [json_path, projects_csv_path, districts_csv_path]

    # 1. Generate local JSON dataset file
    payload_dict = payload.model_dump()
    payload_dict["ingested_at"] = sync_time.isoformat()
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(payload_dict, f, indent=2)

    # 2. Generate local CSV datasets
    if payload.projects:
        with open(projects_csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "id", "name", "project_code", "district", "phase",
                "risk_level", "risk_score", "delay_probability",
                "predicted_delay_window", "confidence", "budget", "affected_families"
            ])
            for p in payload.projects:
                writer.writerow([
                    p.id, p.name, p.projectCode, p.district, p.phase,
                    p.riskLevel, p.riskScore, p.delayProbability,
                    p.predictedDelayWindow, p.confidence, p.budget, p.affectedFamilies
                ])

    if payload.districts:
        with open(districts_csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "id", "name", "monitored_projects", "at_risk_projects",
                "average_delay", "risk_rate", "compensation_pending", "legal_cases"
            ])
            for d in payload.districts:
                writer.writerow([
                    d.id, d.name, d.monitoredProjects, d.atRiskProjects,
                    d.averageDelay, d.riskRate, d.compensationPending, d.legalCases
                ])

    # 3. Database Ingestion & Upsert into Supabase / PostgreSQL
    # Ensure all tables exist
    from app.db.base import Base
    from app.db.session import get_engine
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Ensure default State exists
    state_res = await db.execute(select(State).where(State.id == "s-gj"))
    state_gj = state_res.scalar_one_or_none()
    if not state_gj:
        state_gj = State(id="s-gj", name="Gujarat", code="GJ")
        db.add(state_gj)
        await db.flush()

    district_name_to_id: Dict[str, str] = {}

    # Upsert Districts
    for d_in in payload.districts:
        d_res = await db.execute(select(District).where(District.name == d_in.name))
        district_obj = d_res.scalar_one_or_none()
        mx = d_in.mapPosition.x if d_in.mapPosition else 50.0
        my = d_in.mapPosition.y if d_in.mapPosition else 50.0

        if district_obj:
            district_obj.monitored_projects_count = d_in.monitoredProjects
            district_obj.at_risk_projects_count = d_in.atRiskProjects
            district_obj.average_delay_months = d_in.averageDelay
            district_obj.risk_rate_pct = d_in.riskRate
            district_obj.compensation_pending_crores = d_in.compensationPending
            district_obj.legal_cases_count = d_in.legalCases
            district_obj.map_x = mx
            district_obj.map_y = my
        else:
            district_obj = District(
                id=d_in.id,
                state_id=state_gj.id,
                name=d_in.name,
                map_x=mx,
                map_y=my,
                monitored_projects_count=d_in.monitoredProjects,
                at_risk_projects_count=d_in.atRiskProjects,
                average_delay_months=d_in.averageDelay,
                risk_rate_pct=d_in.riskRate,
                compensation_pending_crores=d_in.compensationPending,
                legal_cases_count=d_in.legalCases,
            )
            db.add(district_obj)

        await db.flush()
        district_name_to_id[district_obj.name.lower()] = district_obj.id

    # Upsert Projects
    project_id_set = set()
    for p_in in payload.projects:
        p_res = await db.execute(select(Project).where(Project.project_code == p_in.projectCode))
        project_obj = p_res.scalar_one_or_none()

        dist_id = district_name_to_id.get(p_in.district.lower())
        if not dist_id:
            # Fallback to first district or create a placeholder
            if district_name_to_id:
                dist_id = next(iter(district_name_to_id.values()))
            else:
                dist_id = "d-default"

        risk_lvl = map_risk_level(p_in.riskLevel)
        delay_prob = p_in.delayProbability / 100.0 if p_in.delayProbability > 1.0 else p_in.delayProbability

        if project_obj:
            project_obj.name = p_in.name
            project_obj.phase = p_in.phase
            project_obj.budget_crores = float(p_in.budget)
            project_obj.current_risk_level = risk_lvl
            project_obj.current_risk_score = float(p_in.riskScore)
            project_obj.delay_probability = float(delay_prob)
            project_obj.predicted_delay_window = p_in.predictedDelayWindow
            project_obj.model_confidence = float(p_in.confidence / 100.0 if p_in.confidence > 1.0 else p_in.confidence)
            project_obj.district_id = dist_id
        else:
            project_obj = Project(
                id=p_in.id,
                name=p_in.name,
                project_code=p_in.projectCode,
                state_id=state_gj.id,
                district_id=dist_id,
                project_type=ProjectTypeEnum.EXPRESSWAY,
                phase=p_in.phase,
                budget_crores=float(p_in.budget),
                current_risk_level=risk_lvl,
                current_risk_score=float(p_in.riskScore),
                delay_probability=float(delay_prob),
                predicted_delay_window=p_in.predictedDelayWindow,
                model_confidence=float(p_in.confidence / 100.0 if p_in.confidence > 1.0 else p_in.confidence),
            )
            db.add(project_obj)

        await db.flush()
        project_id_set.add(project_obj.id)

    # Upsert Alerts
    for a_in in payload.alerts:
        a_res = await db.execute(select(Alert).where(Alert.id == a_in.id))
        alert_obj = a_res.scalar_one_or_none()

        target_pid = a_in.projectId if a_in.projectId in project_id_set else (next(iter(project_id_set)) if project_id_set else None)
        if not target_pid:
            continue

        cat = map_alert_category(a_in.category)
        sev = map_risk_level(a_in.severity)
        stat = map_alert_status(a_in.status)

        if alert_obj:
            alert_obj.category = cat
            alert_obj.severity = sev
            alert_obj.primary_cause = a_in.primaryCause
            alert_obj.predicted_delay = a_in.predictedDelay
            alert_obj.confidence = float(a_in.confidence / 100.0 if a_in.confidence > 1.0 else a_in.confidence)
            alert_obj.recommended_intervention = a_in.recommendedIntervention
            alert_obj.status = stat
        else:
            alert_obj = Alert(
                id=a_in.id,
                project_id=target_pid,
                category=cat,
                severity=sev,
                primary_cause=a_in.primaryCause,
                predicted_delay=a_in.predictedDelay,
                confidence=float(a_in.confidence / 100.0 if a_in.confidence > 1.0 else a_in.confidence),
                recommended_intervention=a_in.recommendedIntervention,
                status=stat,
            )
            db.add(alert_obj)

    # Upsert Interventions
    for i_in in payload.interventions:
        i_res = await db.execute(select(Intervention).where(Intervention.id == i_in.id))
        intervention_obj = i_res.scalar_one_or_none()

        target_pid = i_in.projectId if i_in.projectId in project_id_set else (next(iter(project_id_set)) if project_id_set else None)
        if not target_pid:
            continue

        istat = map_intervention_status(i_in.status)
        if intervention_obj:
            intervention_obj.title = i_in.title
            intervention_obj.owner = i_in.owner
            intervention_obj.status = istat
        else:
            intervention_obj = Intervention(
                id=i_in.id,
                project_id=target_pid,
                title=i_in.title,
                owner=i_in.owner,
                status=istat,
                due_date=date.today(),
            )
            db.add(intervention_obj)

    # Record Audit Log
    req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    audit = AuditLog(
        actor_email="system@bhoomi.gov.in",
        actor_role="FrontendTelemetryClient",
        action="REALTIME_DATA_INGESTION",
        resource_type="DATASET_BULK_UPLOAD",
        resource_id=f"sync-{sync_time.strftime('%Y%m%d%H%M%S')}",
        request_id=req_id,
        status="Success",
        detail=(
            f"Ingested {len(payload.projects)} projects, {len(payload.districts)} districts, "
            f"{len(payload.alerts)} alerts from frontend telemetry. Generated physical dataset "
            f"and updated database records."
        ),
    )
    db.add(audit)
    await db.commit()

    logger.info(
        f"Real-time ingestion complete: {len(payload.projects)} projects, "
        f"{len(payload.districts)} districts, {len(payload.alerts)} alerts."
    )

    return IngestResponse(
        status="success",
        message="Frontend real-time telemetry successfully ingested, dataset generated, and uploaded to database.",
        counts={
            "projects": len(payload.projects),
            "districts": len(payload.districts),
            "alerts": len(payload.alerts),
            "financials": len(payload.financials),
            "corridors": len(payload.corridors),
            "interventions": len(payload.interventions),
        },
        generated_dataset_files=generated_files,
        timestamp=sync_time.isoformat(),
    )
