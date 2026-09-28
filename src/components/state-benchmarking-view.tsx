import React, { useState } from 'react';
import {
  Award,
  Clock,
  ShieldCheck,
  Scale,
  Download,
  FileSpreadsheet,
  ArrowUpRight,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  FileText,
  Send,
  Zap,
} from 'lucide-react';

interface StateBenchmarkingViewProps {
  onNotify?: (message: string) => void;
}

interface PeerState {
  name: string;
  isHost?: boolean;
  score: number;
  avgDays: number;
  droneCadastral: number;
  disputeRate: number;
}

interface DistrictLeaderboardEntry {
  rank: string;
  rankTone: 'emerald' | 'teal' | 'blue' | 'amber' | 'rose';
  district: string;
  isAtRisk?: boolean;
  corridor: string;
  collector: string;
  compositeIndex: number;
  rowVelocity: number;
  dbtEfficiency: number;
  mutationLatency: number;
  statutoryGrade: string;
  gradeTone: 'emerald' | 'teal' | 'blue' | 'rose';
  actionType: 'diagnostic' | 'directive';
}

const PEER_STATES: PeerState[] = [
  {
    name: 'Gujarat (State Host)',
    isHost: true,
    score: 91.6,
    avgDays: 142,
    droneCadastral: 88,
    disputeRate: 3.8,
  },
  {
    name: 'Maharashtra',
    score: 84.2,
    avgDays: 178,
    droneCadastral: 74,
    disputeRate: 7.2,
  },
  {
    name: 'Tamil Nadu',
    score: 82.8,
    avgDays: 189,
    droneCadastral: 69,
    disputeRate: 4.8,
  },
  {
    name: 'Karnataka',
    score: 79.5,
    avgDays: 204,
    droneCadastral: 61,
    disputeRate: 5.9,
  },
  {
    name: 'Uttar Pradesh',
    score: 74.1,
    avgDays: 228,
    droneCadastral: 55,
    disputeRate: 10.4,
  },
];

const DISTRICT_LEADERBOARD: DistrictLeaderboardEntry[] = [
  {
    rank: '01',
    rankTone: 'emerald',
    district: 'Surat',
    corridor: 'Diamond Corridor • Bullet Train',
    collector: 'Dr. Sourabh Zaveri, IAS',
    compositeIndex: 96.8,
    rowVelocity: 11.2,
    dbtEfficiency: 99.4,
    mutationLatency: 6.5,
    statutoryGrade: 'A+',
    gradeTone: 'emerald',
    actionType: 'diagnostic',
  },
  {
    rank: '02',
    rankTone: 'emerald',
    district: 'Ahmedabad',
    corridor: 'Dholera SIR • Ring Road Expans.',
    collector: 'Pravin Kumar Solanki, IAS',
    compositeIndex: 93.2,
    rowVelocity: 13.8,
    dbtEfficiency: 97.8,
    mutationLatency: 8.2,
    statutoryGrade: 'A+',
    gradeTone: 'emerald',
    actionType: 'diagnostic',
  },
  {
    rank: '03',
    rankTone: 'teal',
    district: 'Vadodara',
    corridor: 'Mumbai-Delhi Expwy • DFC Grid',
    collector: 'Shalini Agrawal, IAS',
    compositeIndex: 89.5,
    rowVelocity: 16.4,
    dbtEfficiency: 96.2,
    mutationLatency: 9.8,
    statutoryGrade: 'A',
    gradeTone: 'teal',
    actionType: 'diagnostic',
  },
  {
    rank: '04',
    rankTone: 'teal',
    district: 'Rajkot',
    corridor: 'AIIMS Connectivity • Green Corridor',
    collector: 'Arun Mahesh Babu, IAS',
    compositeIndex: 86.4,
    rowVelocity: 17.9,
    dbtEfficiency: 94.1,
    mutationLatency: 11.4,
    statutoryGrade: 'A',
    gradeTone: 'teal',
    actionType: 'diagnostic',
  },
  {
    rank: '14',
    rankTone: 'blue',
    district: 'Bharuch',
    corridor: 'PCPIR Zone • Dahej Port Link',
    collector: 'Tushar Sumera, IAS',
    compositeIndex: 77.2,
    rowVelocity: 24.6,
    dbtEfficiency: 88.5,
    mutationLatency: 18.2,
    statutoryGrade: 'B',
    gradeTone: 'blue',
    actionType: 'diagnostic',
  },
  {
    rank: '28',
    rankTone: 'rose',
    district: 'Kutch',
    isAtRisk: true,
    corridor: 'Priority Intervention Docket 44/48',
    collector: 'Amit Arora, IAS',
    compositeIndex: 62.1,
    rowVelocity: 46.8,
    dbtEfficiency: 74.2,
    mutationLatency: 34.8,
    statutoryGrade: 'C-',
    gradeTone: 'rose',
    actionType: 'directive',
  },
];

