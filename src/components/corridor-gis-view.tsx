import React, { useState, useEffect, useMemo } from 'react';
import {
  Download, Sliders, Layers, Trees, Zap, Flame, MapPin, AlertTriangle,
  ArrowLeftRight, CheckCircle2, ChevronDown, Clock3, FileText, Check,
  ExternalLink, Calendar, ShieldAlert, Radio, Compass, Plane, Satellite,
  Scale, Landmark, FileSpreadsheet, Sparkles, Eye, X, CheckSquare,
  FolderOpen, AlertCircle, Home, Star, ShieldCheck, ArrowRight, RefreshCw,
  Users, CheckCheck, Navigation, Route, Banknote
} from 'lucide-react';
import { fetchNearestParcels, type NearestParcel } from '../lib/api';

const FALLBACK_BHARUCH_ALTERNATIVES: NearestParcel[] = [
  {
    id: 'parcel-bh-zero-01',
    survey_number: 'GAT 419/Govt Waste',
    village: 'Vagra North',
    taluka: 'Vagra',
    district: 'Bharuch',
    chainage: 'Km 189.400 Bypass',
    corridor: 'dmic',
    latitude: 21.718,
    longitude: 73.008,
    map_x: 350,
    map_y: 130,
    area_hectares: 18.2,
    classification: 'Government Fallow / Wasteland',
    habitation_status: 'none',
    affected_families_count: 0,
    structures_count: 0,
    estimated_acquisition_days: 20,
    distance_km: 1.37,
    priority_tier: 'HIGH',
    priority_badge: '★ High Priority: Zero Habitation',
    priority_rank: 1,
    priority_rank_score: 986.3,
    rr_friction_level: 'Zero (0 Displaced Families, 0 Structures)',
    rr_friction_code: 'zero',
    cost_advantage: 'Lowest: Standard circle rate only, 0 R&R resettlement package',
    time_savings_days: 160,
    fast_track_eligible: true,
    recommended_action: 'Adopt as Fast-Track RoW Alignment',
    status_note: 'Clean revenue ownership, zero encroachment, fast-track diversion',
  },
  {
    id: 'parcel-bh-zero-02',
    survey_number: 'GAT 428/B Scrub Jungle',
    village: 'Dahej Link Fringe',
    taluka: 'Vagra',
    district: 'Bharuch',
    chainage: 'Km 191.100 RoW Divert',
    corridor: 'dmic',
    latitude: 21.728,
    longitude: 73.014,
    map_x: 440,
    map_y: 105,
    area_hectares: 22.5,
    classification: 'Non-Forest Scrub Land',
    habitation_status: 'none',
    affected_families_count: 0,
    structures_count: 0,
    estimated_acquisition_days: 25,
    distance_km: 2.61,
    priority_tier: 'HIGH',
    priority_badge: '★ High Priority: Zero Habitation',
    priority_rank: 2,
    priority_rank_score: 973.9,
    rr_friction_level: 'Zero (0 Displaced Families, 0 Structures)',
    rr_friction_code: 'zero',
    cost_advantage: 'Lowest: Standard circle rate only, 0 R&R resettlement package',
    time_savings_days: 155,
    fast_track_eligible: true,
    recommended_action: 'Adopt as Fast-Track RoW Alignment',
    status_note: 'No timber tree species, 100% uninhabited, ready for immediate possession',
  },
  {
    id: 'parcel-bh-zero-03',
    survey_number: 'GAT 435 Coastal Salt Flat',
    village: 'Gandhar Margin',
    taluka: 'Amod',
    district: 'Bharuch',
    chainage: 'Km 193.800 Alternative',
    corridor: 'dmic',
    latitude: 21.738,
    longitude: 72.990,
    map_x: 220,
    map_y: 105,
    area_hectares: 31.0,
    classification: 'Saline Waste Land',
    habitation_status: 'none',
    affected_families_count: 0,
    structures_count: 0,
    estimated_acquisition_days: 18,
    distance_km: 3.22,
    priority_tier: 'HIGH',
    priority_badge: '★ High Priority: Zero Habitation',
    priority_rank: 3,
    priority_rank_score: 967.8,
    rr_friction_level: 'Zero (0 Displaced Families, 0 Structures)',
    rr_friction_code: 'zero',
    cost_advantage: 'Lowest: Standard circle rate only, 0 R&R resettlement package',
    time_savings_days: 162,
    fast_track_eligible: true,
    recommended_action: 'Adopt as Fast-Track RoW Alignment',
    status_note: 'Zero habitation, uncultivable saline flat, 0 R&R budget impact',
  },
  {
    id: 'parcel-bh-sparse-01',
    survey_number: 'GAT 395 Dry Farmland',
    village: 'Amod Rural',
    taluka: 'Amod',
    district: 'Bharuch',
    chainage: 'Km 190.100 West',
    corridor: 'dmic',
    latitude: 21.702,
    longitude: 72.985,
    map_x: 130,
    map_y: 175,
    area_hectares: 12.4,
    classification: 'Single-crop Agrarian',
    habitation_status: 'sparse',
    affected_families_count: 2,
    structures_count: 1,
    estimated_acquisition_days: 50,
    distance_km: 1.62,
    priority_tier: 'MODERATE',
    priority_badge: 'Moderate Priority: Sparse Habitation',
    priority_rank: 4,
    priority_rank_score: 483.8,
    rr_friction_level: 'Low (2 Families, 1 Shed)',
    rr_friction_code: 'sparse',
    cost_advantage: 'Moderate: Minor agrarian outbuilding compensation',
    time_savings_days: 130,
    fast_track_eligible: false,
    recommended_action: 'Secondary Alternative with Limited R&R',
    status_note: '1 seasonal farm shed, amicable consent settlement feasible',
  },
  {
    id: 'parcel-bh-dense-01',
    survey_number: 'GAT 360 Gaothan Colony',
    village: 'Vagra South Abadi',
    taluka: 'Vagra',
    district: 'Bharuch',
    chainage: 'Km 187.800',
    corridor: 'dmic',
    latitude: 21.712,
    longitude: 72.970,
    map_x: 85,
    map_y: 240,
    area_hectares: 9.6,
    classification: 'Gaothan Settlement',
    habitation_status: 'dense',
    affected_families_count: 42,
    structures_count: 24,
    estimated_acquisition_days: 210,
    distance_km: 2.90,
    priority_tier: 'LOW',
    priority_badge: 'Low Priority: Inhabited Settlement',
    priority_rank: 5,
    priority_rank_score: 71.0,
    rr_friction_level: 'High (42 Families, 24 Dwellings - SIA Hearing Required)',
    rr_friction_code: 'dense',
    cost_advantage: 'High: Full rehabilitation, housing resettlement, land-for-land claims',
    time_savings_days: 0,
    fast_track_eligible: false,
    recommended_action: 'Deprioritize: High Litigation & Displacement Risk',
    status_note: 'High R&R friction, community school & temple, heavy compensation required',
  },
];

const FALLBACK_VADODARA_ALTERNATIVES: NearestParcel[] = [
  {
    id: 'parcel-vd-zero-01',
    survey_number: 'GAT 84/State Fallow',
    village: 'Padra North Outskirts',
    taluka: 'Padra',
    district: 'Vadodara',
    chainage: 'Km 249.200 Transmission Bypass',
    corridor: 'dmic',
    latitude: 22.316,
    longitude: 73.193,
    map_x: 580,
    map_y: 225,
    area_hectares: 20.4,
    classification: 'State Revenue Fallow',
    habitation_status: 'none',
    affected_families_count: 0,
    structures_count: 0,
    estimated_acquisition_days: 15,
    distance_km: 1.25,
    priority_tier: 'HIGH',
    priority_badge: '★ High Priority: Zero Habitation',
    priority_rank: 1,
    priority_rank_score: 987.5,
    rr_friction_level: 'Zero (0 Displaced Families, 0 Structures)',
    rr_friction_code: 'zero',
    cost_advantage: 'Lowest: Clear HT bypass easement, zero dwellings',
    time_savings_days: 135,
    fast_track_eligible: true,
    recommended_action: 'Adopt as Fast-Track RoW Alignment',
    status_note: 'Clear HT bypass easement, zero dwellings, direct clearance',
  },
  {
    id: 'parcel-vd-zero-02',
    survey_number: 'GAT 92 Barren Ridge',
    village: 'Padra Bypass East',
    taluka: 'Padra',
    district: 'Vadodara',
    chainage: 'Km 251.000 RoW Arc',
    corridor: 'dmic',
    latitude: 22.324,
    longitude: 73.204,
    map_x: 670,
    map_y: 240,
    area_hectares: 25.0,
    classification: 'Barren Rocky Ridge',
    habitation_status: 'none',
    affected_families_count: 0,
    structures_count: 0,
    estimated_acquisition_days: 18,
    distance_km: 2.38,
    priority_tier: 'HIGH',
    priority_badge: '★ High Priority: Zero Habitation',
    priority_rank: 2,
    priority_rank_score: 976.2,
    rr_friction_level: 'Zero (0 Displaced Families, 0 Structures)',
    rr_friction_code: 'zero',
    cost_advantage: 'Lowest: Natural contour, optimal foundation',
    time_savings_days: 132,
    fast_track_eligible: true,
    recommended_action: 'Adopt as Fast-Track RoW Alignment',
    status_note: 'Natural contour, 0 structures, optimal foundation for expressway pylons',
  },
  {
    id: 'parcel-vd-sparse-01',
    survey_number: 'GAT 71 Orchard Buffer',
    village: 'Padra South',
    taluka: 'Padra',
    district: 'Vadodara',
    chainage: 'Km 247.300',
    corridor: 'dmic',
    latitude: 22.298,
    longitude: 73.172,
    map_x: 440,
    map_y: 275,
    area_hectares: 11.2,
    classification: 'Private Agro Orchard',
    habitation_status: 'sparse',
    affected_families_count: 3,
    structures_count: 2,
    estimated_acquisition_days: 55,
    distance_km: 1.85,
    priority_tier: 'MODERATE',
    priority_badge: 'Moderate Priority: Sparse Habitation',
    priority_rank: 3,
    priority_rank_score: 481.5,
    rr_friction_level: 'Low (3 Families, 2 Outbuildings)',
    rr_friction_code: 'sparse',
    cost_advantage: 'Moderate: Tree valuation under Schedule II',
    time_savings_days: 95,
    fast_track_eligible: false,
    recommended_action: 'Secondary Alternative with Limited R&R',
    status_note: '2 storage pump rooms, tree valuation needed under Schedule II',
  },
  {
    id: 'parcel-vd-dense-01',
    survey_number: 'GAT 62 Urban Hamlet',
    village: 'Padra Urban Core',
    taluka: 'Padra',
    district: 'Vadodara',
    chainage: 'Km 246.500',
    corridor: 'dmic',
    latitude: 22.304,
    longitude: 73.158,
    map_x: 360,
    map_y: 310,
    area_hectares: 8.1,
    classification: 'Dense Residential Hamlet',
    habitation_status: 'dense',
    affected_families_count: 38,
    structures_count: 26,
    estimated_acquisition_days: 200,
    distance_km: 3.35,
    priority_tier: 'LOW',
    priority_badge: 'Low Priority: Inhabited Settlement',
    priority_rank: 4,
    priority_rank_score: 66.5,
    rr_friction_level: 'High (38 Families, 26 Residences - Major SIA Opposition)',
    rr_friction_code: 'dense',
    cost_advantage: 'High: Extreme relocation compensation required',
    time_savings_days: 0,
    fast_track_eligible: false,
    recommended_action: 'Deprioritize: High Litigation & Displacement Risk',
    status_note: 'Heavy commercial shops and 38 residences, massive R&R resistance',
  },
];

interface CorridorGisViewProps {
  onNotify?: (msg: string) => void;
}

