import json
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.geography import District, State
from app.models.projects import Project, ProjectCorridor
from app.models.users import User

router = APIRouter(prefix="/map", tags=["Geospatial & PostGIS Cartography"])


@router.get("/projects", summary="GeoJSON FeatureCollection of infrastructure alignments and stations")
async def get_map_projects(
    bbox: Optional[str] = Query(None, description="Bounding box filter: minLon,minLat,maxLon,maxLat"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns a GeoJSON FeatureCollection of infrastructure alignments,
    directly consumable by React-Leaflet and MapLibre layers.
    """
    stmt = select(Project).limit(100)
    projects = (await db.execute(stmt)).scalars().all()

    features = []
    # Gujarat sample coordinates for corridor nodes
    sample_coords = {
        "DAC/GJ/14": [[72.5714, 23.0225], [72.2464, 22.2530]],  # Ahmedabad -> Dholera
        "MAHSR/GJ/02": [[72.5714, 23.0225], [72.9289, 22.5645], [73.1812, 22.3072], [72.8311, 21.1702]],  # Ahmedabad -> Anand -> Vadodara -> Surat
        "DME/GJ/07": [[72.9866, 21.7051], [73.1812, 22.3072]],  # Bharuch -> Vadodara
        "WDFC/GJ/08": [[69.8053, 23.2420], [72.3995, 23.5880], [72.5714, 23.0225], [72.9866, 21.7051]],  # Kutch -> Mehsana -> Ahmedabad -> Bharuch
        "SM/NSE/GJ": [[72.8311, 21.1702], [72.8800, 21.2200]],  # Surat Metro
    }

    for p in projects:
        coords = sample_coords.get(p.project_code, [[72.57, 23.02], [72.98, 21.70]])
        if p.corridor_alignment_geojson:
            try:
                geom = json.loads(p.corridor_alignment_geojson)
            except Exception:
                geom = {"type": "LineString", "coordinates": coords}
        else:
            geom = {"type": "LineString", "coordinates": coords}

        features.append({
            "type": "Feature",
            "id": p.id,
            "geometry": geom,
            "properties": {
                "name": p.name,
                "projectCode": p.project_code,
                "riskLevel": p.current_risk_level.value,
                "riskScore": p.current_risk_score,
                "delayProbability": round(p.delay_probability * 100, 1),
                "phase": p.phase,
                "budget": p.budget_crores,
            },
        })

    return {
        "type": "FeatureCollection",
        "features": features,
    }


@router.get("/districts", summary="District boundary polygons and choropleth risk metrics")
async def get_map_districts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(District)
    districts = (await db.execute(stmt)).scalars().all()

    features = []
    for d in districts:
        features.append({
            "type": "Feature",
            "id": d.id,
            "geometry": {
                "type": "Point",
                "coordinates": [70.0 + (d.map_x * 0.04), 21.0 + (d.map_y * 0.03)],
            },
            "properties": {
                "districtName": d.name,
                "riskRate": d.risk_rate_pct,
                "monitoredProjects": d.monitored_projects_count,
                "atRiskProjects": d.at_risk_projects_count,
                "compensationPending": d.compensation_pending_crores,
                "legalCases": d.legal_cases_count,
            },
        })

    return {
        "type": "FeatureCollection",
        "features": features,
    }


@router.get("/risk", summary="Heatmap risk concentration points across Gujarat")
async def get_map_risk_points(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns coordinate points with risk intensities for Leaflet heatmap layers.
    """
    points = [
        {"lat": 23.2420, "lng": 69.8053, "weight": 0.92, "label": "Kutch Corridor Node"},
        {"lat": 21.7051, "lng": 72.9866, "weight": 0.78, "label": "Bharuch Industrial Stretches"},
        {"lat": 21.1702, "lng": 72.8311, "weight": 0.65, "label": "Surat Metro Corridor"},
        {"lat": 22.5645, "lng": 72.9289, "weight": 0.86, "label": "Anand Bullet Train Package"},
        {"lat": 23.0225, "lng": 72.5714, "weight": 0.24, "label": "Ahmedabad Outer Ring"},
    ]
    return {"points": points}