export function StateBenchmarkingView({ onNotify }: StateBenchmarkingViewProps) {
  const [cycle, setCycle] = useState('FY 2025-26 (Live Tracing)');
  const [scope, setScope] = useState('All 33 Collectorates');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState(1);

  const handleExportCsv = () => {
    onNotify?.('Exporting Gujarat Statutory Velocity & Compliance Dataset (CSV)...');
  };

  const handleDownloadIndex = () => {
    onNotify?.('Downloading Official State Ranking & Collectorate Index (PDF)...');
  };

  const handleDeployDocket = () => {
    onNotify?.('Special Lok Adalat Docket deployed to Kutch & Bharuch Collectorates.');
  };

  const handleReviewSop = () => {
    onNotify?.('Surat Paperless RoW Verification SOP v3.4 opened for Saurashtra distribution.');
  };

  const handleActionClick = (entry: DistrictLeaderboardEntry) => {
    if (entry.actionType === 'directive') {
      onNotify?.(`Issued Chief Secretary statutory acceleration directive to ${entry.district} Collectorate.`);
    } else {
      onNotify?.(`Opening Diagnostic 360° deep-dive for ${entry.district} Collectorate...`);
    }
  };

  const filteredDistricts = DISTRICT_LEADERBOARD.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.district.toLowerCase().includes(q) ||
      item.collector.toLowerCase().includes(q) ||
      item.corridor.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bench-container" data-testid="state-benchmarking-view">
      {/* 1. Header Protocol Eyebrow & Actions */}
      <div className="bench-header-section">
        <div className="bench-header-left">
          <div className="bench-eyebrow-row">
            <span className="bench-badge-dark">
              <span className="bench-badge-dot" />
              EXECUTIVE AUDIT MODULE
            </span>
            <span className="bench-badge-slate">COMPARATIVE STATE BENCHMARKING</span>
            <span className="bench-badge-green">
              <span className="bench-badge-pulse-green" />
              Q1 2026 VALIDATED
            </span>
          </div>

          <h1 className="bench-main-title">
            Land Acquisition Velocity &amp; Statutory Compliance Index
          </h1>
          <p className="bench-subtitle">
            High-fidelity comparative governance telemetry across 33 Gujarat Collectorates against
            national corridors, benchmarking RFCTLARR Act statutory velocity and litigation
            insulation.
          </p>
        </div>

        <div className="bench-header-right">
          <div className="bench-controls-row">
            <div className="bench-select-wrap">
              <span className="bench-select-label">CYCLE:</span>
              <select
                className="bench-select"
                value={cycle}
                onChange={(e) => setCycle(e.target.value)}
                data-testid="select-bench-cycle"
              >
                <option>FY 2025-26 (Live Tracing)</option>
                <option>FY 2024-25 (Audited Close)</option>
                <option>Q4 FY 2024-25 (Historical)</option>
              </select>
            </div>

            <div className="bench-select-wrap">
              <span className="bench-select-label">SCOPE:</span>
              <select
                className="bench-select"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                data-testid="select-bench-scope"
              >
                <option>All 33 Collectorates</option>
                <option>Top 10 Priority Corridors</option>
                <option>Industrial Coastal Belt</option>
                <option>Tribal &amp; Forest Parcels</option>
              </select>
            </div>
          </div>

          <div className="bench-actions-row">
            <button
              className="bench-btn-outline"
              onClick={handleExportCsv}
              data-testid="btn-export-csv"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button
              className="bench-btn-dark"
              onClick={handleDownloadIndex}
              data-testid="btn-download-ranking"
            >
              <Download size={14} />
              <span>Download State Ranking Index</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top 4 Metric KPI Cards */}
      <div className="bench-kpi-grid">
        {/* KPI 1: COMPOSITE NATIONAL RANK */}
        <div className="bench-kpi-card" data-testid="kpi-national-rank">
          <div className="bench-kpi-top">
            <span className="bench-kpi-label">COMPOSITE NATIONAL RANK</span>
            <div className="bench-kpi-icon-box icon-blue">
              <Award size={16} />
            </div>
          </div>
          <div className="bench-kpi-val-row">
            <span className="bench-kpi-huge">#1</span>
            <span className="bench-kpi-unit-text">in India</span>
          </div>
          <div className="bench-kpi-bottom">
            <span className="bench-trend-pill positive">
              <TrendingUp size={12} />
              <strong>91.6 / 100</strong>
            </span>
            <span className="bench-kpi-subtext">+4.2 pts YoY Gain</span>
          </div>
          <div className="bench-kpi-accent-bar" style={{ background: '#0FA89A' }} />
        </div>

        {/* KPI 2: MEDIAN AWARD DELIVERY */}
        <div className="bench-kpi-card" data-testid="kpi-median-award">
          <div className="bench-kpi-top">
            <span className="bench-kpi-label">MEDIAN AWARD DELIVERY</span>
            <div className="bench-kpi-icon-box icon-emerald">
              <Clock size={16} />
            </div>
          </div>
          <div className="bench-kpi-val-row">
            <span className="bench-kpi-huge">142</span>
            <span className="bench-kpi-unit-text">Days</span>
          </div>
          <div className="bench-kpi-bottom">
            <span className="bench-pill-speed">
              <Zap size={11} />
              38% Faster
            </span>
            <span className="bench-kpi-subtext">National Ref: 230 Days</span>
          </div>
          <div className="bench-kpi-accent-bar" style={{ background: '#16A878' }} />
        </div>

        {/* KPI 3: STATUTORY COMPLIANCE RATE */}
        <div className="bench-kpi-card" data-testid="kpi-statutory-compliance">
          <div className="bench-kpi-top">
            <span className="bench-kpi-label">STATUTORY COMPLIANCE RATE</span>
            <div className="bench-kpi-icon-box icon-cyan">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="bench-kpi-val-row">
            <span className="bench-kpi-huge">96.8%</span>
          </div>
          <div className="bench-kpi-bottom">
            <span className="bench-kpi-law-ref">Sec 19 &amp; 23 RFCTLARR</span>
            <span className="bench-pill-grade">Grade A1</span>
          </div>
          <div className="bench-kpi-accent-bar" style={{ background: '#064C55' }} />
        </div>

        {/* KPI 4: LITIGATION IMPASSE RATIO */}
        <div className="bench-kpi-card" data-testid="kpi-litigation-impasse">
          <div className="bench-kpi-top">
            <span className="bench-kpi-label">LITIGATION IMPASSE RATIO</span>
            <div className="bench-kpi-icon-box icon-slate">
              <Scale size={16} />
            </div>
          </div>
          <div className="bench-kpi-val-row">
            <span className="bench-kpi-huge">3.8%</span>
            <span className="bench-kpi-unit-text">of Total RoW</span>
          </div>
          <div className="bench-kpi-bottom">
            <span className="bench-kpi-subtext">National Avg: 11.2%</span>
            <span className="bench-delta-tag">-7.4% Delta</span>
          </div>
          <div className="bench-kpi-accent-bar" style={{ background: '#526B82' }} />
        </div>
      </div>

      {/* 3. Middle Row: Peer Index & Recommendations */}
      <div className="bench-middle-grid">
        {/* Card 1: State-to-State Peer Index */}
        <div className="bench-panel-card" data-testid="panel-peer-index">
          <div className="bench-panel-header">
            <div className="bench-panel-title-wrap">
              <div className="bench-panel-title-row">
                <span className="bench-dot-pulse-teal" />
                <h2 className="bench-panel-title">State-to-State Peer Index</h2>
              </div>
              <p className="bench-panel-desc">
                Comparing sovereign clearance speed and cadastral drone-adoption across the top 5
                industrial states.
              </p>
            </div>
            <span className="bench-grid-tag">NORTH &amp; WEST GRID</span>
          </div>

          <div className="bench-peer-list">
            {PEER_STATES.map((state) => (
              <div
                key={state.name}
                className={`bench-peer-item ${state.isHost ? 'is-host' : ''}`}
                data-testid={`peer-row-${state.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              >
                <div className="bench-peer-header-line">
                  <div className="bench-peer-name-wrap">
                    {state.isHost && <span className="bench-host-dot" />}
                    <span className="bench-peer-name">{state.name}</span>
                  </div>
                  <div className="bench-peer-score-line">
                    <strong className="bench-peer-score">{state.score.toFixed(1)} Index</strong>
                    <span className="bench-peer-dot">•</span>
                    <span className="bench-peer-days">{state.avgDays} Days Avg</span>
                  </div>
                </div>

                <div className="bench-peer-track">
                  <div
                    className={`bench-peer-fill ${state.isHost ? 'host-fill' : 'peer-fill'}`}
                    style={{ width: `${state.score}%` }}
                  />
                </div>

                <div className="bench-peer-submeta">
                  <span>Drone Cadastral: <strong>{state.droneCadastral}%</strong></span>
                  <span>Dispute: <strong>{state.disputeRate.toFixed(1)}%</strong></span>
                </div>
              </div>
            ))}
          </div>

          <div className="bench-peer-callout">
            <Info size={15} className="bench-callout-icon" />
            <p className="bench-callout-text">
              Gujarat leads nationally in Direct Benefit Transfer (DBT) disbursement velocity at{' '}
              <strong>₹43.2 Cr/day median liquidity flow</strong>.
            </p>
          </div>
        </div>

        {/* Card 2: Strategic Governance Recommendations */}
        <div className="bench-panel-card" data-testid="panel-recommendations">
          <div className="bench-panel-header">
            <div className="bench-panel-title-wrap">
              <div className="bench-panel-title-row">
                <ShieldCheck size={18} className="bench-icon-teal" />
                <h2 className="bench-panel-title">Strategic Governance Recommendations</h2>
              </div>
              <p className="bench-panel-desc">
                Automated protocol triggers generated for Chief Secretary &amp; Revenue Department
                to preserve State #1 ranking.
              </p>
            </div>
            <span className="bench-brief-tag">CS EXECUTIVE BRIEFING</span>
          </div>

          <div className="bench-recom-list">
            {/* Recommendation 1 */}
            <div className="bench-recom-item" data-testid="recom-item-1">
              <div className="bench-recom-top">
                <div className="bench-recom-title-row">
                  <span className="bench-dot-red" />
                  <h3 className="bench-recom-heading">
                    Fast-track Special Lok Adalat Benches (Kutch &amp; Bharuch)
                  </h3>
                  <span className="bench-recom-chip chip-red">High Exposure</span>
                </div>
                <button
                  className="bench-btn-dark-sm"
                  onClick={handleDeployDocket}
                  data-testid="btn-deploy-docket"
                >
                  Deploy Docket
                </button>
              </div>

              <p className="bench-recom-body">
                Release ₹124.6 Cr tied in escrow across 47 encumbered agricultural parcels on the
                Western Dedicated Freight Corridor alignment.
              </p>

              <div className="bench-recom-meta-row">
                <span className="bench-recom-target">
                  Target: <strong>Sec 64 Tribunals</strong>
                </span>
                <span className="bench-recom-dot">•</span>
                <span className="bench-recom-uplift">
                  Potential Velocity Uplift: <strong>+18.4%</strong>
                </span>
              </div>
            </div>

            {/* Recommendation 2 */}
            <div className="bench-recom-item" data-testid="recom-item-2">
              <div className="bench-recom-top">
                <div className="bench-recom-title-row">
                  <span className="bench-dot-green" />
                  <h3 className="bench-recom-heading">
                    Replicate Surat Paperless RoW Verification to Saurashtra
                  </h3>
                  <span className="bench-recom-chip chip-green">Efficiency Lift</span>
                </div>
                <button
                  className="bench-btn-outline-sm"
                  onClick={handleReviewSop}
                  data-testid="btn-review-sop"
                >
                  Review SOP
                </button>
              </div>

              <p className="bench-recom-body">
                Mandate digital DGPS boundary sign-offs between Gram Panchayats and NHAI to compress
                Jamnagar &amp; Bhavnagar mutation cycle times by 22 days.
              </p>

              <div className="bench-recom-meta-row">
                <span className="bench-recom-target">
                  Target: <strong>Rajkot, Jamnagar, Bhavnagar</strong>
                </span>
                <span className="bench-recom-dot">•</span>
                <span className="bench-recom-uplift">
                  SOP v3.4 Ready
                </span>
              </div>
            </div>
          </div>

          <div className="bench-recom-footer">
            <span className="bench-footer-intel">
              Machine Intelligence: Engine Node Gandhinagar
            </span>
            <button
              className="bench-link-interventions"
              onClick={() => onNotify?.('Opening 14 auxiliary district interventions overview...')}
              data-testid="btn-view-interventions"
            >
              View 14 auxiliary district interventions &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* 4. Gujarat District Performance Index (GDPI) Leaderboard Table */}
      <div className="bench-table-card" data-testid="panel-gdpi-table">
        <div className="bench-table-header">
          <div className="bench-table-title-wrap">
            <div className="bench-panel-title-row">
              <span className="bench-dot-pulse-teal" />
              <h2 className="bench-panel-title">
                Gujarat District Performance Index (GDPI) Leaderboard
              </h2>
            </div>
            <p className="bench-panel-desc">
              Full statutory audit across all 33 administrative collectorates evaluating velocity,
              payout transparency, and litigation mitigation.
            </p>
          </div>

          <div className="bench-search-box">
            <Search size={14} className="bench-search-icon" />
            <input
              type="text"
              placeholder="Filter district or collector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bench-search-input"
              data-testid="input-filter-leaderboard"
            />
            <Filter size={13} className="bench-filter-tail-icon" />
          </div>
        </div>

        <div className="bench-table-scroll-wrap">
          <table className="bench-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>RANK &amp; DISTRICT</th>
                <th style={{ width: '18%' }}>DISTRICT COLLECTOR (IAS)</th>
                <th style={{ width: '13%' }}>COMPOSITE INDEX</th>
                <th style={{ width: '11%' }}>ROW VELOCITY</th>
                <th style={{ width: '11%' }}>DBT EFFICIENCY</th>
                <th style={{ width: '11%' }}>MUTATION LATENCY</th>
                <th style={{ width: '7%', textAlign: 'center' }}>STATUTORY GRADE</th>
                <th style={{ width: '7%', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredDistricts.map((item) => (
                <tr
                  key={item.district}
                  className={item.isAtRisk ? 'row-at-risk' : ''}
                  data-testid={`row-district-${item.district.toLowerCase()}`}
                >
                  {/* Column 1: Rank & District */}
                  <td>
                    <div className="bench-district-cell">
                      <span className={`bench-rank-badge rank-${item.rankTone}`}>
                        {item.rank}
                      </span>
                      <div className="bench-district-info">
                        <div className="bench-district-name-row">
                          <strong className="bench-district-title">{item.district}</strong>
                          {item.isAtRisk && <span className="bench-red-indicator-dot" />}
                        </div>
                        <span className="bench-corridor-meta">{item.corridor}</span>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Collector */}
                  <td>
                    <span className="bench-collector-text">{item.collector}</span>
                  </td>

                  {/* Column 3: Composite Index */}
                  <td>
                    <div className="bench-score-cell">
                      <strong
                        className={`bench-score-bold ${
                          item.compositeIndex < 70 ? 'text-rose' : 'text-teal'
                        }`}
                      >
                        {item.compositeIndex.toFixed(1)}
                      </strong>
                      <span className="bench-score-max">/ 100</span>
                    </div>
                  </td>

                  {/* Column 4: RoW Velocity */}
                  <td>
                    <div className="bench-metric-cell">
                      <span
                        className={`bench-metric-val ${
                          item.rowVelocity > 30 ? 'text-rose' : ''
                        }`}
                      >
                        {item.rowVelocity.toFixed(1)}
                      </span>
                      <span className="bench-metric-unit">days/km</span>
                    </div>
                  </td>

                  {/* Column 5: DBT Efficiency */}
                  <td>
                    <div className="bench-metric-cell">
                      <span className="bench-metric-val">
                        {item.dbtEfficiency.toFixed(1)}%
                      </span>
                    </div>
                  </td>

                  {/* Column 6: Mutation Latency */}
                  <td>
                    <div className="bench-metric-cell">
                      <span
                        className={`bench-metric-val ${
                          item.mutationLatency > 20 ? 'text-rose' : ''
                        }`}
                      >
                        {item.mutationLatency.toFixed(1)}
                      </span>
                      <span className="bench-metric-unit">days</span>
                    </div>
                  </td>

                  {/* Column 7: Statutory Grade */}
                  <td style={{ textAlign: 'center' }}>
                    <span className={`bench-grade-pill grade-${item.gradeTone}`}>
                      {item.statutoryGrade}
                    </span>
                  </td>

                  {/* Column 8: Action */}
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className={`bench-action-btn ${
                        item.actionType === 'directive' ? 'btn-danger-link' : 'btn-teal-link'
                      }`}
                      onClick={() => handleActionClick(item)}
                      data-testid={`btn-action-${item.district.toLowerCase()}`}
                    >
                      <span>
                        {item.actionType === 'directive'
                          ? 'Issue Directive'
                          : 'Diagnostic 360°'}
                      </span>
                      <ArrowUpRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bench-table-pagination-strip">
          <div className="bench-page-left">
            <span>
              Displaying 6 of 33 Certified District Collectorates • Data Verified via AnyROR &amp;
              Garvi Registry
            </span>
          </div>

          <div className="bench-page-right">
            <button
              className="bench-page-btn"
              disabled={activePage === 1}
              onClick={() => setActivePage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span className="bench-page-indicator">Page {activePage} of 6</span>
            <button
              className="bench-page-btn"
              disabled={activePage === 6}
              onClick={() => setActivePage((p) => Math.min(6, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 5. Bottom 3 Feature Real-World Imagery Cards */}
      <div className="bench-feature-grid">
        {/* Feature Card 1 */}
        <div className="bench-feature-card" data-testid="card-drone-cadastral">
          <div className="bench-feature-media">
            <img
              src="/assets/bench_card_cadastral.png"
              alt="Drone-Verified Cadastral RoW"
              className="bench-feature-img"
            />
          </div>
          <div className="bench-feature-content">
            <h3 className="bench-feature-title">Drone-Verified Cadastral RoW</h3>
            <p className="bench-feature-desc">
              Surat Collectorate achieved 100% boundary consensus using DGPS ground control units,
              mitigating 310+ potential court stays.
            </p>
            <div className="bench-feature-stat-row">
              <span className="bench-stat-label">Survey Coverage: 1,420 Ha</span>
              <span className="bench-stat-highlight green">100% Reconciled</span>
            </div>
          </div>
        </div>

        {/* Feature Card 2 */}
        <div className="bench-feature-card" data-testid="card-dbt-pipeline">
          <div className="bench-feature-media">
            <img
              src="/assets/bench_card_dbt.png"
              alt="Direct Benefit Transfer Pipeline"
              className="bench-feature-img"
            />
          </div>
          <div className="bench-feature-content">
            <h3 className="bench-feature-title">Direct Benefit Transfer Pipeline</h3>
            <p className="bench-feature-desc">
              Zero-leakage compensation disbursement integrated with RBI e-Kuber gateway for
              Aadhaar-linked statutory compensation.
            </p>
            <div className="bench-feature-stat-row">
              <span className="bench-stat-label">Disbursed YTD: ₹1,842 Cr</span>
              <span className="bench-stat-highlight blue">99.8% Success</span>
            </div>
          </div>
        </div>

        {/* Feature Card 3 */}
        <div className="bench-feature-card" data-testid="card-row-handover">
          <div className="bench-feature-media">
            <img
              src="/assets/bench_card_row.png"
              alt="Statutory RoW Handover Rate"
              className="bench-feature-img"
            />
          </div>
          <div className="bench-feature-content">
            <h3 className="bench-feature-title">Statutory RoW Handover Rate</h3>
            <p className="bench-feature-desc">
              Accelerated possession declarations under Section 23 with average unencumbered land
              delivery under 14 weeks.
            </p>
            <div className="bench-feature-stat-row">
              <span className="bench-stat-label">Track Record: 412 Km Handed</span>
              <span className="bench-stat-highlight dark">National Record</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