export function CorridorGisView({ onNotify }: CorridorGisViewProps) {
  // Filter States
  const [selectedCorridor, setSelectedCorridor] = useState('dmic');
  const [spatialFilter, setSpatialFilter] = useState('bottlenecks');
  const [chainageSegment, setChainageSegment] = useState('km120-340');

  // Active Layers
  const [activeLayers, setActiveLayers] = useState<{ [key: string]: boolean }>({
    cadastral: true,
    forest: true,
    utility: true,
    disbursement: false,
    nearestParcels: true,
  });

  // Selected waypoint or callout on map (Target Land Parcel)
  const [selectedCallout, setSelectedCallout] = useState<'vadodara' | 'bharuch'>('bharuch');

  // Nearest Land Parcels & Habitation Priority State (High Priority: Zero Habitation)
  const [habitationFilter, setHabitationFilter] = useState<'zero_habitation' | 'sparse_habitation' | 'dense_habitation' | 'all'>('zero_habitation');
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(25);
  const [nearestParcels, setNearestParcels] = useState<NearestParcel[]>(FALLBACK_BHARUCH_ALTERNATIVES);
  const [selectedAlternative, setSelectedAlternative] = useState<NearestParcel | null>(FALLBACK_BHARUCH_ALTERNATIVES[0]);
  const [hoveredParcel, setHoveredParcel] = useState<NearestParcel | null>(null);
  const [isLoadingParcels, setIsLoadingParcels] = useState<boolean>(false);

  // Layer modal / Drawer state
  const [showLayerControls, setShowLayerControls] = useState(false);

  // Modal & Action Sheet States for Interactive Buttons
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeMilestone, setActiveMilestone] = useState<string | null>(null);
  const [injunctionStatus, setInjunctionStatus] = useState<'pending' | 'resolved'>('pending');
  const [trancheStatus, setTrancheStatus] = useState<'pending' | 'disbursed'>('pending');
  const [utilityStatus, setUtilityStatus] = useState<'pending' | 'approved'>('pending');
  const [docketsQuery, setDocketsQuery] = useState('');
  const [docketsCorridor, setDocketsCorridor] = useState('all');

  // Action feedback handler
  const triggerNotify = (msg: string) => {
    if (onNotify) {
      onNotify(msg);
    }
  };

  // Sync nearest parcels from backend when anchor or filter changes
  useEffect(() => {
    let isCancelled = false;
    async function loadNearest() {
      setIsLoadingParcels(true);
      const anchorId = selectedCallout === 'bharuch' ? 'bharuch-impasse-target' : 'vadodara-power-target';
      try {
        const res = await fetchNearestParcels({
          parcel_id: anchorId,
          radius_km: searchRadiusKm,
          filter_priority: habitationFilter,
          corridor: selectedCorridor,
        });
        if (!isCancelled && res?.nearest_parcels) {
          setNearestParcels(res.nearest_parcels);
          if (res.nearest_parcels.length > 0) {
            setSelectedAlternative(res.nearest_parcels[0]);
          }
        }
      } catch (err) {
        // Fallback to rich built-in dataset
        const base = selectedCallout === 'bharuch' ? FALLBACK_BHARUCH_ALTERNATIVES : FALLBACK_VADODARA_ALTERNATIVES;
        let filtered = base;
        if (habitationFilter === 'zero_habitation') {
          filtered = base.filter((p) => p.habitation_status === 'none');
        } else if (habitationFilter === 'sparse_habitation') {
          filtered = base.filter((p) => p.habitation_status === 'sparse');
        } else if (habitationFilter === 'dense_habitation') {
          filtered = base.filter((p) => p.habitation_status === 'dense');
        }
        if (!isCancelled) {
          setNearestParcels(filtered);
          setSelectedAlternative(filtered[0] || null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingParcels(false);
        }
      }
    }
    loadNearest();
    return () => {
      isCancelled = true;
    };
  }, [selectedCallout, habitationFilter, searchRadiusKm, selectedCorridor]);

  // Priority count badges
  const currentBaseParcels = selectedCallout === 'bharuch' ? FALLBACK_BHARUCH_ALTERNATIVES : FALLBACK_VADODARA_ALTERNATIVES;
  const zeroHabCount = currentBaseParcels.filter((p) => p.habitation_status === 'none').length;
  const sparseHabCount = currentBaseParcels.filter((p) => p.habitation_status === 'sparse').length;
  const denseHabCount = currentBaseParcels.filter((p) => p.habitation_status === 'dense').length;
  const allCount = currentBaseParcels.length;

  // Derived filtered parcels according to user priority selection
  const displayedNearestParcels = useMemo(() => {
    const base = selectedCallout === 'bharuch' ? FALLBACK_BHARUCH_ALTERNATIVES : FALLBACK_VADODARA_ALTERNATIVES;
    if (habitationFilter === 'zero_habitation') {
      return base.filter((p) => p.habitation_status === 'none');
    }
    if (habitationFilter === 'sparse_habitation') {
      return base.filter((p) => p.habitation_status === 'sparse');
    }
    if (habitationFilter === 'dense_habitation') {
      return base.filter((p) => p.habitation_status === 'dense');
    }
    return base;
  }, [selectedCallout, habitationFilter]);

  // Anchor coords for SVG line drawing
  const anchorCoords = useMemo(() => {
    return selectedCallout === 'bharuch'
      ? { x: 285, y: 245, label: 'Bharuch Impasse (GAT 412/A)', estDays: 180 }
      : { x: 490, y: 172, label: 'Vadodara Fringe (GAT 78)', estDays: 150 };
  }, [selectedCallout]);

  const toggleLayer = (layerKey: string) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
    triggerNotify(`GIS Layer "${layerKey}" toggled.`);
  };


  const exportGeoJson = () => {
    const geoData = {
      type: 'FeatureCollection',
      name: 'DMIC_Gujarat_Sector_RoW',
      crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::4326' } },
      features: [
        {
          type: 'Feature',
          properties: { chainage: 'Km 188-204', name: 'Bharuch Section', status: 'Bottleneck', delay: '+45d' },
          geometry: { type: 'LineString', coordinates: [[72.998, 21.710], [73.012, 21.735], [73.045, 21.780]] }
        },
        {
          type: 'Feature',
          properties: { chainage: 'Km 248.10', name: 'Vadodara Urban Fringe', status: 'Utility Shift' },
          geometry: { type: 'Point', coordinates: [73.181, 22.307] }
        }
      ]
    };
    const blob = new Blob([JSON.stringify(geoData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DMIC_Gujarat_Sector_RoW_Telemetry.geojson';
    a.click();
    URL.revokeObjectURL(url);
    triggerNotify('GeoJSON boundary exported with 420 spatial parcel vectors.');
  };

  return (
    <div className="corridor-gis-page">
      {/* 1. Page Header */}
      <div className="gis-header-row">
        <div>
          <div className="gis-eyebrow">
            <span className="gis-eyebrow-dot" />
            <span>CORRIDOR INTELLIGENCE</span>
            <span className="gis-sep">/</span>
            <span>GIS SPATIAL SURVEILLANCE</span>
            <span className="gis-sep">/</span>
            <span className="gis-sector-badge">GUJARAT SECTOR</span>
          </div>
          <h1 className="gis-page-title">
            National Corridor Acquisition Status &amp; Right-of-Way GIS
          </h1>
          <p className="gis-page-desc">
            Real-time spatial telemetry across 8 mega-corridors including Delhi-Mumbai Industrial Corridor (DMIC),
            Dholera SIR Express, Dedicated Freight Corridor (DFC), Bullet Train HSR, Jamnagar-Amritsar Economic Spine,
            and Coastal Industrial Zones.
          </p>
        </div>

        <div className="gis-header-actions">
          <button
            className="btn btn-soft gis-action-btn"
            onClick={exportGeoJson}
            title="Download GeoJSON features"
          >
            <Download size={14} className="gis-btn-icon" />
            <span>Export GeoJSON</span>
          </button>
          <button
            className="gis-layer-btn"
            onClick={() => setShowLayerControls(!showLayerControls)}
            title="Configure GIS Layer visibility"
          >
            <Layers size={14} />
            <span>GIS Layer Controls</span>
          </button>
        </div>
      </div>

      {/* Layer Controls Dropdown Popover */}
      {showLayerControls && (
        <div className="gis-layers-dropdown surface">
          <div className="gis-layers-dropdown-header">
            <strong>GIS Multi-Spectral Layer Controls</strong>
            <button className="gis-close-btn" onClick={() => setShowLayerControls(false)}>
              <X size={14} />
            </button>
          </div>
          <div className="gis-layers-options">
            <label className="gis-layer-checkbox">
              <input
                type="checkbox"
                checked={activeLayers.cadastral}
                onChange={() => toggleLayer('cadastral')}
              />
              <span>Cadastral RoW Boundary (Revenue Cadastre 1:2000)</span>
            </label>
            <label className="gis-layer-checkbox">
              <input
                type="checkbox"
                checked={activeLayers.forest}
                onChange={() => toggleLayer('forest')}
              />
              <span>MoEFCC Forest &amp; Wetland Buffers</span>
            </label>
            <label className="gis-layer-checkbox">
              <input
                type="checkbox"
                checked={activeLayers.utility}
                onChange={() => toggleLayer('utility')}
              />
              <span>GETCO / GAIL High-Tension Transmission Lines</span>
            </label>
            <label className="gis-layer-checkbox">
              <input
                type="checkbox"
                checked={activeLayers.disbursement}
                onChange={() => toggleLayer('disbursement')}
              />
              <span>Direct Bank Transfer (DBT) Escrow Heatmap</span>
            </label>
          </div>
        </div>
      )}

      {/* 2. Corridor Filter Strip */}
      <div className="gis-filter-strip surface">
        <div className="gis-filter-col">
          <div className="gis-filter-label">
            <Compass size={12} className="gis-filter-icon" />
            <span>CORRIDOR SELECT</span>
          </div>
          <div className="gis-select-wrap">
            <select
              value={selectedCorridor}
              onChange={(e) => {
                setSelectedCorridor(e.target.value);
                triggerNotify(`Selected corridor: ${e.target.options[e.target.selectedIndex].text}`);
              }}
              className="gis-filter-select"
            >
              <option value="dmic">Delhi-Mumbai Corridor (DMIC)</option>
              <option value="dfc">Western Dedicated Freight Corridor (WDFC)</option>
              <option value="hsr">Mumbai-Ahmedabad High Speed Rail (HSR)</option>
              <option value="dholera">Dholera SIR Expressway Spine</option>
              <option value="jamnagar">Jamnagar-Amritsar Economic Corridor</option>
            </select>
            <ChevronDown size={14} className="gis-select-arrow" />
          </div>
        </div>

        <div className="gis-filter-divider" />

        <div className="gis-filter-col">
          <div className="gis-filter-label">
            <AlertTriangle size={12} className="gis-filter-icon gis-icon-warning" />
            <span>SPATIAL FILTER</span>
          </div>
          <div className="gis-select-wrap">
            <select
              value={spatialFilter}
              onChange={(e) => setSpatialFilter(e.target.value)}
              className="gis-filter-select"
            >
              <option value="bottlenecks">Critical Bottlenecks (14 Pockets)</option>
              <option value="all">All Chainage Pockets (142)</option>
              <option value="env">Forest / CRZ Clearance Pending</option>
              <option value="stay">Court Stay / Tribunal Injunctions</option>
              <option value="utility">HT Power Line Shifting Encumbrance</option>
            </select>
            <ChevronDown size={14} className="gis-select-arrow" />
          </div>
        </div>

        <div className="gis-filter-divider" />

        <div className="gis-filter-col">
          <div className="gis-filter-label">
            <Radio size={12} className="gis-filter-icon" />
            <span>CHAINAGE SEGMENT</span>
          </div>
          <div className="gis-select-wrap">
            <select
              value={chainageSegment}
              onChange={(e) => setChainageSegment(e.target.value)}
              className="gis-filter-select"
            >
              <option value="km120-340">Km 120.000 — Km 340.000 (Central Gujarat)</option>
              <option value="km0-120">Km 000.000 — Km 120.000 (South Gujarat Border)</option>
              <option value="km340-520">Km 340.000 — Km 520.000 (Ahmedabad / Mehsana)</option>
              <option value="km520-680">Km 520.000 — Km 680.000 (Palanpur / North Reach)</option>
            </select>
            <ChevronDown size={14} className="gis-select-arrow" />
          </div>
        </div>

        <div className="gis-filter-status-col">
          <div className="gis-rtk-pill">
            <span className="gis-rtk-dot" />
            <span>Live RTK Base: Online</span>
          </div>
          <button
            className="gis-tune-btn"
            title="Filter Settings & Precision Tuning"
            onClick={() => setActiveModal('dgps_calibration')}
          >
            <Sliders size={14} />
          </button>
        </div>
      </div>

      {/* 3. Top 4 KPI Summary Cards */}
      <div className="gis-kpi-grid">
        {/* KPI 1 */}
        <div className="surface gis-kpi-card">
          <div className="gis-kpi-header">
            <span className="gis-kpi-title">TOTAL CORRIDOR LENGTH</span>
            <div className="gis-kpi-icon-wrap gis-icon-blue">
              <ArrowLeftRight size={15} />
            </div>
          </div>
          <div className="gis-kpi-metric-row">
            <span className="gis-kpi-value">1,482</span>
            <span className="gis-kpi-unit">KM</span>
          </div>
          <div className="gis-kpi-subtext-row">
            <span className="gis-kpi-primary-note">Acquired RoW: 1,218 km (82.2%)</span>
            <span className="gis-kpi-tag-accent">+14 km this mo</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="surface gis-kpi-card">
          <div className="gis-kpi-header">
            <span className="gis-kpi-title">UNRELEASED STRETCHES</span>
            <div className="gis-kpi-icon-wrap gis-icon-red">
              <MapPin size={15} />
            </div>
          </div>
          <div className="gis-kpi-metric-row">
            <span className="gis-kpi-value">42</span>
            <span className="gis-kpi-unit">Pockets</span>
          </div>
          <div className="gis-kpi-subtext-row">
            <span className="gis-kpi-danger-note">
              <AlertCircle size={12} className="inline-icon" />
              18 Civil Contracts Blocked
            </span>
            <span className="gis-kpi-muted-note">Avg Delay: 38d</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="surface gis-kpi-card">
          <div className="gis-kpi-header">
            <span className="gis-kpi-title">LAND PARCEL CLEARANCE</span>
            <div className="gis-kpi-icon-wrap gis-icon-green">
              <CheckSquare size={15} />
            </div>
          </div>
          <div className="gis-kpi-metric-row">
            <span className="gis-kpi-value">14,280</span>
            <span className="gis-kpi-secondary-val">/ 16,500</span>
          </div>
          <div className="gis-kpi-subtext-row">
            <span className="gis-kpi-muted-note">86.5% Title mutations filed</span>
            <span className="gis-kpi-info-tag">2,220 Remaining</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="surface gis-kpi-card">
          <div className="gis-kpi-header">
            <span className="gis-kpi-title">RIGHT-OF-WAY DISBURSED</span>
            <div className="gis-kpi-icon-wrap gis-icon-teal">
              <FileSpreadsheet size={15} />
            </div>
          </div>
          <div className="gis-kpi-metric-row">
            <span className="gis-kpi-value">₹4,820</span>
            <span className="gis-kpi-unit">CRORE</span>
          </div>
          <div className="gis-kpi-subtext-row">
            <span className="gis-kpi-muted-note">Pending Escrow: ₹620 Cr</span>
            <span className="gis-kpi-success-note">94.1% Direct DBT</span>
          </div>
        </div>
      </div>

      {/* 4. Main 2-Column Grid */}
      <div className="gis-layout-grid">
        {/* Left Column (Approx 64%) */}
        <div className="gis-left-column">
          {/* Card 1: GIS Interactive Map Canvas */}
          <div className="surface gis-map-card">
            {/* Map Top Bar */}
            <div className="gis-map-topbar">
              <div className="gis-layer-toggles">
                <span className="gis-layers-label">LAYERS:</span>
                <button
                  className={`gis-toggle-pill ${activeLayers.cadastral ? 'active' : ''}`}
                  onClick={() => toggleLayer('cadastral')}
                >
                  <CheckSquare size={12} />
                  <span>Cadastral RoW</span>
                </button>
                <button
                  className={`gis-toggle-pill ${activeLayers.forest ? 'active' : ''}`}
                  onClick={() => toggleLayer('forest')}
                >
                  <Trees size={12} className="gis-icon-green" />
                  <span>Forest Clearance (MoEFCC)</span>
                </button>
                <button
                  className={`gis-toggle-pill ${activeLayers.utility ? 'active' : ''}`}
                  onClick={() => toggleLayer('utility')}
                >
                  <Zap size={12} className="gis-icon-amber" />
                  <span>Utility Shifting Lines</span>
                </button>
                <button
                  className={`gis-toggle-pill ${activeLayers.disbursement ? 'active' : ''}`}
                  onClick={() => toggleLayer('disbursement')}
                >
                  <Flame size={12} className="gis-icon-red" />
                  <span>Disbursement Heatmap</span>
                </button>
                <button
                  className={`gis-toggle-pill ${activeLayers.nearestParcels ? 'active-nearest' : ''}`}
                  onClick={() => toggleLayer('nearestParcels')}
                  title="Toggle Nearest Land Parcels & Habitation Radar vectors"
                >
                  <Sparkles size={12} className="gis-icon-green" />
                  <span>Nearest Land Radar</span>
                </button>
              </div>

              <div className="gis-coords-badge">
                <MapPin size={12} />
                <span>21°42'34.2"N 72°59'48.8"E | EPSG 4326</span>
              </div>
            </div>

            {/* Quick Habitation Priority Filter Strip over Map */}
            <div className="gis-nearest-map-filter-strip">
              <div className="gis-nearest-filter-left">
                <div className="gis-radar-badge">
                  <span className="gis-rtk-dot" />
                  <span>TARGET LAND: <strong>{selectedCallout === 'bharuch' ? 'Bharuch Bypass (GAT 412/A)' : 'Vadodara Fringe (GAT 78)'}</strong></span>
                </div>
                <span className="gis-sep-pipe">|</span>
                <span className="gis-nearest-label">PRIORITY FILTER:</span>
                
                {/* 1. HIGH PRIORITY: ZERO HABITATION */}
                <button
                  className={`gis-priority-pill ${habitationFilter === 'zero_habitation' ? 'active-zero' : ''}`}
                  onClick={() => {
                    setHabitationFilter('zero_habitation');
                    triggerNotify('Filtered to HIGH PRIORITY: Zero Habitation lands only (0 families displaced • Fast-Track).');
                  }}
                  title="HIGHEST PRIORITY: 100% uninhabited lands with zero R&R resettlement friction"
                >
                  <Star size={11} className="gis-star-icon" />
                  <span>⭐ High Priority: No Habitation ({zeroHabCount})</span>
                </button>

                {/* 2. MODERATE PRIORITY: SPARSE HABITATION */}
                <button
                  className={`gis-priority-pill ${habitationFilter === 'sparse_habitation' ? 'active-sparse' : ''}`}
                  onClick={() => {
                    setHabitationFilter('sparse_habitation');
                    triggerNotify('Filtered to MODERATE PRIORITY: Sparse Habitation (1–3 agrarian outbuildings).');
                  }}
                  title="MODERATE PRIORITY: 1-3 rural families or farmsteads"
                >
                  <span>🟡 Sparse Habitation ({sparseHabCount})</span>
                </button>

                {/* 3. LOW PRIORITY: DENSE HABITATION */}
                <button
                  className={`gis-priority-pill ${habitationFilter === 'dense_habitation' ? 'active-dense' : ''}`}
                  onClick={() => {
                    setHabitationFilter('dense_habitation');
                    triggerNotify('Filtered to LOW PRIORITY: Dense Habitation (Village settlements • Heavy R&R delay).');
                  }}
                  title="LOW PRIORITY: Village settlements with high displacement and litigation hold-ups"
                >
                  <span>🔴 Dense Habitation (Low Priority) ({denseHabCount})</span>
                </button>

                {/* 4. ALL ALTERNATIVES */}
                <button
                  className={`gis-priority-pill ${habitationFilter === 'all' ? 'active-all' : ''}`}
                  onClick={() => {
                    setHabitationFilter('all');
                    triggerNotify('Showing ALL nearest parcels ranked by Habitation Priority.');
                  }}
                  title="Show all parcels ranked from zero habitation to dense"
                >
                  <span>All Alternatives ({allCount})</span>
                </button>
              </div>

              <div className="gis-nearest-filter-right">
                <span className="gis-radius-label">Radius:</span>
                <select
                  value={searchRadiusKm}
                  onChange={(e) => setSearchRadiusKm(Number(e.target.value))}
                  className="gis-radius-select"
                >
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                </select>
              </div>
            </div>

            {/* Visual Vector Route Canvas */}
            <div className="gis-canvas-container">
              <svg
                viewBox="0 0 900 440"
                className="gis-svg-route"
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Subtle terrain grid pattern */}
                  <pattern id="gisGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#E2ECE9" strokeWidth="0.8" strokeDasharray="2,3" />
                  </pattern>
                </defs>

                {/* Grid Background */}
                <rect width="100%" height="100%" fill="url(#gisGrid)" />

                {/* Topographic Contour lines */}
                <path d="M 50 380 Q 250 320 500 350 T 880 280" fill="none" stroke="#EBF3F1" strokeWidth="1.5" />
                <path d="M 30 200 Q 300 240 600 160 T 890 190" fill="none" stroke="#EBF3F1" strokeWidth="1.5" />

                {/* Cadastral RoW Buffer (Translucent wide band) */}
                {activeLayers.cadastral && (
                  <path
                    d="M 60 360 C 180 340, 240 280, 320 220 C 400 160, 520 180, 680 130 C 760 100, 830 80, 880 70"
                    fill="none"
                    stroke="#D0E9E5"
                    strokeWidth="32"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Forest Protected Buffer (MoEFCC) */}
                {activeLayers.forest && (
                  <path
                    d="M 650 140 Q 720 110 820 90"
                    fill="none"
                    stroke="#D4EDDA"
                    strokeWidth="48"
                    strokeLinecap="round"
                    strokeOpacity="0.65"
                  />
                )}

                {/* Utility Line (GETCO HT Line Crossing) */}
                {activeLayers.utility && (
                  <line
                    x1="450"
                    y1="80"
                    x2="590"
                    y2="250"
                    stroke="#F2A51A"
                    strokeWidth="1.8"
                    strokeDasharray="5,4"
                  />
                )}

                {/* Main Highway / Corridor Track Segments */}
                {/* Segment 1: Southern Cleared RoW (Green) */}
                <path
                  d="M 60 360 C 130 350, 190 320, 240 280"
                  fill="none"
                  stroke="#16A878"
                  strokeWidth="6.5"
                  strokeLinecap="round"
                />

                {/* Segment 2: Bharuch Bottleneck Impasse (Red) */}
                <path
                  d="M 240 280 C 275 250, 305 230, 345 205"
                  fill="none"
                  stroke="#E85D68"
                  strokeWidth="7"
                  strokeLinecap="round"
                />

                {/* Segment 3: Vadodara Transition (Amber/Orange) */}
                <path
                  d="M 345 205 C 410 170, 480 180, 540 160"
                  fill="none"
                  stroke="#F2A51A"
                  strokeWidth="6.5"
                  strokeLinecap="round"
                />

                {/* Segment 4: Northern Handed Over Track (Green) */}
                <path
                  d="M 540 160 C 620 140, 720 105, 880 70"
                  fill="none"
                  stroke="#16A878"
                  strokeWidth="6.5"
                  strokeLinecap="round"
                />

                {/* Track Center Line (White Dash) */}
                <path
                  d="M 60 360 C 180 340, 240 280, 320 220 C 400 160, 520 180, 680 130 C 760 100, 830 80, 880 70"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                  strokeDasharray="4,6"
                />

                {/* Chainage Ticks along the Route */}
                {[
                  { x: 120, y: 348, label: 'Km 140' },
                  { x: 210, y: 300, label: 'Km 180' },
                  { x: 330, y: 215, label: 'Km 220' },
                  { x: 450, y: 175, label: 'Km 260' },
                  { x: 610, y: 142, label: 'Km 300' },
                  { x: 740, y: 100, label: 'Km 340' },
                ].map((tick) => (
                  <g key={tick.label}>
                    <circle cx={tick.x} cy={tick.y} r="2.5" fill="#526B82" />
                    <text x={tick.x - 12} y={tick.y + 14} fontSize="8" fill="#78909C" fontFamily="JetBrains Mono">
                      {tick.label}
                    </text>
                  </g>
                ))}

                {/* Waypoint 1: Bharuch Impasse Pin & Pulse (Red) */}
                <g
                  className="gis-pin-group"
                  onClick={() => setSelectedCallout('bharuch')}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx="285" cy="245" r="14" fill="#E85D68" fillOpacity="0.25">
                    <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="285" cy="245" r="7" fill="#E85D68" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="285" cy="245" r="2.5" fill="#FFFFFF" />
                </g>

                {/* Connecting dotted line to Bharuch Callout */}
                <line x1="285" y1="245" x2="250" y2="285" stroke="#E85D68" strokeWidth="1.5" strokeDasharray="3,3" />

                {/* Waypoint 2: Vadodara Power Shift Pin & Pulse (Amber) */}
                <g
                  className="gis-pin-group"
                  onClick={() => setSelectedCallout('vadodara')}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx="490" cy="172" r="14" fill="#F2A51A" fillOpacity="0.25">
                    <animate attributeName="r" values="8;18;8" dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="490" cy="172" r="7" fill="#F2A51A" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="490" cy="172" r="2.5" fill="#FFFFFF" />
                </g>

                {/* Connecting dotted line to Vadodara Callout */}
                <line x1="490" y1="172" x2="430" y2="130" stroke="#0FA89A" strokeWidth="1.5" strokeDasharray="3,3" />

                {/* Active drone telemetry vector icon on map */}
                <g transform="translate(680, 160)">
                  <circle cx="0" cy="0" r="12" fill="#5BA7D9" fillOpacity="0.15" />
                  <circle cx="0" cy="0" r="3" fill="#0FA89A" />
                  <text x="8" y="3" fontSize="8" fill="#064C55" fontWeight="600">Drone-04 LiDAR</text>
                </g>

                {/* Nearest Alternative Land Parcels Layer & Proximity Vectors */}
                {activeLayers.nearestParcels && (
                  <g className="gis-nearest-parcels-layer">
                    {/* Concentric radar rings around active target land */}
                    <circle
                      cx={anchorCoords.x}
                      cy={anchorCoords.y}
                      r="40"
                      fill="none"
                      stroke="#0FA89A"
                      strokeWidth="1.2"
                      strokeDasharray="3,3"
                      opacity="0.6"
                    >
                      <animate attributeName="r" values="32;58;32" dur="3.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0.2;0.7" dur="3.5s" repeatCount="indefinite" />
                    </circle>
                    <circle
                      cx={anchorCoords.x}
                      cy={anchorCoords.y}
                      r="85"
                      fill="none"
                      stroke="#0FA89A"
                      strokeWidth="0.8"
                      strokeDasharray="4,5"
                      opacity="0.3"
                    />

                    {/* Proximity Vectors & Nearest Land Parcel Nodes */}
                    {displayedNearestParcels.map((p) => {
                      const px = p.map_x ?? (anchorCoords.x + 35);
                      const py = p.map_y ?? (anchorCoords.y - 35);
                      const isSelected = selectedAlternative?.id === p.id;
                      const isHovered = hoveredParcel?.id === p.id;
                      const isZeroHab = p.habitation_status === 'none';
                      const isSparse = p.habitation_status === 'sparse';
                      const strokeColor = isZeroHab ? '#16A878' : isSparse ? '#F2A51A' : '#E85D68';
                      const midX = (anchorCoords.x + px) / 2;
                      const midY = (anchorCoords.y + py) / 2;

                      return (
                        <g key={`vector-${p.id}`} className="gis-alternative-vector">
                          {/* Proximity measurement vector line */}
                          <line
                            x1={anchorCoords.x}
                            y1={anchorCoords.y}
                            x2={px}
                            y2={py}
                            stroke={strokeColor}
                            strokeWidth={isSelected ? '2.5' : isHovered ? '2' : '1.2'}
                            strokeDasharray={isSelected ? 'none' : '3,3'}
                            opacity={isSelected ? 1 : isHovered ? 0.85 : 0.45}
                          />

                          {/* Distance label pill on vector - ONLY shown on active or hovered parcel to prevent visual stacking */}
                          {(isSelected || isHovered) && (
                            <g>
                              <rect
                                x={midX - 22}
                                y={midY - 8.5}
                                width="44"
                                height="17"
                                rx="4"
                                fill="#062F35"
                                stroke={strokeColor}
                                strokeWidth="1.2"
                                opacity="0.95"
                              />
                              <text
                                x={midX}
                                y={midY + 3.5}
                                fontSize="8.5"
                                fontWeight="700"
                                textAnchor="middle"
                                fill="#FFFFFF"
                                fontFamily="JetBrains Mono"
                              >
                                {p.distance_km}km
                              </text>
                            </g>
                          )}

                          {/* Alternative Parcel Pin */}
                          <g
                            transform={`translate(${px}, ${py})`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAlternative(p);
                              triggerNotify(`Selected nearest land: ${p.survey_number} (${p.distance_km}km away • ${p.priority_badge})`);
                            }}
                            onMouseEnter={() => setHoveredParcel(p)}
                            onMouseLeave={() => setHoveredParcel(null)}
                            style={{ cursor: 'pointer' }}
                          >
                            {/* Glowing pulse ring for zero habitation */}
                            {isZeroHab && (
                              <circle cx="0" cy="0" r={isSelected ? "18" : "14"} fill="#16A878" fillOpacity="0.22">
                                <animate attributeName="r" values="10;22;10" dur="2s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite" />
                              </circle>
                            )}

                            {/* Node outer circle */}
                            <circle
                              cx="0"
                              cy="0"
                              r={isSelected ? '11' : '8.5'}
                              fill={strokeColor}
                              stroke="#FFFFFF"
                              strokeWidth={isSelected ? '2.5' : '2'}
                            />

                            {/* Priority Icon inside circle */}
                            {isZeroHab ? (
                              <text x="0" y="3" fontSize="8" textAnchor="middle" fill="#FFFFFF" fontWeight="900">
                                ★
                              </text>
                            ) : (
                              <text x="0" y="2.8" fontSize="7" textAnchor="middle" fill="#FFFFFF" fontWeight="700">
                                {p.priority_rank}
                              </text>
                            )}

                            {/* Clean Priority Badge Tag */}
                            {isSelected || isHovered ? (
                              <g transform="translate(14, -10)">
                                <rect
                                  x="0"
                                  y="0"
                                  width={isZeroHab ? "130" : "105"}
                                  height="20"
                                  rx="4"
                                  fill={isZeroHab ? '#053E32' : '#2D1B05'}
                                  stroke={strokeColor}
                                  strokeWidth="1.2"
                                />
                                <text
                                  x="6"
                                  y="13.5"
                                  fontSize="8"
                                  fontWeight="700"
                                  fill={isZeroHab ? '#48E5B1' : '#F7C665'}
                                  fontFamily="Inter, sans-serif"
                                >
                                  {isZeroHab ? `★ #${p.priority_rank} 0-Hab • ${p.distance_km}km` : `#${p.priority_rank} ${p.habitation_status} • ${p.distance_km}km`}
                                </text>
                              </g>
                            ) : (
                              <g transform="translate(11, -7.5)">
                                <rect
                                  x="0"
                                  y="0"
                                  width={isZeroHab ? "56" : "48"}
                                  height="15"
                                  rx="3"
                                  fill={isZeroHab ? '#08483B' : '#2D1B05'}
                                  stroke={strokeColor}
                                  strokeWidth="0.8"
                                  opacity="0.9"
                                />
                                <text
                                  x="4"
                                  y="10.5"
                                  fontSize="7"
                                  fontWeight="700"
                                  fill={isZeroHab ? '#48E5B1' : '#F7C665'}
                                  fontFamily="Inter, sans-serif"
                                >
                                  {isZeroHab ? `#${p.priority_rank} 0-Hab` : `#${p.priority_rank} ${p.habitation_status}`}
                                </text>
                              </g>
                            )}
                          </g>
                        </g>
                      );
                    })}
                  </g>
                )}
              </svg>

              {/* Floating Hover Tooltip for Nearest Land Parcel */}
              {hoveredParcel && (
                <div
                  className="gis-parcel-tooltip surface"
                  style={{
                    position: 'absolute',
                    left: `${((hoveredParcel.map_x ?? 300) / 900) * 100}%`,
                    top: `${((hoveredParcel.map_y ?? 200) / 440) * 100}%`,
                    transform: 'translate(-50%, -125%)',
                    pointerEvents: 'none',
                    zIndex: 20,
                  }}
                >
                  <div className={`gis-tooltip-badge ${hoveredParcel.priority_tier.toLowerCase()}`}>
                    {hoveredParcel.priority_badge}
                  </div>
                  <strong style={{ fontSize: 13, color: '#102A43', display: 'block', marginTop: 2 }}>
                    {hoveredParcel.survey_number}
                  </strong>
                  <div className="tiny muted" style={{ fontSize: 11 }}>
                    {hoveredParcel.village}, {hoveredParcel.district} • {hoveredParcel.distance_km} km away
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: hoveredParcel.habitation_status === 'none' ? '#16A878' : '#D98A08', marginTop: 3 }}>
                    {hoveredParcel.habitation_status === 'none' ? '✓ Zero Habitation (0 Families)' : `⚠️ ${hoveredParcel.affected_families_count} Families Displaced`}
                  </div>
                </div>
              )}

              {/* Floating Active Nearest Land Recommendation HUD on Map Canvas */}
              {selectedAlternative && (
                <div className="gis-map-active-rec-hud">
                  <div className="gis-rec-hud-header">
                    <span className={`gis-rec-tier-badge ${selectedAlternative.priority_tier.toLowerCase()}`}>
                      {selectedAlternative.priority_tier === 'HIGH' ? '⭐ TOP PRIORITY: ZERO HABITATION' : selectedAlternative.priority_badge}
                    </span>
                    <span className="gis-rec-dist mono">{selectedAlternative.distance_km} km away</span>
                  </div>
                  <div className="gis-rec-hud-title">{selectedAlternative.survey_number} • {selectedAlternative.village}</div>
                  <div className="gis-rec-hud-meta">
                    <span className="gis-meta-item">
                      <strong>Habitation:</strong> {selectedAlternative.habitation_status === 'none' ? '0 Displaced Families (Zero R&R Resettlement Friction)' : `${selectedAlternative.affected_families_count} Families Displaced`}
                    </span>
                    <span className="gis-meta-item">
                      <strong>Time Saved:</strong> +{selectedAlternative.time_savings_days} Days vs Disputed Corridor
                    </span>
                  </div>
                  <button
                    className="gis-rec-adopt-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerNotify(`Selected ${selectedAlternative.survey_number} (${selectedAlternative.village}) as the primary realignment alternative!`);
                    }}
                  >
                    <CheckCheck size={13} />
                    <span>Select This Nearest Land</span>
                  </button>
                </div>
              )}

              {/* Floating Callout 1: Vadodara Urban Fringe (Top Center) */}
              <div
                className="gis-callout-card vadodara-callout"
                onClick={() => setSelectedCallout('vadodara')}
              >
                <div className="gis-callout-header">
                  <span className="gis-status-badge-progress">
                    <span className="badge-dot" />
                    SURVEY IN PROGRESS
                  </span>
                  <span className="gis-chainage-tag mono">Km 248.10</span>
                </div>
                <div className="gis-callout-title">Vadodara Urban Fringe</div>
                <p className="gis-callout-desc">
                  High-tension GETCO power line rerouting; compensation reassessment under Sec 28A.
                </p>
                <div className="gis-callout-footer">
                  <span className="gis-handover-target">Target Handover: <strong>28 July</strong></span>
                  <button
                    className="gis-callout-action-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerNotify('Tracking joint transmission tower rerouting at Vadodara Km 248.10');
                    }}
                  >
                    Track &gt;
                  </button>
                </div>
              </div>

              {/* Floating Callout 2: Bharuch Bypass Link (Bottom Left) */}
              <div
                className="gis-callout-card bharuch-callout"
                onClick={() => setSelectedCallout('bharuch')}
              >
                <div className="gis-callout-header">
                  <span className="gis-status-badge-critical">
                    <span className="badge-dot-red" />
                    CRITICAL IMPASSE
                  </span>
                  <span className="gis-chainage-tag mono">Km 192.40</span>
                </div>
                <div className="gis-callout-title">Bharuch Bypass Link</div>
                <p className="gis-callout-desc">
                  16.4 km delayed · Title dispute over 342 agrarian parcels pending sub-divisional tribunal.
                </p>
                <div className="gis-callout-footer">
                  <span className="gis-delay-penalty">Delay Penalty: <strong>+45 Days</strong></span>
                  <button
                    className="gis-callout-action-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerNotify('Opening judicial docket review for Bharuch Bypass agrarian tribunal.');
                    }}
                  >
                    Inspect &gt;
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Telemetry Strip */}
            <div className="gis-telemetry-strip">
              {/* Telemetry 1 */}
              <div className="gis-telemetry-item">
                <div className="gis-telemetry-icon-box gis-telem-blue">
                  <Plane size={15} />
                </div>
                <div className="gis-telemetry-info">
                  <div className="gis-telemetry-label">ACTIVE SURVEY DRONES</div>
                  <div className="gis-telemetry-main">
                    <strong className="gis-telem-val">8 Airborne</strong>
                    <span className="gis-telem-sub">• LiDAR Scan 4K</span>
                  </div>
                </div>
              </div>

              {/* Telemetry 2 */}
              <div className="gis-telemetry-item">
                <div className="gis-telemetry-icon-box gis-telem-green">
                  <Compass size={15} />
                </div>
                <div className="gis-telemetry-info">
                  <div className="gis-telemetry-label">FIELD OPS CREWS</div>
                  <div className="gis-telemetry-main">
                    <strong className="gis-telem-val">34 DGPS Squads</strong>
                    <span className="gis-telem-sub">• 100% Geo-tag</span>
                  </div>
                </div>
              </div>

              {/* Telemetry 3 */}
              <div className="gis-telemetry-item">
                <div className="gis-telemetry-icon-box gis-telem-slate">
                  <Satellite size={15} />
                </div>
                <div className="gis-telemetry-info">
                  <div className="gis-telemetry-label">SATELLITE PASS TELEMETRY</div>
                  <div className="gis-telemetry-main">
                    <strong className="gis-telem-val">Cartosat-3</strong>
                    <span className="gis-telem-sub">• 3 hrs ago (0.28m)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 1.5: Nearest Land Parcel Finder & Zero-Habitation Prioritization */}
          <div className="surface gis-nearest-land-card">
            <div className="gis-nearest-header">
              <div>
                <div className="gis-nearest-eyebrow">
                  <Compass size={12} className="gis-icon-teal" />
                  <span>SPATIAL ALTERNATIVE RADAR</span>
                  <span className="gis-sep">/</span>
                  <span>ZERO-HABITATION DECISION MATRIX</span>
                  <span className="gis-sep">/</span>
                  <span className="gis-tag-active-engine">HAVERSINE ENGINE v2.4</span>
                </div>
                <h2 className="gis-nearest-title">
                  Nearest Land Parcel Finder &amp; Habitation Priority Recommender
                </h2>
                <p className="gis-nearest-subtitle">
                  Automated spatial alternative detection for bottlenecked Right-of-Way stretches. Prioritizes uninhabited government/waste lands to bypass R&amp;R litigation friction, judicial stays, and displacement delays.
                </p>
              </div>

              <div className="gis-nearest-target-selector">
                <span className="gis-selector-lbl">ACTIVE TARGET LAND:</span>
                <div className="gis-target-btn-group">
                  <button
                    className={`gis-target-btn ${selectedCallout === 'bharuch' ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCallout('bharuch');
                      triggerNotify('Switched Target Land to Bharuch Bypass (GAT 412/A, Km 188.200).');
                    }}
                  >
                    <MapPin size={12} />
                    <span>Bharuch Bypass (GAT 412/A)</span>
                  </button>
                  <button
                    className={`gis-target-btn ${selectedCallout === 'vadodara' ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCallout('vadodara');
                      triggerNotify('Switched Target Land to Vadodara Fringe (GAT 78, Km 248.100).');
                    }}
                  >
                    <MapPin size={12} />
                    <span>Vadodara Fringe (GAT 78)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Priority Filter Tabs */}
            <div className="gis-priority-controls-bar">
              <div className="gis-priority-tabs">
                <button
                  className={`gis-priority-tab-btn ${habitationFilter === 'zero_habitation' ? 'active-green' : ''}`}
                  onClick={() => {
                    setHabitationFilter('zero_habitation');
                    triggerNotify('Active Filter: High Priority Zero-Habitation Lands Only (0 families displaced).');
                  }}
                >
                  <ShieldCheck size={14} className="gis-icon-green" />
                  <strong>⭐ High Priority: Zero Habitation</strong>
                  <span className="gis-tab-count green">
                    {zeroHabCount} Available
                  </span>
                </button>

                <button
                  className={`gis-priority-tab-btn ${habitationFilter === 'sparse_habitation' ? 'active-sparse' : ''}`}
                  onClick={() => {
                    setHabitationFilter('sparse_habitation');
                    triggerNotify('Active Filter: Moderate Priority Sparse Habitation.');
                  }}
                >
                  <span>🟡 Sparse Habitation</span>
                  <span className="gis-tab-count amber">{sparseHabCount}</span>
                </button>

                <button
                  className={`gis-priority-tab-btn ${habitationFilter === 'dense_habitation' ? 'active-dense' : ''}`}
                  onClick={() => {
                    setHabitationFilter('dense_habitation');
                    triggerNotify('Active Filter: Low Priority Dense Habitation (Village settlements).');
                  }}
                >
                  <span>🔴 Dense Habitation (Low Priority)</span>
                  <span className="gis-tab-count red">{denseHabCount}</span>
                </button>

                <button
                  className={`gis-priority-tab-btn ${habitationFilter === 'all' ? 'active-all' : ''}`}
                  onClick={() => {
                    setHabitationFilter('all');
                    triggerNotify('Active Filter: All Nearest Parcels ranked by Habitation Priority.');
                  }}
                >
                  <Navigation size={14} />
                  <span>All Alternatives</span>
                  <span className="gis-tab-count slate">{allCount}</span>
                </button>
              </div>

              <div className="gis-priority-meta">
                <div className="gis-priority-stat">
                  <span className="stat-label">Radius:</span>
                  <select
                    value={searchRadiusKm}
                    onChange={(e) => setSearchRadiusKm(Number(e.target.value))}
                    className="gis-meta-select"
                  >
                    <option value={10}>10 km</option>
                    <option value={25}>25 km</option>
                    <option value={50}>50 km</option>
                  </select>
                </div>
                {isLoadingParcels && (
                  <span className="gis-loading-indicator">
                    <RefreshCw size={12} className="spin-icon" />
                    <span>Calculating Spatial Vectors...</span>
                  </span>
                )}
              </div>
            </div>

            {/* Head-to-Head Comparative Advantage Card (Target Land vs #1 Zero Habitation Alternative) */}
            {selectedAlternative && (
              <div className="gis-h2h-card">
                <div className="gis-h2h-header">
                  <div className="gis-h2h-title-row">
                    <Sparkles size={14} className="gis-icon-green" />
                    <strong>HEAD-TO-HEAD FEASIBILITY COMPARISON</strong>
                    <span className="gis-h2h-badge">Fast-Track Alternative Analysis</span>
                  </div>
                  <span className="gis-h2h-savings-pill">
                    ⚡ Saves {selectedAlternative.time_savings_days} Days vs Disputed RoW
                  </span>
                </div>

                <div className="gis-h2h-grid">
                  {/* Left Column: Target Land Bottleneck */}
                  <div className="gis-h2h-col col-disputed">
                    <div className="gis-col-tag tag-danger">CURRENT TARGET LAND (BOTTLENECK)</div>
                    <div className="gis-col-title">
                      {selectedCallout === 'bharuch' ? 'Bharuch Bypass (GAT 412/A, 412/D)' : 'Vadodara Urban Fringe (GAT 78, 82)'}
                    </div>
                    <div className="gis-col-sub">
                      {selectedCallout === 'bharuch' ? 'Km 188.200 - 190.500 · Disputed Agrarian Corridor' : 'Km 248.100 · High-Tension Transmission Crossing'}
                    </div>

                    <div className="gis-h2h-metrics">
                      <div className="gis-h2h-metric-row">
                        <span className="h2h-lbl">Habitation Status:</span>
                        <span className="h2h-val val-danger">
                          {selectedCallout === 'bharuch' ? 'Dense (34 Families Displaced)' : 'Dense (19 Families Fringe)'}
                        </span>
                      </div>
                      <div className="gis-h2h-metric-row">
                        <span className="h2h-lbl">Structures / Dwellings:</span>
                        <span className="h2h-val val-danger">
                          {selectedCallout === 'bharuch' ? '18 Residential Dwellings' : '12 Suburban Structures'}
                        </span>
                      </div>
                      <div className="gis-h2h-metric-row">
                        <span className="h2h-lbl">Est. Possession Timeline:</span>
                        <span className="h2h-val val-danger">
                          {selectedCallout === 'bharuch' ? '180 Days (Sec 20 Stay)' : '150 Days (GETCO Power Shift)'}
                        </span>
                      </div>
                      <div className="gis-h2h-metric-row">
                        <span className="h2h-lbl">R&amp;R Budget Exposure:</span>
                        <span className="h2h-val val-danger">
                          {selectedCallout === 'bharuch' ? '₹14.2 Cr Relocation Package' : '₹9.8 Cr Utility & Resettlement'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Divert Indicator */}
                  <div className="gis-h2h-divider">
                    <div className="gis-divider-arrow">
                      <ArrowRight size={18} />
                    </div>
                    <span className="gis-divider-dist">{selectedAlternative.distance_km} km</span>
                    <span className="gis-divider-sub">RoW Divert</span>
                  </div>

                  {/* Right Column: Top Recommended Alternative Land */}
                  <div className="gis-h2h-col col-alternative">
                    <div className="gis-col-tag tag-success">
                      {selectedAlternative.priority_tier === 'HIGH' ? '★ TOP RECOMMENDATION (ZERO HABITATION)' : 'SECONDARY ALTERNATIVE'}
                    </div>
                    <div className="gis-col-title">
                      {selectedAlternative.survey_number}
                    </div>
                    <div className="gis-col-sub">
                      {selectedAlternative.village}, {selectedAlternative.district} · {selectedAlternative.chainage || 'Adjacent RoW Alignment'}
                    </div>

                    <div className="gis-h2h-metrics">
                      <div className="gis-h2h-metric-row">
                        <span className="h2h-lbl">Habitation Status:</span>
                        <span className={`h2h-val ${selectedAlternative.habitation_status === 'none' ? 'val-success' : 'val-amber'}`}>
                          {selectedAlternative.habitation_status === 'none'
                            ? '★ Zero Habitation (0 Displaced Families)'
                            : `${selectedAlternative.affected_families_count} Families (Sparse)`}
                        </span>
                      </div>
                      <div className="gis-h2h-metric-row">
                        <span className="h2h-lbl">Structures / Dwellings:</span>
                        <span className={`h2h-val ${selectedAlternative.structures_count === 0 ? 'val-success' : 'val-amber'}`}>
                          {selectedAlternative.structures_count === 0
                            ? '0 Structures (100% Uninhabited)'
                            : `${selectedAlternative.structures_count} Storage Sheds`}
                        </span>
                      </div>
                      <div className="gis-h2h-metric-row">
                        <span className="h2h-lbl">Est. Possession Timeline:</span>
                        <span className="h2h-val val-success">
                          ~{selectedAlternative.estimated_acquisition_days} Days Handover (Fast Track)
                        </span>
                      </div>
                      <div className="gis-h2h-metric-row">
                        <span className="h2h-lbl">R&amp;R Cost Friction:</span>
                        <span className="h2h-val val-success">
                          ₹0 Friction (Standard Circle Rate Only)
                        </span>
                      </div>
                    </div>

                    <div className="gis-h2h-action-bar">
                      <button
                        className="btn btn-primary gis-adopt-btn"
                        onClick={() => {
                          triggerNotify(`Adopted Alternative RoW: ${selectedAlternative.survey_number} in ${selectedAlternative.village}. Saves ~${selectedAlternative.time_savings_days} days.`);
                        }}
                      >
                        <CheckCheck size={14} />
                        <span>Adopt as Alternative RoW Alignment</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* List of Nearest Alternative Parcels Ranked by Habitation Priority */}
            <div className="gis-nearest-cards-list">
              <div className="gis-list-title-row">
                <span className="gis-list-title">
                  RANKED ALTERNATIVE PARCELS ({displayedNearestParcels.length} FOUND WITHIN {searchRadiusKm} KM)
                </span>
                <span className="gis-list-note">
                  Ranked by Zero Habitation Priority &gt; Proximity Distance
                </span>
              </div>

              <div className="gis-cards-grid">
                {displayedNearestParcels.map((parcel) => {
                  const isZeroHab = parcel.habitation_status === 'none';
                  const isSelected = selectedAlternative?.id === parcel.id;
                  const tierClass = parcel.priority_tier.toLowerCase();

                  return (
                    <div
                      key={parcel.id}
                      className={`gis-parcel-rank-card ${tierClass} ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedAlternative(parcel)}
                    >
                      <div className="gis-card-topbar">
                        <span className={`gis-priority-tag tag-${tierClass}`}>
                          {isZeroHab ? <Star size={11} className="gis-star-fill" /> : null}
                          <span>#{parcel.priority_rank} {parcel.priority_badge}</span>
                        </span>
                        <span className="gis-distance-tag">
                          <MapPin size={11} />
                          <span>{parcel.distance_km} km away</span>
                        </span>
                      </div>

                      <div className="gis-card-main">
                        <div className="gis-card-survey-row">
                          <h4 className="gis-card-survey">{parcel.survey_number}</h4>
                          <span className="gis-card-area">{parcel.area_hectares} Ha</span>
                        </div>
                        <div className="gis-card-village">
                          {parcel.village}, {parcel.district} {parcel.chainage ? `• ${parcel.chainage}` : ''}
                        </div>
                        <p className="gis-card-note">{parcel.status_note}</p>

                        <div className="gis-card-metrics-row">
                          <div className="gis-card-metric">
                            <span className="lbl">Habitation:</span>
                            <span className={`val ${isZeroHab ? 'text-green' : parcel.habitation_status === 'sparse' ? 'text-amber' : 'text-red'}`}>
                              {isZeroHab ? 'Zero (0 Families)' : `${parcel.affected_families_count} Families`}
                            </span>
                          </div>
                          <div className="gis-card-metric">
                            <span className="lbl">Structures:</span>
                            <span className="val">{parcel.structures_count} Units</span>
                          </div>
                          <div className="gis-card-metric">
                            <span className="lbl">Acquisition:</span>
                            <span className="val text-teal">~{parcel.estimated_acquisition_days}d</span>
                          </div>
                          <div className="gis-card-metric">
                            <span className="lbl">Classification:</span>
                            <span className="val truncate-1">{parcel.classification}</span>
                          </div>
                        </div>

                        <div className="gis-card-footer">
                          <span className="gis-time-saved-tag">
                            ⚡ Saves {parcel.time_savings_days}d vs Disputed
                          </span>
                          <button
                            className={`gis-card-action-btn ${isSelected ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAlternative(parcel);
                              triggerNotify(`Selected ${parcel.survey_number} as primary RoW alternate.`);
                            }}
                          >
                            {isSelected ? 'Active Alternative' : 'Select Alternate >'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 2: Chainage Parcel Registry & Right-of-Way Handoff */}
          <div className="surface gis-registry-card">

            <div className="gis-registry-header">
              <div>
                <h2 className="gis-registry-title">
                  Chainage Parcel Registry &amp; Right-of-Way Handoff
                </h2>
                <p className="gis-registry-subtitle">
                  Live cross-referencing between National Highway Authority (NHAI) &amp; State Revenue Records
                </p>
              </div>
              <button
                className="gis-view-all-link"
                onClick={() => setActiveModal('registry_dockets')}
              >
                <span>View All 420 Registry Dockets</span>
                <span className="arrow-icon">→</span>
              </button>
            </div>

            <div className="table-wrap">
              <table className="data-table gis-table">
                <thead>
                  <tr>
                    <th>CHAINAGE (KM)</th>
                    <th>VILLAGE / TALUKA</th>
                    <th>SURVEY / GAT NO.</th>
                    <th>ACQUISITION PHASE</th>
                    <th>PHYSICAL POSSESSION</th>
                    <th>ACTION / STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Row 1 */}
                  <tr>
                    <td className="mono bold-chainage">Km 188.200 - 190.500</td>
                    <td>
                      <div className="gis-village-name">Vagra, Bharuch</div>
                    </td>
                    <td className="mono gis-gat-no">GAT 412/A, 412/D</td>
                    <td>
                      <span className="tag-phase phase-disputed">Sec 20 Disputed</span>
                    </td>
                    <td>
                      <span className="status-blocked">Blocked (Stay Order)</span>
                    </td>
                    <td>
                      <button
                        className="btn-table-action"
                        onClick={() => setActiveModal('resolve_injunction')}
                      >
                        Resolve Injunction
                      </button>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr>
                    <td className="mono bold-chainage">Km 194.000 - 198.800</td>
                    <td>
                      <div className="gis-village-name">Amod, Bharuch</div>
                    </td>
                    <td className="mono gis-gat-no">GAT 108 to 142</td>
                    <td>
                      <span className="tag-phase phase-declared">Award Declared 3G</span>
                    </td>
                    <td>
                      <span className="status-normal">78% Transferred</span>
                    </td>
                    <td>
                      <button
                        className="btn-table-action"
                        onClick={() => setActiveModal('release_tranche')}
                      >
                        Release Tranche
                      </button>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr>
                    <td className="mono bold-chainage">Km 246.000 - 251.200</td>
                    <td>
                      <div className="gis-village-name">Padra, Vadodara</div>
                    </td>
                    <td className="mono gis-gat-no">GAT 78, 82, 89</td>
                    <td>
                      <span className="tag-phase phase-utility">Utility Clearance</span>
                    </td>
                    <td>
                      <span className="status-normal">GETCO HT Tower Shift</span>
                    </td>
                    <td>
                      <button
                        className="btn-table-action"
                        onClick={() => setActiveModal('joint_survey')}
                      >
                        View Joint Survey
                      </button>
                    </td>
                  </tr>

                  {/* Row 4 */}
                  <tr>
                    <td className="mono bold-chainage">Km 284.100 - 310.000</td>
                    <td>
                      <div className="gis-village-name">Anand Rural Bypass</div>
                    </td>
                    <td className="mono gis-gat-no">GAT 21-89 (Series)</td>
                    <td>
                      <span className="tag-phase phase-complete">Sec 24 Mutation Complete</span>
                    </td>
                    <td>
                      <span className="status-complete">100% Handed Over</span>
                    </td>
                    <td>
                      <div className="gis-contractor-active">
                        <CheckCircle2 size={13} className="gis-check-green" />
                        <span>Contractor Active</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Approx 36%) */}
        <div className="gis-right-column">
          {/* Card 1: Priority Stretch Dockets */}
          <div className="surface gis-dockets-card">
            <div className="gis-dockets-header">
              <div className="gis-dockets-title-wrap">
                <span className="gis-red-pulse-dot" />
                <h3 className="gis-dockets-title">Priority Stretch Dockets</h3>
              </div>
              <span className="gis-escalated-pill">3 Escalated</span>
            </div>

            {/* Docket 1: Bharuch Section */}
            <div className="gis-docket-item">
              <div className="gis-docket-topline">
                <span className="gis-docket-segment-tag">DMIC EXPRESSWAY SEGMENT</span>
                <span className="gis-docket-bottleneck-badge">16.4 km Bottleneck</span>
              </div>
              <h4 className="gis-docket-heading">Bharuch Section (Km 188 - 204)</h4>
              <p className="gis-docket-body">
                342 disputed agricultural plots. Landowners demanding parity with urban industrial compensation multiplier under LARR Act Schedule I.
              </p>

              <div className="gis-docket-metrics-grid">
                <div className="gis-docket-metric-box">
                  <div className="gis-metric-lbl">CONSTRUCTION IMPACT</div>
                  <div className="gis-metric-val val-danger">+45 Days Civil Delay</div>
                </div>
                <div className="gis-docket-metric-box">
                  <div className="gis-metric-lbl">FINANCIAL EXPOSURE</div>
                  <div className="gis-metric-val">₹142.8 Cr Pending</div>
                </div>
              </div>

              <div className="gis-docket-footer">
                <div className="gis-authority-tag">
                  <Scale size={13} className="gis-auth-icon" />
                  <span>Sub-Divisional Magistrate</span>
                </div>
                <button
                  className="gis-docket-btn-dark"
                  onClick={() => setActiveModal('docket_bharuch')}
                >
                  Open Joint Survey Docket
                </button>
              </div>
            </div>

            {/* Docket 2: Bullet Train HSR */}
            <div className="gis-docket-item">
              <div className="gis-docket-topline">
                <span className="gis-docket-segment-tag">BULLET TRAIN HSR</span>
                <span className="gis-docket-encumbered-badge">4.8 km Encumbered</span>
              </div>
              <h4 className="gis-docket-heading">Surat Peripheral (Km 84 - 88.8)</h4>
              <p className="gis-docket-body">
                Gujarat High Court interim stay petition granted for environmental mitigation review adjacent to wetlands corridor.
              </p>

              <div className="gis-docket-metrics-grid">
                <div className="gis-docket-metric-box">
                  <div className="gis-metric-lbl">CONTRACTOR RISK</div>
                  <div className="gis-metric-val val-danger">+60 Days Scheduled</div>
                </div>
                <div className="gis-docket-metric-box">
                  <div className="gis-metric-lbl">HEARING STATUS</div>
                  <div className="gis-metric-val">18 Jun (Bench 2)</div>
                </div>
              </div>

              <div className="gis-docket-footer">
                <div className="gis-authority-tag">
                  <Landmark size={13} className="gis-auth-icon" />
                  <span>Advocate General Office</span>
                </div>
                <button
                  className="gis-docket-btn-light"
                  onClick={() => setActiveModal('docket_surat')}
                >
                  Legal Briefing
                </button>
              </div>
            </div>

            {/* Docket 3: Dholera Express Spine */}
            <div className="gis-docket-item">
              <div className="gis-docket-topline">
                <span className="gis-docket-segment-tag">DHOLERA EXPRESS SPINE</span>
                <span className="gis-docket-acquired-badge">92% Acquired</span>
              </div>
              <h4 className="gis-docket-heading">Package 3 (Bhimnath Interlink)</h4>
              <p className="gis-docket-body">
                Last 3.2 km stretch awaiting final MoEFCC Forest Division NOC for scrub jungle diversion. Compensatory afforestation parcel allocated in Amreli.
              </p>

              <div className="gis-docket-footer">
                <div className="gis-authority-tag">
                  <FileText size={13} className="gis-auth-icon" />
                  <span>Collector Sanction Stage</span>
                </div>
                <button
                  className="gis-docket-btn-teal"
                  onClick={() => setActiveModal('docket_dholera')}
                >
                  Collector Meeting
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: RoW Handover Deadlines */}
          <div className="surface gis-deadlines-card">
            <div className="gis-deadlines-header">
              <div>
                <h3 className="gis-deadlines-title">RoW Handover Deadlines</h3>
                <div className="gis-deadlines-sub">Q3 2025 Cabinet Infrastructure Target</div>
              </div>
              <div className="gis-calendar-icon-box">
                <Calendar size={16} />
              </div>
            </div>

            <div className="gis-timeline-list">
              {/* Milestone 1 */}
              <div className="gis-timeline-item" style={{ cursor: 'pointer' }} onClick={() => setActiveMilestone('dfc_sanand')} title="Click to open Milestone Verification Docket">
                <div className="gis-timeline-top">
                  <div className="gis-timeline-date-wrap">
                    <span className="gis-timeline-dot dot-green" />
                    <strong className="gis-timeline-date">24 JUNE 2025 • IN 12 DAYS</strong>
                  </div>
                  <span className="gis-timeline-stage-tag">STAGE 3B</span>
                </div>
                <h4 className="gis-timeline-name">DFC Sanand Logistics Interconnect</h4>
                <p className="gis-timeline-desc">
                  28.4 km clean corridor possession certificate to L&amp;T Infrastructure.
                </p>
              </div>

              {/* Milestone 2 */}
              <div className="gis-timeline-item" style={{ cursor: 'pointer' }} onClick={() => setActiveMilestone('vadodara_ring')} title="Click to open Milestone Verification Docket">
                <div className="gis-timeline-top">
                  <div className="gis-timeline-date-wrap">
                    <span className="gis-timeline-dot dot-teal" />
                    <strong className="gis-timeline-date">15 JULY 2025</strong>
                  </div>
                  <span className="gis-timeline-stage-tag">STAGE 3A</span>
                </div>
                <h4 className="gis-timeline-name">Vadodara Urban Ring Connector</h4>
                <p className="gis-timeline-desc">
                  Final compensation arbitration session with 84 landholders in Padra.
                </p>
              </div>

              {/* Milestone 3 */}
              <div className="gis-timeline-item" style={{ cursor: 'pointer' }} onClick={() => setActiveMilestone('dmic_cabinet')} title="Click to open Cabinet Benchmark Review">
                <div className="gis-timeline-top">
                  <div className="gis-timeline-date-wrap">
                    <span className="gis-timeline-dot dot-red" />
                    <strong className="gis-timeline-date">30 AUGUST 2025</strong>
                  </div>
                  <span className="gis-timeline-benchmark-tag">CABINET BENCHMARK</span>
                </div>
                <h4 className="gis-timeline-name">100% RoW Handover - DMIC Gujarat Reach</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          GIS ACTION MODALS — OPENED BY INTERACTIVE BUTTONS
          ══════════════════════════════════════════════════════════════════ */}

      {/* 1. Chainage Parcel Registry Dockets Modal */}
      {activeModal === 'registry_dockets' && (
        <div className="gis-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="gis-modal-card" style={{ maxWidth: 940 }} onClick={(e) => e.stopPropagation()}>
            <div className="gis-modal-header">
              <div>
                <div className="gis-modal-eyebrow">
                  <FolderOpen size={13} />
                  <span>STATUTORY REGISTRY • GUJARAT REVENUE DEPT</span>
                </div>
                <h2 className="gis-modal-title">Chainage Parcel Registry &amp; Right-of-Way Handoff (420 Dockets)</h2>
              </div>
              <button className="gis-modal-close-btn" onClick={() => setActiveModal(null)} title="Close dialog">
                <X size={16} />
              </button>
            </div>

            <div className="gis-modal-body">
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search by Village, Chainage, or GAT Number..."
                  value={docketsQuery}
                  onChange={(e) => setDocketsQuery(e.target.value)}
                  style={{
                    flex: 1, minWidth: 240, padding: '9px 14px', borderRadius: 8,
                    border: '1px solid #D8E8E6', background: 'transparent', color: 'inherit', fontSize: 13
                  }}
                />
                <select
                  value={docketsCorridor}
                  onChange={(e) => setDocketsCorridor(e.target.value)}
                  style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #D8E8E6', background: 'transparent', color: 'inherit', fontSize: 13 }}
                >
                  <option value="all">All Corridors (8 Mega Corridors)</option>
                  <option value="dmic">Delhi-Mumbai Industrial Corridor (DMIC)</option>
                  <option value="bullet">Mumbai-Ahmedabad Bullet Train HSR</option>
                  <option value="dholera">Dholera SIR Expressway</option>
                  <option value="dfc">Dedicated Freight Corridor (Western DFC)</option>
                </select>
              </div>

              <div className="gis-modal-metrics-grid">
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">TOTAL DOCKETS</div>
                  <div className="gis-modal-metric-value">420 Parcels</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">PHYSICAL POSSESSION</div>
                  <div className="gis-modal-metric-value" style={{ color: '#16A878' }}>378 (90%)</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">LITIGATION IMPASSE</div>
                  <div className="gis-modal-metric-value" style={{ color: '#E85D68' }}>42 (10%)</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">ESCROW CLEARED</div>
                  <div className="gis-modal-metric-value" style={{ color: '#0FA89A' }}>₹3,840.5 Cr</div>
                </div>
              </div>

              <div className="table-wrap">
                <table className="data-table" style={{ fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th>CHAINAGE</th>
                      <th>VILLAGE &amp; TALUKA</th>
                      <th>SURVEY / GAT</th>
                      <th>AREA (HA)</th>
                      <th>PHASE</th>
                      <th>POSSESSION</th>
                      <th>COMPENSATION</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { ch: 'Km 188.200 - 190.500', v: 'Vagra, Bharuch', gat: 'GAT 412/A, 412/D', ha: 18.4, phase: 'Sec 20 Disputed', pos: 'Blocked (Stay)', comp: '₹34.2 Cr', stat: 'High Court Review' },
                      { ch: 'Km 194.000 - 198.800', v: 'Amod, Bharuch', gat: 'GAT 108 to 142', ha: 32.8, phase: 'Award Declared 3G', pos: '78% Transferred', comp: '₹14.8 Cr', stat: 'Tranche Cleared' },
                      { ch: 'Km 246.000 - 251.200', v: 'Padra, Vadodara', gat: 'GAT 78, 82, 89', ha: 24.1, phase: 'Utility Clearance', pos: 'Tower Shift', comp: '₹18.9 Cr', stat: 'GETCO Survey Done' },
                      { ch: 'Km 284.100 - 310.000', v: 'Anand Rural', gat: 'GAT 21-89', ha: 54.0, phase: 'Mutation Complete', pos: '100% Handover', comp: '₹88.5 Cr', stat: 'Civil Works Active' },
                      { ch: 'Km 84.000 - 88.800', v: 'Surat Peripheral', gat: 'GAT 304/B, 309', ha: 14.2, phase: 'Sec 19 Solatium', pos: 'Environmental Review', comp: '₹42.0 Cr', stat: 'Wetland Buffer NOC' },
                      { ch: 'Km 312.400 - 325.000', v: 'Nadiad Bypass', gat: 'GAT 12-68', ha: 41.5, phase: 'Section 11 Gazette', pos: '95% Possession', comp: '₹62.1 Cr', stat: 'Disbursement Active' },
                      { ch: 'Km 360.000 - 378.200', v: 'Sanand Industrial', gat: 'GAT 512-580', ha: 68.2, phase: 'Sec 24 Final Award', pos: '100% Handover', comp: '₹124.0 Cr', stat: 'Handed to L&T' }
                    ].filter(item => {
                      const q = docketsQuery.toLowerCase();
                      return !q || item.v.toLowerCase().includes(q) || item.gat.toLowerCase().includes(q) || item.ch.toLowerCase().includes(q);
                    }).map((row, idx) => (
                      <tr key={idx}>
                        <td className="mono" style={{ fontWeight: 600 }}>{row.ch}</td>
                        <td>{row.v}</td>
                        <td className="mono">{row.gat}</td>
                        <td className="mono">{row.ha} Ha</td>
                        <td><span className="tag">{row.phase}</span></td>
                        <td><strong style={{ color: row.pos.includes('100%') ? '#16A878' : row.pos.includes('Blocked') ? '#E85D68' : '#F2A51A' }}>{row.pos}</strong></td>
                        <td className="mono" style={{ fontWeight: 700 }}>{row.comp}</td>
                        <td><span style={{ fontSize: 11, color: '#0FA89A' }}>● {row.stat}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="gis-modal-footer">
              <span className="muted tiny">Showing live dockets synced with AnyRoR &amp; NHAI Bhumi Rashi.</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => triggerNotify('Complete 420-Docket CSV Export downloaded.')}>
                  <Download size={14} /> Export CSV
                </button>
                <button className="btn btn-primary" onClick={() => setActiveModal(null)}>
                  Close Registry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Resolve Injunction Modal */}
      {activeModal === 'resolve_injunction' && (
        <div className="gis-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="gis-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="gis-modal-header">
              <div>
                <div className="gis-modal-eyebrow">
                  <Scale size={13} />
                  <span>HIGH COURT WRIT PETITION DISPUTE RESOLUTION • BHARUCH</span>
                </div>
                <h2 className="gis-modal-title">Resolve Injunction: Bharuch Stretch (Km 188.200 - 190.500)</h2>
              </div>
              <button className="gis-modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="gis-modal-body">
              <div className="gis-modal-info-box">
                <strong>Case Record:</strong> Special Civil Application #SCA-11482/2025 in Gujarat High Court.<br />
                <strong>Dispute Cause:</strong> 14 agricultural co-owners of GAT 412/A &amp; 412/D demanding parity with urban industrial compensation multiplier under RFCTLARR Act Schedule I (demanding 2.0x instead of 1.25x rural rate).
              </div>

              <div className="gis-modal-metrics-grid">
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">CIVIL WORK DELAY</div>
                  <div className="gis-modal-metric-value" style={{ color: '#E85D68' }}>+45 Days Impact</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">LITIGATION EXPOSURE</div>
                  <div className="gis-modal-metric-value">₹34.20 Cr</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">HEARING AUTHORITY</div>
                  <div className="gis-modal-metric-value" style={{ color: '#0FA89A' }}>Sub-Divisional Magistrate</div>
                </div>
              </div>

              <div className="gis-modal-section-title">
                <CheckCircle2 size={15} color="#0FA89A" />
                <span>State Advocate General Recommended Settlement Packet</span>
              </div>

              <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
                <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13 }}>
                  <input type="checkbox" defaultChecked />
                  <span>Sanction 20% Solatium Advance under RFCTLARR Section 28 directly to verified SBI Escrow</span>
                </label>
                <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13 }}>
                  <input type="checkbox" defaultChecked />
                  <span>Allocate 500 sq.m commercial utility parcel per family in Dahej PCPIR Logistics Park</span>
                </label>
                <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13 }}>
                  <input type="checkbox" defaultChecked />
                  <span>Fast-track vacating of interim stay through Advocate General urgent bench listing</span>
                </label>
              </div>

              {injunctionStatus === 'resolved' ? (
                <div style={{ padding: 14, borderRadius: 8, background: '#E8F7F1', border: '1px solid #16A878', color: '#16A878', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={18} />
                  <span>Settlement packet approved and transmitted to Sub-Divisional Magistrate Bharuch. Stay removal listed for hearing!</span>
                </div>
              ) : null}
            </div>

            <div className="gis-modal-footer">
              <button className="btn btn-secondary" onClick={() => triggerNotify('Drafted Counter-Affidavit PDF downloaded.')}>
                <FileText size={14} /> Download Affidavit Draft
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                {injunctionStatus === 'pending' ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setInjunctionStatus('resolved');
                      triggerNotify('Injunction hearing packet dispatched to Bharuch Sub-Divisional Magistrate.');
                    }}
                  >
                    Submit &amp; Dispatch Settlement
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={() => setActiveModal(null)}>Done</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Release Tranche Modal */}
      {activeModal === 'release_tranche' && (
        <div className="gis-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="gis-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="gis-modal-header">
              <div>
                <div className="gis-modal-eyebrow">
                  <Banknote size={13} />
                  <span>DIRECT BENEFIT TRANSFER (DBT) • TREASURY CLEARANCE</span>
                </div>
                <h2 className="gis-modal-title">Authorize Compensation Tranche: Amod Section (₹14.80 Cr)</h2>
              </div>
              <button className="gis-modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="gis-modal-body">
              <div className="gis-modal-metrics-grid">
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">TRANCHE AMOUNT</div>
                  <div className="gis-modal-metric-value" style={{ color: '#16A878', fontSize: 20 }}>₹14.80 Crores</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">BENEFICIARY LANDOWNERS</div>
                  <div className="gis-modal-metric-value">184 Families Verified</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">PFMS / AADHAAR STATUS</div>
                  <div className="gis-modal-metric-value" style={{ color: '#0FA89A' }}>100% Seeded</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">ESCROW VAULT</div>
                  <div className="gis-modal-metric-value">SBI Gandhinagar</div>
                </div>
              </div>

              <div className="gis-modal-info-box">
                <strong>Statutory Basis:</strong> Award declared under Section 3G of National Highways Act / Section 23 RFCTLARR 2013 for Amod Taluka GAT 108 to 142. Dual digital authorization required under State Finance Rule 84.
              </div>

              <div className="gis-modal-section-title">
                <ShieldCheck size={15} color="#16A878" />
                <span>Statutory Clearances &amp; Dual Authorization</span>
              </div>

              <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10, background: '#F0F6F5', borderRadius: 6 }}>
                  <span>District Collector Bharuch (Dr. Sourabh Zaveri, IAS)</span>
                  <span className="tag" style={{ background: '#E8F7F1', color: '#16A878', borderColor: '#16A878' }}>✓ Digital Token Signed</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10, background: '#F0F6F5', borderRadius: 6 }}>
                  <span>State Revenue Secretary Dual-Signatory Authorizer</span>
                  <span className="tag" style={{ background: '#FEF5E7', color: '#D98A08', borderColor: '#D98A08' }}>
                    {trancheStatus === 'disbursed' ? '✓ Authorized' : 'Pending Confirmation'}
                  </span>
                </div>
              </div>

              {trancheStatus === 'disbursed' ? (
                <div style={{ padding: 14, borderRadius: 8, background: '#E8F7F1', border: '1px solid #16A878', color: '#16A878', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={18} />
                  <span>Tranche ₹14.80 Cr successfully released to Amod disbursement escrow! Bank remittance initiated.</span>
                </div>
              ) : null}
            </div>

            <div className="gis-modal-footer">
              <button className="btn btn-secondary" onClick={() => triggerNotify('PFMS Beneficiary batch file downloaded.')}>
                <FileSpreadsheet size={14} /> Download PFMS Batch
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                {trancheStatus === 'pending' ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setTrancheStatus('disbursed');
                      triggerNotify('Compensation Tranche ₹14.8 Cr cleared for Amod disbursement escrow.');
                    }}
                  >
                    Authorize Instant Escrow Release
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={() => setActiveModal(null)}>Close</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. View Joint Survey Modal */}
      {activeModal === 'joint_survey' && (
        <div className="gis-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="gis-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="gis-modal-header">
              <div>
                <div className="gis-modal-eyebrow">
                  <Compass size={13} />
                  <span>JOINT MEASUREMENT SURVEY (JMS) • UTILITY PROTOCOL</span>
                </div>
                <h2 className="gis-modal-title">Joint Measurement Survey: Padra GETCO 220kV Tower Shift</h2>
              </div>
              <button className="gis-modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="gis-modal-body">
              <div className="gis-modal-metrics-grid">
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">CHAINAGE STRETCH</div>
                  <div className="gis-modal-metric-value">Km 246.000 - 251.200</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">UTILITY ENCUMBRANCE</div>
                  <div className="gis-modal-metric-value">3 HT Tower Bases</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">DIVERSION CORRIDOR</div>
                  <div className="gis-modal-metric-value" style={{ color: '#0FA89A' }}>850m Lateral Shift</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">ESTIMATED SHIFT COST</div>
                  <div className="gis-modal-metric-value">₹4.20 Cr Deposit Work</div>
                </div>
              </div>

              <div className="gis-modal-info-box">
                <strong>Protocol Summary:</strong> Joint measurement conducted between GETCO Gujarat Transmission Corporation, NHAI Project Implementation Unit Vadodara, and Special Land Acquisition Officer. The 220kV towers #41, #42, #43 will be relocated to the peripheral service corridor within 18 working days.
              </div>

              <div className="gis-modal-section-title">
                <Users size={15} color="#0FA89A" />
                <span>Signatories &amp; Technical Sanction</span>
              </div>

              <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
                <div style={{ padding: 10, background: '#F0F6F5', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Executive Engineer, GETCO Vadodara Transmission Division</span>
                  <span style={{ color: '#16A878', fontWeight: 600 }}>✓ Feasibility Cleared</span>
                </div>
                <div style={{ padding: 10, background: '#F0F6F5', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Land Acquisition Officer, Vadodara (GAS)</span>
                  <span style={{ color: '#16A878', fontWeight: 600 }}>✓ RoW Mutation Demarcated</span>
                </div>
                <div style={{ padding: 10, background: '#F0F6F5', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Project Director, NHAI Expressways</span>
                  <span style={{ color: utilityStatus === 'approved' ? '#16A878' : '#F2A51A', fontWeight: 600 }}>
                    {utilityStatus === 'approved' ? '✓ Execution Approved' : 'Awaiting Sign-off'}
                  </span>
                </div>
              </div>

              {utilityStatus === 'approved' ? (
                <div style={{ padding: 14, borderRadius: 8, background: '#E8F7F1', border: '1px solid #16A878', color: '#16A878', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={18} />
                  <span>Utility Shifting Protocol approved! Tower relocation notice issued to GETCO contractors.</span>
                </div>
              ) : null}
            </div>

            <div className="gis-modal-footer">
              <button className="btn btn-secondary" onClick={() => triggerNotify('AutoCAD DGPS Survey Alignment DXF downloaded.')}>
                <Download size={14} /> Download CAD Drawing
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>Close</button>
                {utilityStatus === 'pending' ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setUtilityStatus('approved');
                      triggerNotify('Joint survey protocol open: Padra GETCO 220kV tower shifting.');
                    }}
                  >
                    Approve Utility Shifting Order
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={() => setActiveModal(null)}>Done</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Docket Bharuch Section */}
      {activeModal === 'docket_bharuch' && (
        <div className="gis-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="gis-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="gis-modal-header">
              <div>
                <div className="gis-modal-eyebrow">
                  <AlertTriangle size={13} color="#E85D68" />
                  <span>PRIORITY STRETCH DOCKET • DMIC EXPRESSWAY SEGMENT</span>
                </div>
                <h2 className="gis-modal-title">Bharuch Section Bottleneck Docket (Km 188 - 204)</h2>
              </div>
              <button className="gis-modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="gis-modal-body">
              <div className="gis-modal-metrics-grid">
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">BOTTLENECK LENGTH</div>
                  <div className="gis-modal-metric-value" style={{ color: '#E85D68' }}>16.4 km Bottleneck</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">DISPUTED PLOTS</div>
                  <div className="gis-modal-metric-value">342 Land Parcels</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">CONSTRUCTION IMPACT</div>
                  <div className="gis-modal-metric-value" style={{ color: '#E85D68' }}>+45 Days Civil Delay</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">FINANCIAL EXPOSURE</div>
                  <div className="gis-modal-metric-value">₹142.8 Cr Pending</div>
                </div>
              </div>

              <div className="gis-modal-info-box">
                <strong>Executive Assessment:</strong> Landowners in Vagra taluka demanding parity with Dahej urban industrial multiplier. Antigravity AI Geospatial recommendation: Deploy parallel bypass via <strong>GAT 419 / Govt Wasteland</strong> (18.2 Ha, 0 families affected, zero habitation friction, saves 160 days).
              </div>

              <div className="gis-modal-section-title">
                <Navigation size={15} color="#0FA89A" />
                <span>Field Resolution Actions</span>
              </div>

              <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
                <button
                  className="btn btn-soft"
                  style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '12px 16px' }}
                  onClick={() => {
                    setSelectedCallout('bharuch');
                    setHabitationFilter('zero_habitation');
                    setActiveModal(null);
                    triggerNotify('Applied High-Priority Zero-Habitation alternative corridor for Bharuch!');
                  }}
                >
                  <div>
                    <strong>★ Adopt High-Priority Zero-Habitation Alternative (GAT 419)</strong>
                    <div className="tiny muted">Bypasses all 342 disputed agricultural plots; saves ₹142.8 Cr and 160 days.</div>
                  </div>
                </button>
                <button
                  className="btn btn-soft"
                  style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '12px 16px' }}
                  onClick={() => triggerNotify('Summoned Sub-Divisional Magistrate for Lok Adalat Conciliation on 18 Jun.')}
                >
                  <div>
                    <strong>Summon Special Lok Adalat Mediation Session</strong>
                    <div className="tiny muted">Direct hearing under Sub-Divisional Magistrate Bharuch with farmer delegates.</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="gis-modal-footer">
              <span className="muted tiny">Docket Ref: DMIC-GUJ-PKG3-BHR-2025</span>
              <button className="btn btn-primary" onClick={() => setActiveModal(null)}>Close Docket</button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Legal Briefing Docket Surat */}
      {activeModal === 'docket_surat' && (
        <div className="gis-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="gis-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="gis-modal-header">
              <div>
                <div className="gis-modal-eyebrow">
                  <Landmark size={13} />
                  <span>HIGH COURT LEGAL BRIEFING • BULLET TRAIN HSR</span>
                </div>
                <h2 className="gis-modal-title">Legal Briefing Package: Surat Peripheral (Km 84 - 88.8)</h2>
              </div>
              <button className="gis-modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="gis-modal-body">
              <div className="gis-modal-metrics-grid">
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">ENCUMBERED REACH</div>
                  <div className="gis-modal-metric-value" style={{ color: '#F2A51A' }}>4.8 km Encumbered</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">HEARING BENCH</div>
                  <div className="gis-modal-metric-value">18 Jun (Bench 2, HC)</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">CONTRACTOR IMPACT</div>
                  <div className="gis-modal-metric-value" style={{ color: '#E85D68' }}>+60 Days Scheduled</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">REPRESENTING OFFICE</div>
                  <div className="gis-modal-metric-value">Advocate General</div>
                </div>
              </div>

              <div className="gis-modal-info-box">
                <strong>Legal Summary:</strong> Environmental public-interest petition regarding viaduct pier proximity to Olpad wetland buffer zone. Gujarat Ecology Commission (GEC) environmental impact report confirms 100m acoustic bio-shield is compliant with Wildlife Protection Act Section 35.
              </div>

              <div className="gis-modal-section-title">
                <Check size={15} color="#0FA89A" />
                <span>Advocate General Briefing Components</span>
              </div>

              <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
                <div style={{ padding: 10, background: '#F0F6F5', borderRadius: 6 }}>
                  1. GEC Certified Geo-Spatial Wetland Distance Map (1:1000 Precision)
                </div>
                <div style={{ padding: 10, background: '#F0F6F5', borderRadius: 6 }}>
                  2. National Green Tribunal (NGT) Principal Bench Precedent (Writ Petition #402/2023)
                </div>
                <div style={{ padding: 10, background: '#F0F6F5', borderRadius: 6 }}>
                  3. Supplementary Counter-Affidavit signed by Joint Secretary (Transport &amp; Infrastructure)
                </div>
              </div>
            </div>

            <div className="gis-modal-footer">
              <button className="btn btn-secondary" onClick={() => triggerNotify('Court dossier PDF (84 pages) downloaded.')}>
                <Download size={14} /> Download Court Dossier
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setActiveModal(null);
                    triggerNotify('Dispatching legal briefing package to Advocate General Office for 18 Jun High Court bench.');
                  }}
                >
                  Dispatch to Advocate General
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Collector Meeting Docket Dholera */}
      {activeModal === 'docket_dholera' && (
        <div className="gis-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="gis-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="gis-modal-header">
              <div>
                <div className="gis-modal-eyebrow">
                  <Trees size={13} color="#16A878" />
                  <span>FOREST NOC &amp; COLLECTOR SANCTION • DHOLERA SPINE</span>
                </div>
                <h2 className="gis-modal-title">Collector Sanction: Package 3 (Bhimnath Interlink)</h2>
              </div>
              <button className="gis-modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="gis-modal-body">
              <div className="gis-modal-metrics-grid">
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">TOTAL ACQUIRED</div>
                  <div className="gis-modal-metric-value" style={{ color: '#16A878' }}>92% Acquired</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">AWAITING NOC</div>
                  <div className="gis-modal-metric-value" style={{ color: '#F2A51A' }}>3.2 km Scrub Jungle</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">COMPENSATORY LAND</div>
                  <div className="gis-modal-metric-value">6.4 Ha in Amreli</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">SANCTION AUTHORITY</div>
                  <div className="gis-modal-metric-value">District Collector Ahmedabad</div>
                </div>
              </div>

              <div className="gis-modal-info-box">
                <strong>Review Scope:</strong> Fast-track clearance of the final 3.2 km spur connecting Bhimnath Junction to Dholera SIR Central Expressway. Compensatory afforestation non-forest revenue parcel allocated in Dhari, Amreli.
              </div>

              <div className="gis-modal-section-title">
                <Calendar size={15} color="#0FA89A" />
                <span>Scheduled Coordination Meeting</span>
              </div>

              <div style={{ padding: 14, background: '#F0F6F5', borderRadius: 8, marginBottom: 16 }}>
                <strong>Collectorate VC Agenda (14 June 2025 • 11:00 AM IST):</strong>
                <ul style={{ margin: '8px 0 0 16px', fontSize: 13, lineHeight: 1.6 }}>
                  <li>Mutual sign-off between Amreli &amp; Ahmedabad District Collectors on mutation ledger.</li>
                  <li>MoEFCC Parivesh portal stage-II digital certificate release.</li>
                  <li>Handover order to Gujarat State Road Development Corporation (GSRDC).</li>
                </ul>
              </div>
            </div>

            <div className="gis-modal-footer">
              <span className="muted tiny">Parivesh Portal Ref: FP/GJ/ROAD/9402/2024</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>Close</button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setActiveModal(null);
                    triggerNotify('Scheduled expedited review with Amreli & Ahmedabad District Collectors for Forest NOC.');
                  }}
                >
                  Confirm VC Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. RTK DGPS Geospatial Calibration Modal */}
      {activeModal === 'dgps_calibration' && (
        <div className="gis-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="gis-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="gis-modal-header">
              <div>
                <div className="gis-modal-eyebrow">
                  <Radio size={13} color="#0FA89A" />
                  <span>GEODETIC TELEMETRY • SURVEY OF INDIA &amp; BHOOMISETU</span>
                </div>
                <h2 className="gis-modal-title">RTK DGPS Geospatial Calibration Station: Gandhinagar Node</h2>
              </div>
              <button className="gis-modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="gis-modal-body">
              <div className="gis-modal-metrics-grid">
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">FIX ACCURACY</div>
                  <div className="gis-modal-metric-value" style={{ color: '#16A878' }}>±2.1 cm RTK Fixed</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">ACTIVE SATELLITES</div>
                  <div className="gis-modal-metric-value" style={{ color: '#0FA89A' }}>36 Tracked (12 NavIC)</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">CORRECTION LATENCY</div>
                  <div className="gis-modal-metric-value">0.18 sec (4G/NTRIP)</div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">CONNECTED ROVERS</div>
                  <div className="gis-modal-metric-value">42 Field Survey Teams</div>
                </div>
              </div>

              <div className="gis-modal-info-box">
                <strong>Base Station Benchmark:</strong> Gandhinagar Central Node #GJ-DGPS-01 (Lat: 23.21563° N, Lon: 72.63694° E, Ellipsoidal Height: 84.12m). Provides continuous differential correction stream over RTCM 3.2 protocol to all corridor surveyors.
              </div>

              <div className="gis-modal-section-title">
                <Satellite size={15} color="#0FA89A" />
                <span>Constellation Health &amp; Signal-to-Noise Ratio (SNR)</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                <div style={{ padding: 10, background: '#F0F6F5', borderRadius: 6, textAlign: 'center' }}>
                  <div className="tiny muted">NavIC (India)</div>
                  <strong style={{ color: '#16A878' }}>12 Sats • 48 dB-Hz</strong>
                </div>
                <div style={{ padding: 10, background: '#F0F6F5', borderRadius: 6, textAlign: 'center' }}>
                  <div className="tiny muted">GPS (USA)</div>
                  <strong style={{ color: '#16A878' }}>16 Sats • 46 dB-Hz</strong>
                </div>
                <div style={{ padding: 10, background: '#F0F6F5', borderRadius: 6, textAlign: 'center' }}>
                  <div className="tiny muted">GLONASS (Russia)</div>
                  <strong style={{ color: '#16A878' }}>8 Sats • 44 dB-Hz</strong>
                </div>
              </div>
            </div>

            <div className="gis-modal-footer">
              <button className="btn btn-secondary" onClick={() => triggerNotify('RINEX 3.04 Ephemeris observation files downloaded.')}>
                <Download size={14} /> Download RINEX Log
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>Close</button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setActiveModal(null);
                    triggerNotify('RTK DGPS Base Station: Gandhinagar Node recalibrated at ±2cm accuracy.');
                  }}
                >
                  Recalibrate Active Rovers
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. RoW Handover Milestone Verification Modal */}
      {activeMilestone && (
        <div className="gis-modal-overlay" onClick={() => setActiveMilestone(null)}>
          <div className="gis-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="gis-modal-header">
              <div>
                <div className="gis-modal-eyebrow">
                  <Calendar size={13} color="#0FA89A" />
                  <span>CABINET INFRASTRUCTURE TARGET VERIFICATION</span>
                </div>
                <h2 className="gis-modal-title">
                  {activeMilestone === 'dfc_sanand' && 'Milestone: DFC Sanand Logistics Interconnect (24 Jun 2025)'}
                  {activeMilestone === 'vadodara_ring' && 'Milestone: Vadodara Urban Ring Connector (15 Jul 2025)'}
                  {activeMilestone === 'dmic_cabinet' && 'Cabinet Target: 100% RoW Handover - DMIC Reach (30 Aug 2025)'}
                </h2>
              </div>
              <button className="gis-modal-close-btn" onClick={() => setActiveMilestone(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="gis-modal-body">
              <div className="gis-modal-info-box">
                {activeMilestone === 'dfc_sanand' && (
                  <>
                    <strong>Status: STAGE 3B Clean Corridor Verification.</strong><br />
                    28.4 km clean corridor possession certificate prepared for L&amp;T Infrastructure. 0 encumbrances remaining. Mutation entry verified in AnyRoR.
                  </>
                )}
                {activeMilestone === 'vadodara_ring' && (
                  <>
                    <strong>Status: STAGE 3A Arbitration Protocol.</strong><br />
                    Final compensation arbitration session scheduled with 84 landholders in Padra taluka. 92% of awards disbursed through PFMS escrow.
                  </>
                )}
                {activeMilestone === 'dmic_cabinet' && (
                  <>
                    <strong>Status: CABINET INFRASTRUCTURE BENCHMARK.</strong><br />
                    Cabinet committee on infrastructure mandate: Achieve 100% undisputed right-of-way handover for the entire 560 km DMIC Gujarat sector by 30 August 2025.
                  </>
                )}
              </div>

              <div className="gis-modal-metrics-grid">
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">CURRENT READINESS</div>
                  <div className="gis-modal-metric-value" style={{ color: '#16A878' }}>
                    {activeMilestone === 'dfc_sanand' ? '98.5% Ready' : activeMilestone === 'vadodara_ring' ? '91.2% Ready' : '88.4% Sector Reach'}
                  </div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">DAYS TO DEADLINE</div>
                  <div className="gis-modal-metric-value" style={{ color: '#0FA89A' }}>
                    {activeMilestone === 'dfc_sanand' ? '12 Days' : activeMilestone === 'vadodara_ring' ? '32 Days' : '78 Days'}
                  </div>
                </div>
                <div className="gis-modal-metric-card">
                  <div className="gis-modal-metric-label">AUDIT VERIFICATION</div>
                  <div className="gis-modal-metric-value">CAG Certified</div>
                </div>
              </div>
            </div>

            <div className="gis-modal-footer">
              <button className="btn btn-secondary" onClick={() => triggerNotify('Milestone verification slip downloaded.')}>
                <Download size={14} /> Download Milestone Slip
              </button>
              <button className="btn btn-primary" onClick={() => setActiveMilestone(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
