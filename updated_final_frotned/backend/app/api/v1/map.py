import json
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_user, get_optional_user
from app.db.session import get_db
from app.models.geography import District, State, LandParcel
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


import math

# Realistic Gujarat Infrastructure Corridor Land Parcel Registry with Habitation Telemetry
CORRIDOR_LAND_REGISTRY = [
    # --- Bharuch Impasse Corridor Sector (Km 188 - 204) ---
    {
        "id": "bharuch-impasse-target",
        "survey_number": "GAT 412/A, 412/D",
        "village": "Vagra",
        "taluka": "Vagra",
        "district": "Bharuch",
        "chainage": "Km 188.200 - 190.500",
        "corridor": "dmic",
        "latitude": 21.710,
        "longitude": 72.998,
        "map_x": 285,
        "map_y": 245,
        "area_hectares": 14.8,
        "classification": "Private Agricultural (Tribunal Disputed)",
        "habitation_status": "dense",
        "affected_families_count": 34,
        "structures_count": 18,
        "estimated_acquisition_days": 180,
        "is_anchor_target": True,
        "status_note": "Critical Bottleneck: 45d delay under Sec 20 judicial stay",
    },
    {
        "id": "parcel-bh-zero-01",
        "survey_number": "GAT 419/Govt Waste",
        "village": "Vagra North",
        "taluka": "Vagra",
        "district": "Bharuch",
        "chainage": "Km 189.400 Bypass",
        "corridor": "dmic",
        "latitude": 21.718,
        "longitude": 73.008,
        "map_x": 298,
        "map_y": 230,
        "area_hectares": 18.2,
        "classification": "Government Fallow / Wasteland",
        "habitation_status": "none",
        "affected_families_count": 0,
        "structures_count": 0,
        "estimated_acquisition_days": 20,
        "is_anchor_target": False,
        "status_note": "Clean revenue ownership, zero encroachment, fast-track diversion",
    },
    {
        "id": "parcel-bh-zero-02",
        "survey_number": "GAT 428/B Scrub Jungle",
        "village": "Dahej Link Fringe",
        "taluka": "Vagra",
        "district": "Bharuch",
        "chainage": "Km 191.100 RoW Divert",
        "corridor": "dmic",
        "latitude": 21.728,
        "longitude": 73.014,
        "map_x": 315,
        "map_y": 222,
        "area_hectares": 22.5,
        "classification": "Non-Forest Scrub Land",
        "habitation_status": "none",
        "affected_families_count": 0,
        "structures_count": 0,
        "estimated_acquisition_days": 25,
        "is_anchor_target": False,
        "status_note": "No timber tree species, 100% uninhabited, ready for immediate possession",
    },
    {
        "id": "parcel-bh-zero-03",
        "survey_number": "GAT 435 Coastal Salt Flat",
        "village": "Gandhar Margin",
        "taluka": "Amod",
        "district": "Bharuch",
        "chainage": "Km 193.800 Alternative",
        "corridor": "dmic",
        "latitude": 21.738,
        "longitude": 72.990,
        "map_x": 270,
        "map_y": 210,
        "area_hectares": 31.0,
        "classification": "Saline Waste Land",
        "habitation_status": "none",
        "affected_families_count": 0,
        "structures_count": 0,
        "estimated_acquisition_days": 18,
        "is_anchor_target": False,
        "status_note": "Zero habitation, uncultivable saline flat, 0 R&R budget impact",
    },
    {
        "id": "parcel-bh-sparse-01",
        "survey_number": "GAT 395 Dry Farmland",
        "village": "Amod Rural",
        "taluka": "Amod",
        "district": "Bharuch",
        "chainage": "Km 190.100 West",
        "corridor": "dmic",
        "latitude": 21.702,
        "longitude": 72.985,
        "map_x": 265,
        "map_y": 260,
        "area_hectares": 12.4,
        "classification": "Single-crop Agrarian",
        "habitation_status": "sparse",
        "affected_families_count": 2,
        "structures_count": 1,
        "estimated_acquisition_days": 50,
        "is_anchor_target": False,
        "status_note": "1 seasonal farm shed, amicable consent settlement feasible",
    },
    {
        "id": "parcel-bh-dense-01",
        "survey_number": "GAT 360 Gaothan Colony",
        "village": "Vagra South Abadi",
        "taluka": "Vagra",
        "district": "Bharuch",
        "chainage": "Km 187.800",
        "corridor": "dmic",
        "latitude": 21.712,
        "longitude": 72.970,
        "map_x": 250,
        "map_y": 272,
        "area_hectares": 9.6,
        "classification": "Gaothan Settlement",
        "habitation_status": "dense",
        "affected_families_count": 42,
        "structures_count": 24,
        "estimated_acquisition_days": 210,
        "is_anchor_target": False,
        "status_note": "High R&R friction, community school & temple, heavy compensation required",
    },

    # --- Vadodara Urban Fringe Corridor Sector (Km 246 - 252) ---
    {
        "id": "vadodara-power-target",
        "survey_number": "GAT 78, 82, 89",
        "village": "Padra",
        "taluka": "Padra",
        "district": "Vadodara",
        "chainage": "Km 248.100 Urban Fringe",
        "corridor": "dmic",
        "latitude": 22.307,
        "longitude": 73.181,
        "map_x": 490,
        "map_y": 172,
        "area_hectares": 16.5,
        "classification": "Semi-Industrial Corridor",
        "habitation_status": "dense",
        "affected_families_count": 19,
        "structures_count": 12,
        "estimated_acquisition_days": 150,
        "is_anchor_target": True,
        "status_note": "GETCO 220kV HT transmission lines crossing + high density suburban fringe",
    },
    {
        "id": "parcel-vd-zero-01",
        "survey_number": "GAT 84/State Fallow",
        "village": "Padra North Outskirts",
        "taluka": "Padra",
        "district": "Vadodara",
        "chainage": "Km 249.200 Transmission Bypass",
        "corridor": "dmic",
        "latitude": 22.316,
        "longitude": 73.193,
        "map_x": 510,
        "map_y": 160,
        "area_hectares": 20.4,
        "classification": "State Revenue Fallow",
        "habitation_status": "none",
        "affected_families_count": 0,
        "structures_count": 0,
        "estimated_acquisition_days": 15,
        "is_anchor_target": False,
        "status_note": "Clear HT bypass easement, zero dwellings, direct clearance",
    },
    {
        "id": "parcel-vd-zero-02",
        "survey_number": "GAT 92 Barren Ridge",
        "village": "Padra Bypass East",
        "taluka": "Padra",
        "district": "Vadodara",
        "chainage": "Km 251.000 RoW Arc",
        "corridor": "dmic",
        "latitude": 22.324,
        "longitude": 73.204,
        "map_x": 530,
        "map_y": 150,
        "area_hectares": 25.0,
        "classification": "Barren Rocky Ridge",
        "habitation_status": "none",
        "affected_families_count": 0,
        "structures_count": 0,
        "estimated_acquisition_days": 18,
        "is_anchor_target": False,
        "status_note": "Natural contour, 0 structures, optimal foundation for expressway pylons",
    },
    {
        "id": "parcel-vd-sparse-01",
        "survey_number": "GAT 71 Orchard Buffer",
        "village": "Padra South",
        "taluka": "Padra",
        "district": "Vadodara",
        "chainage": "Km 247.300",
        "corridor": "dmic",
        "latitude": 22.298,
        "longitude": 73.172,
        "map_x": 472,
        "map_y": 185,
        "area_hectares": 11.2,
        "classification": "Private Agro Orchard",
        "habitation_status": "sparse",
        "affected_families_count": 3,
        "structures_count": 2,
        "estimated_acquisition_days": 55,
        "is_anchor_target": False,
        "status_note": "2 storage pump rooms, tree valuation needed under Schedule II",
    },
    {
        "id": "parcel-vd-dense-01",
        "survey_number": "GAT 62 Urban Hamlet",
        "village": "Padra Urban Core",
        "taluka": "Padra",
        "district": "Vadodara",
        "chainage": "Km 246.500",
        "corridor": "dmic",
        "latitude": 22.304,
        "longitude": 73.158,
        "map_x": 450,
        "map_y": 195,
        "area_hectares": 8.1,
        "classification": "Dense Residential Hamlet",
        "habitation_status": "dense",
        "affected_families_count": 38,
        "structures_count": 26,
        "estimated_acquisition_days": 200,
        "is_anchor_target": False,
        "status_note": "Heavy commercial shops and 38 residences, massive R&R resistance",
    },
]


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance in kilometers."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


