import React, { useState } from 'react';
import {
  Satellite, RefreshCw, Sparkles, Bell, Shield, Globe2, Radio, Network,
  MessageSquare, Clock, AlertTriangle, AlertCircle, ArrowUpRight, Check,
  ExternalLink, ChevronDown, CheckCircle2, Sliders, Database, Cpu, Layers,
  Server, FileText, Scale, Landmark, Eye, Filter, LockKeyhole
} from 'lucide-react';

interface IntelligenceModulesViewProps {
  onNotify?: (msg: string) => void;
}

export function IntelligenceModulesView({ onNotify }: IntelligenceModulesViewProps) {
  const [rescanLoading, setRescanLoading] = useState(false);
  const [feedFilter, setFeedFilter] = useState('live');

  const triggerNotify = (msg: string) => {
    if (onNotify) {
      onNotify(msg);
    }
  };

  const handleSatelliteRescan = () => {
    setRescanLoading(true);
    triggerNotify('Initiating Cartosat-3 & Sentinel-2 dual-band differential telemetry pass...');
    setTimeout(() => {
      setRescanLoading(false);
      triggerNotify('Satellite Re-scan complete: 3,840 km swath re-indexed with 0 new anomalies.');
    }, 2000);
  };

  return (
    <div className="intel-page">
      {/* 1. Header Row */}
      <div className="intel-header-row">
        <div>
          <div className="intel-eyebrow">
            <span className="intel-eyebrow-text">AI &amp; GEOSPATIAL INTELLIGENCE SUITE</span>
            <span className="intel-sep">/</span>
            <span className="intel-eyebrow-sub">DECISION ENGINE v4.2</span>
            <span className="intel-status-badge">
              <span className="intel-status-dot" />
              4 Engines Active • 99.4% Uptime
            </span>
          </div>
          <h1 className="intel-page-title">
            Algorithmic Risk &amp; Cadastral Inferences
          </h1>
          <p className="intel-page-desc">
            Predictive detection across synthetic aperture radar telemetry, cadastral mutation velocity, legal statutory lapses, and grassroots public sentiment.
          </p>
        </div>

        <div className="intel-header-actions">
          <div className="intel-orbit-card">
            <Satellite size={14} className="intel-orbit-icon" />
            <span>Pass: Cartosat-3 Orbit 24,119</span>
          </div>

          <button
            className="intel-rescan-btn"
            onClick={handleSatelliteRescan}
            disabled={rescanLoading}
          >
            <RefreshCw size={13} className={rescanLoading ? 'spin-anim' : ''} />
            <span>{rescanLoading ? 'Scanning Swath...' : 'Trigger Full Satellite Re-scan'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 KPI Metrics */}
      <div className="intel-kpi-grid">
        {/* KPI 1 */}
        <div className="surface intel-kpi-card">
          <div className="intel-kpi-header">
            <span className="intel-kpi-label">CADASTRAL INFERENCES (24H)</span>
            <div className="intel-kpi-icon-wrap intel-icon-blue">
              <Sparkles size={14} />
            </div>
          </div>
          <div className="intel-kpi-metric-row">
            <span className="intel-kpi-value">142,890</span>
            <span className="intel-kpi-badge-green">+18.4%</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="surface intel-kpi-card">
          <div className="intel-kpi-header">
            <span className="intel-kpi-label">HIGH-CONFIDENCE FLAGS</span>
            <div className="intel-kpi-icon-wrap intel-icon-red">
              <Bell size={14} />
            </div>
          </div>
          <div className="intel-kpi-metric-row">
            <span className="intel-kpi-value">19</span>
            <span className="intel-kpi-badge-red">4 Critical</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="surface intel-kpi-card">
          <div className="intel-kpi-header">
            <span className="intel-kpi-label">SAR CORRIDOR COVERAGE</span>
            <div className="intel-kpi-icon-wrap intel-icon-cyan">
              <Globe2 size={14} />
            </div>
          </div>
          <div className="intel-kpi-metric-row">
            <span className="intel-kpi-value">3,840 km</span>
            <span className="intel-kpi-note-muted">99.8% swath</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="surface intel-kpi-card">
          <div className="intel-kpi-header">
            <span className="intel-kpi-label">RFCTLARR LAPSE RISK SAVED</span>
            <div className="intel-kpi-icon-wrap intel-icon-green">
              <Shield size={14} />
            </div>
          </div>
          <div className="intel-kpi-metric-row">
            <span className="intel-kpi-value">₹312.4 Cr</span>
            <span className="intel-kpi-badge-green">11 Dockets</span>
          </div>
        </div>
      </div>

      {/* 3. Core Autonomous Diagnostic Engines */}
      <div className="surface intel-engines-section">
        <div className="intel-engines-header">
          <div className="intel-engines-title-wrap">
            <div className="intel-asterisk-icon">✱</div>
            <h2 className="intel-engines-title">Core Autonomous Diagnostic Engines</h2>
          </div>
          <div className="intel-federated-node mono">
            Federated Node: Western Geo-Processing Center (ISRO-Bhuvan v3)
          </div>
        </div>

        <div className="intel-engines-grid">
          {/* Engine 1 */}
          <div className="intel-engine-card">
            <div className="intel-engine-top">
              <div className="intel-engine-icon-box">
                <Satellite size={16} />
              </div>
              <span className="intel-engine-pill pill-green">98.2% Accuracy</span>
            </div>
            <div className="intel-module-code">MODULE 01 • REMOTE SENSING</div>
            <h3 className="intel-engine-name">Satellite Optical &amp; SAR Change Detection</h3>
            <p className="intel-engine-desc">
              Sentinel-2 MSI and Cartosat-3 dual-band feeds alert on unauthorized physical encroachment, structural...
            </p>

            <div className="intel-engine-spec-grid">
              <div>
                <span className="intel-spec-key">Scan Frequency</span>
                <span className="intel-spec-val">Every 72h Sync</span>
              </div>
              <div>
                <span className="intel-spec-key">Spectral Footprint</span>
                <span className="intel-spec-val">0.4m Sub-pixel SAR</span>
              </div>
            </div>

            <div className="intel-engine-footer">
              <span className="intel-alert-label">Active Alerts</span>
              <span className="intel-alert-status status-green">7 Corridors Flagged</span>
            </div>
          </div>

          {/* Engine 2 */}
          <div className="intel-engine-card">
            <div className="intel-engine-top">
              <div className="intel-engine-icon-box">
                <Network size={16} />
              </div>
              <span className="intel-engine-pill pill-green">99.1% Confidence</span>
            </div>
            <div className="intel-module-code">MODULE 02 • FORENSIC CADASTRE</div>
            <h3 className="intel-engine-name">Cadastral ML &amp; Benami Transfer Detection</h3>
            <p className="intel-engine-desc">
              Algorithmic ingestion of AnyRoR mutation registries detects artificial parcel splits, speculative land...
            </p>

            <div className="intel-engine-spec-grid">
              <div>
                <span className="intel-spec-key">RoR Parser Velocity</span>
                <span className="intel-spec-val mono">12,000 tx/sec</span>
              </div>
              <div>
                <span className="intel-spec-key">Syndicate Pattern Rec</span>
                <span className="intel-spec-val">Graph Neural Net v2</span>
              </div>
            </div>

            <div className="intel-engine-footer">
              <span className="intel-alert-label">Active Alerts</span>
              <span className="intel-alert-status status-red">2 Clusters Under Review</span>
            </div>
          </div>

          {/* Engine 3 */}
          <div className="intel-engine-card">
            <div className="intel-engine-top">
              <div className="intel-engine-icon-box">
                <MessageSquare size={16} />
              </div>
              <span className="intel-engine-pill pill-blue">88.7% F1-Score</span>
            </div>
            <div className="intel-module-code">MODULE 03 • PUBLIC DYNAMICS</div>
            <h3 className="intel-engine-name">Grievance NLP &amp; Grassroots Sentiment</h3>
            <p className="intel-engine-desc">
              Processes local vernacular petitions, regional press reports, and Gram Sabha meeting transcripts to predict...
            </p>

            <div className="intel-engine-spec-grid">
              <div>
                <span className="intel-spec-key">Dialect Support</span>
                <span className="intel-spec-val">Gujarati, Hindi, English</span>
              </div>
              <div>
                <span className="intel-spec-key">Corpus Ingested</span>
                <span className="intel-spec-val">48,200 dockets/mo</span>
              </div>
            </div>

            <div className="intel-engine-footer">
              <span className="intel-alert-label">Risk Status</span>
              <span className="intel-alert-status status-amber">Elevated in Vadodara</span>
            </div>
          </div>

          {/* Engine 4 */}
          <div className="intel-engine-card">
            <div className="intel-engine-top">
              <div className="intel-engine-icon-box">
                <Clock size={16} />
              </div>
              <span className="intel-engine-pill pill-green">99.8% Deterministic</span>
            </div>
            <div className="intel-module-code">MODULE 04 • STATUTORY RISK</div>
            <h3 className="intel-engine-name">Statutory Timeline Lapse Forecaster</h3>
            <p className="intel-engine-desc">
              Automated legal risk calculation under RFCTLARR Act 2013 Section 19 (Declaration) and Section 25 (Award)...
            </p>

            <div className="intel-engine-spec-grid">
              <div>
                <span className="intel-spec-key">Statute Guard</span>
                <span className="intel-spec-val">RFCTLARR 2013</span>
              </div>
              <div>
                <span className="intel-spec-key">Early Warning Horizon</span>
                <span className="intel-spec-val">T-90 to T-15 Days</span>
              </div>
            </div>

            <div className="intel-engine-footer">
              <span className="intel-alert-label">Near Expiry (T-30)</span>
              <span className="intel-alert-status status-red">3 Project Dockets</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main 2-Column Grid */}
      <div className="intel-main-layout">
        {/* Left Column: High-Confidence Algorithmic Inferences */}
        <div className="intel-left-col">
          <div className="surface intel-inferences-card">
            <div className="intel-inferences-header">
              <div>
                <div className="intel-inf-title-row">
                  <span className="intel-pink-dot" />
                  <h2 className="intel-inferences-title">High-Confidence Algorithmic Inferences</h2>
                </div>
                <div className="intel-inferences-subtitle">
                  Real-time signals requiring administrative intervention
                </div>
              </div>

              <div className="intel-feed-filter-wrap">
                <select
                  value={feedFilter}
                  onChange={(e) => {
                    setFeedFilter(e.target.value);
                    triggerNotify(`Filter switched to: ${e.target.options[e.target.selectedIndex].text}`);
                  }}
                  className="intel-feed-select"
                >
                  <option value="live">Live Sentinel Feed</option>
                  <option value="critical">Critical Anomaly Only</option>
                  <option value="pending">Awaiting Joint Review</option>
                </select>
                <Filter size={12} className="intel-feed-icon" />
              </div>
            </div>

            <div className="intel-inference-items">
              {/* Inference 1: Physical Encroachment */}
              <div className="intel-inference-item">
                <div className="intel-thumb-wrap">
                  {/* Stylized SAR Aerial Preview */}
                  <div className="intel-sar-thumb">
                    <svg viewBox="0 0 100 80" className="thumb-svg">
                      <rect width="100" height="80" fill="#334155" />
                      <path d="M 0 50 Q 50 30 100 20" stroke="#0FA89A" strokeWidth="6" fill="none" opacity="0.6" />
                      <rect x="42" y="30" width="22" height="18" fill="#E85D68" stroke="#FFFFFF" strokeWidth="1.5" />
                      <line x1="0" y1="0" x2="100" y2="80" stroke="#64748B" strokeWidth="0.5" strokeDasharray="3,3" />
                    </svg>
                    <span className="intel-thumb-badge">SAR Diff: +640m²</span>
                  </div>
                </div>

                <div className="intel-inference-content">
                  <div className="intel-item-topline">
                    <div className="intel-item-tags">
                      <span className="intel-tag-encroachment">PHYSICAL ENCROACHMENT</span>
                      <span className="intel-tag-survey">Survey No. 412/A • Bharuch</span>
                    </div>
                    <div className="intel-item-conf">
                      <span className="intel-conf-pill">94.0% Confidence</span>
                      <span className="intel-time-tag">08:14 IST Today</span>
                    </div>
                  </div>

                  <h3 className="intel-inference-heading">
                    Bharuch Expressway Bypass Alignment Intrusion
                  </h3>
                  <p className="intel-inference-body">
                    Differential Interferometry detected fresh reinforced concrete plinth construction directly intersecting the notified 60-meter right-of-way buffer.
                  </p>

                  <div className="intel-coords-row mono">
                    Coords: 21.7104° N, 73.0026° E
                  </div>

                  <div className="intel-item-actions">
                    <button
                      className="btn-intel-outline"
                      onClick={() => triggerNotify('Overlaying 0.4m Cartosat-3 SAR interferometer raster for Bharuch Bypass.')}
                    >
                      Inspect SAR Layer
                    </button>
                    <button
                      className="btn-intel-solid-dark"
                      onClick={() => triggerNotify('Generated official Section 68 Removal Notice dispatched to Bharuch Municipal Collectorate.')}
                    >
                      Issue Demolition Notice
                    </button>
                  </div>
                </div>
              </div>

              {/* Inference 2: Benami Speculation */}
              <div className="intel-inference-item">
                <div className="intel-thumb-wrap">
                  {/* Stylized Network Graph Thumbnail */}
                  <div className="intel-graph-thumb">
                    <svg viewBox="0 0 100 80" className="thumb-svg">
                      <rect width="100" height="80" fill="#1E293B" />
                      {/* Node clusters */}
                      <line x1="50" y1="40" x2="25" y2="25" stroke="#F2A51A" strokeWidth="1.5" />
                      <line x1="50" y1="40" x2="75" y2="25" stroke="#F2A51A" strokeWidth="1.5" />
                      <line x1="50" y1="40" x2="30" y2="60" stroke="#F2A51A" strokeWidth="1.5" />
                      <line x1="50" y1="40" x2="70" y2="60" stroke="#F2A51A" strokeWidth="1.5" />
                      <circle cx="50" cy="40" r="7" fill="#F2A51A" />
                      <circle cx="25" cy="25" r="4" fill="#0FA89A" />
                      <circle cx="75" cy="25" r="4" fill="#0FA89A" />
                      <circle cx="30" cy="60" r="4" fill="#0FA89A" />
                      <circle cx="70" cy="60" r="4" fill="#0FA89A" />
                    </svg>
                    <span className="intel-thumb-badge">Velocity: 4.8 tx/day</span>
                  </div>
                </div>

                <div className="intel-inference-content">
                  <div className="intel-item-topline">
                    <div className="intel-item-tags">
                      <span className="intel-tag-benami">BENAMI SPECULATION</span>
                      <span className="intel-tag-survey">Dholera SIR Fringe Sector 8</span>
                    </div>
                    <div className="intel-item-conf">
                      <span className="intel-conf-pill">98.4% Confidence</span>
                      <span className="intel-time-tag">Yesterday • 16:30 IST</span>
                    </div>
                  </div>

                  <h3 className="intel-inference-heading">
                    Abnormal Power of Attorney Clustering
                  </h3>
                  <p className="intel-inference-body">
                    Cadastral ML detected 14 consecutive parcel transfers within 72 hours executed under an identical General Power of Attorney, 11 days prior to anticipated Sec 4 Gazette release.
                  </p>

                  <div className="intel-metric-row">
                    <strong>Est. Speculative Exposure: ₹14.8 Cr</strong>
                  </div>

                  <div className="intel-item-actions">
                    <button
                      className="btn-intel-outline"
                      onClick={() => triggerNotify('Loaded AnyRoR syndication entity graph: GPoA holder #GJ-SR-8841.')}
                    >
                      View AnyRoR Graph
                    </button>
                    <button
                      className="btn-intel-solid-dark"
                      onClick={() => triggerNotify('Sub-Registrar digital verification token frozen for Dholera Sector 8.')}
                    >
                      Freeze Sub-Registrar Token
                    </button>
                  </div>
                </div>
              </div>

              {/* Inference 3: Sentiment Escalation */}
              <div className="intel-inference-item">
                <div className="intel-thumb-wrap">
                  {/* Stylized NLP Sentiment Thumbnail */}
                  <div className="intel-nlp-thumb">
                    <svg viewBox="0 0 100 80" className="thumb-svg">
                      <rect width="100" height="80" fill="#134E4A" />
                      <path d="M 10 50 Q 25 20 40 55 T 70 30 T 95 45" fill="none" stroke="#2DD4BF" strokeWidth="2.5" />
                      <circle cx="70" cy="30" r="5" fill="#F2A51A" />
                    </svg>
                    <span className="intel-thumb-badge">NLP Alert: 78/100</span>
                  </div>
                </div>

                <div className="intel-inference-content">
                  <div className="intel-item-topline">
                    <div className="intel-item-tags">
                      <span className="intel-tag-sentiment">SENTIMENT ESCALATION</span>
                      <span className="intel-tag-survey">Vadodara Rural • 3 Villages</span>
                    </div>
                    <div className="intel-item-conf">
                      <span className="intel-conf-pill">91.2% Confidence</span>
                      <span className="intel-time-tag">11 Jun 2025 • 19:10 IST</span>
                    </div>
                  </div>

                  <h3 className="intel-inference-heading">
                    Multi-Village Gram Sabha Resistance Index
                  </h3>
                  <p className="intel-inference-body">
                    Lexical scoring across 18 grievance submissions and regional vernacular print flagged terms matching planned dharna (sit-in) over tree compensation valuations.
                  </p>

                  <div className="intel-metric-row">
                    <span className="intel-vector-lbl">Risk Vector: Schedule II Resettlement Discrepancy</span>
                  </div>

                  <div className="intel-item-actions">
                    <button
                      className="btn-intel-outline"
                      onClick={() => triggerNotify('Opening 18 transcribed vernacular petitions for Vadodara Rural.')}
                    >
                      View Verbatim Petitions
                    </button>
                    <button
                      className="btn-intel-solid-teal"
                      onClick={() => triggerNotify('Order issued: Lok Adalat Officer dispatched for proactive hearing.')}
                    >
                      Dispatch Lok Adalat Officer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Model Metrics & Interoperability */}
        <div className="intel-right-col">
          {/* Card 1: Model Metrics & Topology */}
          <div className="surface intel-topology-card">
            <div className="intel-topo-header">
              <div>
                <div className="intel-topo-eyebrow">NEURAL ARCHITECTURE</div>
                <h3 className="intel-topo-title">Model Metrics &amp; Topology</h3>
              </div>
              <span className="intel-topo-badge">Active: ResNet-UNet+</span>
            </div>

            {/* Precision Bars */}
            <div className="intel-bars-group">
              <div className="intel-bar-item">
                <div className="intel-bar-top">
                  <span className="intel-bar-label">Cadastral Boundary Extraction Precision</span>
                  <span className="intel-bar-val mono">96.7%</span>
                </div>
                <div className="intel-bar-track">
                  <div className="intel-bar-fill fill-teal" style={{ width: '96.7%' }} />
                </div>
              </div>

              <div className="intel-bar-item">
                <div className="intel-bar-top">
                  <span className="intel-bar-label">Boundary Recall Rate (Survey Stones vs Orthophoto)</span>
                  <span className="intel-bar-val mono">94.3%</span>
                </div>
                <div className="intel-bar-track">
                  <div className="intel-bar-fill fill-teal" style={{ width: '94.3%' }} />
                </div>
              </div>

              <div className="intel-bar-item">
                <div className="intel-bar-top">
                  <span className="intel-bar-label">RFCTLARR Statutory Prediction Precision</span>
                  <span className="intel-bar-val mono">98.9%</span>
                </div>
                <div className="intel-bar-track">
                  <div className="intel-bar-fill fill-teal" style={{ width: '98.9%' }} />
                </div>
              </div>
            </div>

            {/* Ingestion Depth */}
            <div className="intel-corpus-section">
              <div className="intel-corpus-heading">TRAINING CORPUS &amp; INGESTION DEPTH</div>
              <div className="intel-corpus-grid">
                <div className="intel-corpus-box">
                  <span className="intel-corpus-lbl">DIGITIZED RECORDS</span>
                  <strong className="intel-corpus-val">4.2M Parcels</strong>
                  <span className="intel-corpus-sub">AnyRoR Gujarat State Database</span>
                </div>
                <div className="intel-corpus-box">
                  <span className="intel-corpus-lbl">ORTHOPHOTO TILING</span>
                  <strong className="intel-corpus-val">18,400 km²</strong>
                  <span className="intel-corpus-sub">Survey of India SVAMITVA Drones</span>
                </div>
              </div>

              <div className="intel-meta-table">
                <div className="intel-meta-row">
                  <span className="intel-meta-k">Inference Latency (GPU Batch)</span>
                  <span className="intel-meta-v mono">42 ms/km²</span>
                </div>
                <div className="intel-meta-row">
                  <span className="intel-meta-k">Model Checkpoint</span>
                  <span className="intel-meta-v mono">epoch-840-loss-0.0124.pt</span>
                </div>
                <div className="intel-meta-row">
                  <span className="intel-meta-k">Last Retrained</span>
                  <span className="intel-meta-v">09 Jun 2025 • Western Grid Cluster</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Interoperability & API Links */}
          <div className="surface intel-api-card">
            <div className="intel-api-header">
              <h3 className="intel-api-title">Interoperability &amp; API Links</h3>
              <span className="intel-api-status-label">Live Protocol Status</span>
            </div>

            <div className="intel-api-list">
              {/* API 1 */}
              <div className="intel-api-item">
                <div className="intel-api-icon-wrap icon-isro">
                  <Globe2 size={16} />
                </div>
                <div className="intel-api-info">
                  <strong className="intel-api-name">ISRO Bhuvan Geo-Server</strong>
                  <span className="intel-api-desc">WMS / WFS Satellite Tile Stream</span>
                </div>
                <span className="intel-api-speed">
                  <span className="api-dot dot-green" />
                  24ms
                </span>
              </div>

              {/* API 2 */}
              <div className="intel-api-item">
                <div className="intel-api-icon-wrap icon-ror">
                  <Database size={16} />
                </div>
                <div className="intel-api-info">
                  <strong className="intel-api-name">Gujarat Revenue AnyRoR API</strong>
                  <span className="intel-api-desc">Realtime Mutation &amp; Title Verification</span>
                </div>
                <span className="intel-api-speed">
                  <span className="api-dot dot-green" />
                  48ms
                </span>
              </div>

              {/* API 3 */}
              <div className="intel-api-item">
                <div className="intel-api-icon-wrap icon-collector">
                  <Landmark size={16} />
                </div>
                <div className="intel-api-info">
                  <strong className="intel-api-name">District Collectorate Portals</strong>
                  <span className="intel-api-desc">33 Districts • RFCTLARR Hearing Sync</span>
                </div>
                <span className="intel-api-speed">
                  <span className="api-dot dot-green" />
                  33/33 Online
                </span>
              </div>

              {/* API 4 */}
              <div className="intel-api-item">
                <div className="intel-api-icon-wrap icon-court">
                  <Scale size={16} />
                </div>
                <div className="intel-api-info">
                  <strong className="intel-api-name">High Court e-Courts NJDG Node</strong>
                  <span className="intel-api-desc">Injunction &amp; Writ Petition Docket Listener</span>
                </div>
                <span className="intel-api-speed">
                  <span className="api-dot dot-green" />
                  Active Poll
                </span>
              </div>
            </div>

            <button
              className="intel-configure-btn"
              onClick={() => triggerNotify('Opened API Key Management & Webhook Dispatch Gateway.')}
            >
              <Sliders size={13} />
              <span>Configure API Key Rotations &amp; Webhooks</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
