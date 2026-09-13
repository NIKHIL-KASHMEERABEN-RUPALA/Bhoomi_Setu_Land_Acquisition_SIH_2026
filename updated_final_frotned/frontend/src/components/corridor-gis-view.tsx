import React, { useState } from 'react';
import {
  Download, Sliders, Layers, Trees, Zap, Flame, MapPin, AlertTriangle,
  ArrowLeftRight, CheckCircle2, ChevronDown, Clock3, FileText, Check,
  ExternalLink, Calendar, ShieldAlert, Radio, Compass, Plane, Satellite,
  Scale, Landmark, FileSpreadsheet, Sparkles, Eye, X, CheckSquare,
  FolderOpen, AlertCircle
} from 'lucide-react';

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
  });

  // Selected waypoint or callout on map
  const [selectedCallout, setSelectedCallout] = useState<'vadodara' | 'bharuch' | null>(null);

  // Layer modal / Drawer state
  const [showLayerControls, setShowLayerControls] = useState(false);

  // Action feedback handler
  const triggerNotify = (msg: string) => {
    if (onNotify) {
      onNotify(msg);
    }
  };

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
            onClick={() => triggerNotify('RTK DGPS Base Station: Gandhinagar Node calibrated at ±2cm accuracy.')}
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
              </div>

              <div className="gis-coords-badge">
                <MapPin size={12} />
                <span>21°42'34.2"N 72°59'48.8"E | EPSG 4326</span>
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
              </svg>

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
                onClick={() => triggerNotify('Loaded all 420 Chainage Registry Dockets.')}
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
                        onClick={() => triggerNotify('Injunction hearing packet dispatched to Bharuch Sub-Divisional Magistrate.')}
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
                        onClick={() => triggerNotify('Compensation Tranche ₹14.8 Cr cleared for Amod disbursement escrow.')}
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
                        onClick={() => triggerNotify('Joint survey protocol open: Padra GETCO 220kV tower shifting.')}
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
                  onClick={() => triggerNotify('Opened Joint Survey Docket: Bharuch Section (Km 188-204)')}
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
                  onClick={() => triggerNotify('Dispatching legal briefing package to Advocate General Office for 18 Jun High Court bench.')}
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
                  onClick={() => triggerNotify('Scheduled expedited review with Amreli & Ahmedabad District Collectors for Forest NOC.')}
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
              <div className="gis-timeline-item">
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
              <div className="gis-timeline-item">
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
              <div className="gis-timeline-item">
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
    </div>
  );
}