@router.get("/nearest-parcels", summary="Nearest alternative land parcels prioritized by Zero Habitation")
async def get_nearest_parcels(
    parcel_id: Optional[str] = Query(None, description="Anchor parcel ID to evaluate alternatives for"),
    lat: Optional[float] = Query(None, description="Anchor latitude"),
    lng: Optional[float] = Query(None, description="Anchor longitude"),
    radius_km: float = Query(25.0, description="Max search radius in km"),
    filter_priority: str = Query("all", description="'all' or 'zero_habitation_only'"),
    corridor: Optional[str] = Query(None, description="Filter corridor code (e.g., 'dmic')"),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Spasially calculates nearest alternative land parcels for infrastructure RoW alignment.
    Strictly prioritizes Zero Habitation lands (0 displaced families, 0 structures) as HIGH PRIORITY (Rank 1),
    and deprioritizes inhabited settlements due to severe R&R friction, compensation overhead, and tribunal delays.
    """
    # 1. Resolve Anchor Target Parcel
    anchor = None
    if parcel_id:
        anchor = next((p for p in CORRIDOR_LAND_REGISTRY if p["id"] == parcel_id or p["survey_number"].lower() == parcel_id.lower()), None)

    if not anchor:
        if lat is not None and lng is not None:
            # Find closest registry parcel or make synthetic anchor
            anchor = {
                "id": "custom-selected-anchor",
                "survey_number": "Target Inspected Parcel",
                "village": "Active Corridor Reach",
                "district": "Gujarat",
                "chainage": "Active RoW Inspection",
                "corridor": corridor or "dmic",
                "latitude": lat,
                "longitude": lng,
                "map_x": 300,
                "map_y": 220,
                "area_hectares": 15.0,
                "classification": "Target Land under RoW Acquisition",
                "habitation_status": "dense",
                "affected_families_count": 25,
                "structures_count": 14,
                "estimated_acquisition_days": 180,
                "is_anchor_target": True,
                "status_note": "Active target parcel selected on map canvas",
            }
        else:
            # Default to Bharuch Bottleneck Impasse
            anchor = CORRIDOR_LAND_REGISTRY[0]

    anchor_lat = anchor["latitude"]
    anchor_lng = anchor["longitude"]

    # 2. Candidate Evaluation
    candidates = []
    for p in CORRIDOR_LAND_REGISTRY:
        if p["id"] == anchor["id"]:
            continue
        if corridor and p.get("corridor") != corridor:
            continue

        dist = haversine_km(anchor_lat, anchor_lng, p["latitude"], p["longitude"])
        if dist > radius_km:
            continue

        hab_status = p.get("habitation_status", "none")
        fam_count = p.get("affected_families_count", 0)
        struct_count = p.get("structures_count", 0)

        # Habitation Priority Rules
        if hab_status == "none" or (fam_count == 0 and struct_count == 0):
            priority_tier = "HIGH"
            priority_badge = "★ High Priority: Zero Habitation"
            priority_rank_score = 1000.0 - (dist * 10.0)
            rr_friction_level = "Zero (0 Displaced Families, 0 Structures)"
            rr_friction_code = "zero"
            cost_advantage = "Lowest: Standard circle rate only, 0 R&R resettlement package"
            time_savings_days = max(0, anchor["estimated_acquisition_days"] - p["estimated_acquisition_days"])
        elif hab_status == "sparse" or fam_count <= 5:
            priority_tier = "MODERATE"
            priority_badge = "Moderate Priority: Sparse Habitation"
            priority_rank_score = 500.0 - (dist * 10.0)
            rr_friction_level = f"Low ({fam_count} Families, {struct_count} Structures)"
            rr_friction_code = "sparse"
            cost_advantage = "Moderate: Minor agrarian outbuilding compensation"
            time_savings_days = max(0, anchor["estimated_acquisition_days"] - p["estimated_acquisition_days"])
        else:
            priority_tier = "LOW"
            priority_badge = "Low Priority: Inhabited Settlement"
            priority_rank_score = 100.0 - (dist * 10.0)
            rr_friction_level = f"High ({fam_count} Families, {struct_count} Dwellings - SIA Hearing Required)"
            rr_friction_code = "dense"
            cost_advantage = "High: Full rehabilitation, housing resettlement, land-for-land claims"
            time_savings_days = max(0, anchor["estimated_acquisition_days"] - p["estimated_acquisition_days"])

        # Filter by priority if requested
        if filter_priority in ("zero_habitation_only", "no_habitation") and priority_tier != "HIGH":
            continue

        candidate_obj = {
            **p,
            "distance_km": dist,
            "priority_tier": priority_tier,
            "priority_badge": priority_badge,
            "priority_rank_score": priority_rank_score,
            "rr_friction_level": rr_friction_level,
            "rr_friction_code": rr_friction_code,
            "cost_advantage": cost_advantage,
            "time_savings_days": time_savings_days,
            "fast_track_eligible": priority_tier == "HIGH",
            "recommended_action": (
                "Adopt as Fast-Track RoW Alignment" if priority_tier == "HIGH"
                else "Secondary Alternative with Limited R&R" if priority_tier == "MODERATE"
                else "Deprioritize: High Litigation & Displacement Risk"
            ),
        }
        candidates.append(candidate_obj)

    # 3. Sort: Strictly High Priority (Zero Habitation) first, sorted by distance, followed by Moderate, then Low
    candidates.sort(key=lambda item: (-item["priority_rank_score"], item["distance_km"]))

    # Assign sequential ranks
    for idx, item in enumerate(candidates, start=1):
        item["priority_rank"] = idx

    zero_hab_count = sum(1 for c in candidates if c["priority_tier"] == "HIGH")
    inhabited_count = len(candidates) - zero_hab_count

    return {
        "success": True,
        "anchor_parcel": anchor,
        "search_parameters": {
            "radius_km": radius_km,
            "filter_priority": filter_priority,
            "corridor": corridor or "all",
        },
        "metrics": {
            "total_candidates_found": len(candidates),
            "zero_habitation_count": zero_hab_count,
            "inhabited_count": inhabited_count,
            "recommended_top_choice_id": candidates[0]["id"] if candidates else None,
        },
        "nearest_parcels": candidates,
    }


@router.get("/parcels", summary="List all corridor cadastral land parcels")
async def get_all_parcels(
    corridor: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Returns full catalog of cadastral land parcels along state infrastructure corridors.
    """
    items = CORRIDOR_LAND_REGISTRY
    if corridor:
        items = [p for p in items if p.get("corridor") == corridor]
    return {"parcels": items, "count": len(items)}

