import React, { useState } from 'react';
import {
  Download,
  Send,
  Building2,
  ShieldCheck,
  Scale,
  AlertTriangle,
  FileText,
  Filter,
  CheckCircle2,
  Calendar,
  Lock,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Clock,
  ArrowUpRight,
  Shield,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface FundTrackingViewProps {
  onNotify?: (msg: string) => void;
}

interface ProjectFinancial {
  id: string;
  name: string;
  agency: string;
  subtext: string;
  totalOutlay: number;
  disbursedDbt: number;
  disbursedPct: number;
  pendingVerify: number;
  pendingIsWarning?: boolean;
  courtEscrow: number;
  interestImpact: number;
  interestType: 'saved' | 'risk';
  trancheStatus: 'On Track' | 'Attention Required' | 'Completed' | 'Delayed (>60d)';
  statusTone: 'success' | 'warning' | 'primary' | 'danger';
}

const projectsData: ProjectFinancial[] = [
  {
    id: 'f-01',
    name: 'DMIC Vadodara-Kim Expressway',
    agency: 'NHAI',
    subtext: 'Package II & III - Bharuch/Surat',
    totalOutlay: 2180.00,
    disbursedDbt: 1850.00,
    disbursedPct: 84.9,
    pendingVerify: 46.00,
    courtEscrow: 185.00,
    interestImpact: 32.4,
    interestType: 'saved',
    trancheStatus: 'On Track',
    statusTone: 'success'
  },
  {
    id: 'f-02',
    name: 'Mumbai-Ahmedabad HSR Bullet Train',
    agency: 'NHSRCL',
    subtext: 'Alignment Section C-4 & C-5',
    totalOutlay: 3400.00,
    disbursedDbt: 2980.00,
    disbursedPct: 87.6,
    pendingVerify: 110.00,
    courtEscrow: 210.00,
    interestImpact: 39.2,
    interestType: 'saved',
    trancheStatus: 'On Track',
    statusTone: 'success'
  },
  {
    id: 'f-03',
    name: 'Dholera SIR Outer Ring Road',
    agency: 'GIDC',
    subtext: 'TP Scheme 2 East Corridor',
    totalOutlay: 680.00,
    disbursedDbt: 410.00,
    disbursedPct: 60.3,
    pendingVerify: 95.00,
    pendingIsWarning: true,
    courtEscrow: 175.00,
    interestImpact: 12.8,
    interestType: 'risk',
    trancheStatus: 'Attention Required',
    statusTone: 'warning'
  },
  {
    id: 'f-04',
    name: 'Jamnagar Oil Refinery Feeder Corridor',
    agency: 'State Highway Authority',
    subtext: 'Lalpur Bypass',
    totalOutlay: 850.00,
    disbursedDbt: 780.00,
    disbursedPct: 91.7,
    pendingVerify: 22.00,
    courtEscrow: 48.00,
    interestImpact: 8.5,
    interestType: 'saved',
    trancheStatus: 'Completed',
    statusTone: 'primary'
  },
  {
    id: 'f-05',
    name: 'Saurashtra Industrial Water Canal RoW',
    agency: 'SSNNL Water Board',
    subtext: 'Rajkot-Morbi Spur',
    totalOutlay: 620.00,
    disbursedDbt: 290.00,
    disbursedPct: 46.7,
    pendingVerify: 145.00,
    pendingIsWarning: true,
    courtEscrow: 195.00,
    interestImpact: 16.2,
    interestType: 'risk',
    trancheStatus: 'Delayed (>60d)',
    statusTone: 'danger'
  }
];

export function FundTrackingView({ onNotify }: FundTrackingViewProps) {
  const [selectedOutlay, setSelectedOutlay] = useState('All Capital Outlays');
  const [selectedFy, setSelectedFy] = useState('FY 2025-26 (Q1 Current)');
  const [filterCorridor, setFilterCorridor] = useState('all');
  const [selectedProjectRow, setSelectedProjectRow] = useState<string | null>(null);

  const triggerNotify = (msg: string) => {
    if (onNotify) onNotify(msg);
  };

  const handleExportPdf = () => {
    window.print();
    triggerNotify('Generating Treasury Audit PDF export packet...');
  };

  const handleInitiateBatchDbt = () => {
    triggerNotify('Batch DBT Transfer Modal opened: 48,390 beneficiaries verified.');
  };

  const handleInspectDockets = () => {
    triggerNotify('Anand District Bypass: 342 Landholder Dockets loaded for inspection.');
  };

  const handleAuthorizeDsc = () => {
    triggerNotify('e-Mudhra DSC token validated. Batch DBJ-2025-14B authorized for clearance.');
  };

  const handleReverification = () => {
    triggerNotify('NPCI APB automated re-verification batch queued for 434 pending exceptions.');
  };

  const handleDownloadSec80 = () => {
    triggerNotify('Section 80 Mandatory Interest Compliance Certificate downloaded.');
  };

  const filteredProjects = projectsData.filter((p) => {
    if (filterCorridor === 'all') return true;
    if (filterCorridor === 'warning') return p.interestType === 'risk';
    if (filterCorridor === 'ontrack') return p.trancheStatus === 'On Track';
    return true;
  });

  return (
    <div className="fund-page" data-testid="fund-tracking-container">
      {/* 1. Header with Eyebrow & Top Action Bar */}
      <div className="fund-header-wrap">
        <div className="fund-header-left">
          <div className="fund-eyebrow-row">
            <span className="fund-eyebrow-text">
              ESCROW AUDIT & FINANCIAL OUTLAY MONITORING • STATE TREASURY PROTOCOL
            </span>
            <span className="fund-eyebrow-badge">RFCTLARR Sec 77/80</span>
          </div>
          <h1 className="fund-title">Compensation & Escrow Fund Tracking Ledger</h1>
          <p className="fund-subtitle">
            End-to-end reconciliation of statutory compensation outlays, Direct Benefit Transfers (DBT), escrow balances, and interest penalty exposure across infrastructure priority grids.
          </p>
        </div>

        <div className="fund-header-actions">
          <div className="fund-dropdown-group">
            <select
              className="fund-select"
              value={selectedOutlay}
              onChange={(e) => {
                setSelectedOutlay(e.target.value);
                triggerNotify(`Filtered by: ${e.target.value}`);
              }}
              data-testid="select-capital-outlays"
            >
              <option>All Capital Outlays</option>
              <option>Highway & Expressways</option>
              <option>High Speed Rail & Metro</option>
              <option>Special Investment Regions</option>
              <option>Water & Irrigation Feeder</option>
            </select>

            <div className="fund-fy-badge" title="Active Fiscal Year Monitoring Period">
              <Calendar size={13} className="fund-fy-icon" />
              <span>{selectedFy}</span>
            </div>
          </div>

          <div className="fund-btn-row">
            <button
              className="fund-btn-soft"
              onClick={handleExportPdf}
              data-testid="button-download-treasury-pdf"
            >
              <Download size={14} />
              <span>Download Treasury Audit PDF</span>
            </button>
            <button
              className="fund-btn-primary"
              onClick={handleInitiateBatchDbt}
              data-testid="button-initiate-batch-dbt"
            >
              <Send size={14} />
              <span>Initiate Batch DBT Transfer</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. PFMS & Treasury Telemetry Strip */}
      <div className="fund-telemetry-strip" data-testid="fund-telemetry-strip">
        <div className="fund-telemetry-item">
          <span className="fund-pulse-dot" />
          <span className="fund-telemetry-label">Public Financial Management System (PFMS) Gateway:</span>
          <span className="fund-telemetry-val-green">SYNCHED (200 OK)</span>
        </div>
        <div className="fund-telemetry-divider" />
        <div className="fund-telemetry-item">
          <span className="fund-telemetry-label">State Nodal Agency (SNA) Zero-Balance Account:</span>
          <span className="fund-telemetry-val-blue">RECONCILED</span>
        </div>
        <div className="fund-telemetry-divider" />
        <div className="fund-telemetry-item">
          <span className="fund-telemetry-label">Treasury Clearance Cycle:</span>
          <span className="fund-telemetry-val-dark">T+1 Settlement</span>
        </div>
        <div className="fund-telemetry-divider" />
        <div className="fund-telemetry-item">
          <span className="fund-telemetry-label">Last Batch Hash:</span>
          <span className="fund-telemetry-mono">0xf71a...a12d</span>
        </div>
      </div>

      {/* 3. Top 4 Financial KPI Cards */}
      <div className="fund-kpi-grid">
        {/* KPI 1: TOTAL SANCTIONED BUDGET */}
        <div className="fund-kpi-card" data-testid="kpi-total-sanctioned">
          <div className="fund-kpi-top">
            <span className="fund-kpi-label">TOTAL SANCTIONED BUDGET</span>
            <div className="fund-kpi-icon-box icon-teal">
              <Building2 size={16} />
            </div>
          </div>
          <div className="fund-kpi-value-row">
            <span className="fund-kpi-symbol">₹</span>
            <span className="fund-kpi-number">12,450</span>
            <span className="fund-kpi-unit">Cr</span>
          </div>
          <div className="fund-kpi-bottom-row">
            <span className="fund-kpi-subtext">Allocated across 68 priority projects</span>
            <span className="fund-kpi-pill-green">100% Fund Plan</span>
          </div>
          <div className="fund-kpi-bar" style={{ background: '#0FA89A' }} />
        </div>

        {/* KPI 2: FUNDS DISBURSED (DBT) */}
        <div className="fund-kpi-card" data-testid="kpi-funds-disbursed">
          <div className="fund-kpi-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="fund-kpi-label">FUNDS DISBURSED (DBT)</span>
              <span className="fund-tag-verified">VERIFIED</span>
            </div>
            <div className="fund-kpi-icon-box icon-emerald">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="fund-kpi-value-row">
            <span className="fund-kpi-symbol">₹</span>
            <span className="fund-kpi-number">8,920</span>
            <span className="fund-kpi-unit">Cr</span>
          </div>
          <div className="fund-kpi-bottom-row">
            <div className="fund-progress-inline">
              <div className="fund-track">
                <div className="fund-fill" style={{ width: '71.6%', background: '#16A878' }} />
              </div>
              <span className="fund-progress-val">71.6% Total Progress</span>
            </div>
            <span className="fund-kpi-meta">48,390 Landholders</span>
          </div>
          <div className="fund-kpi-bar" style={{ background: '#16A878' }} />
        </div>

        {/* KPI 3: UNCLAIMED ESCROW DEPOSITED */}
        <div className="fund-kpi-card" data-testid="kpi-unclaimed-escrow">
          <div className="fund-kpi-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="fund-kpi-label">UNCLAIMED ESCROW DEPOSITED</span>
              <span className="fund-tag-sec">SEC 77</span>
            </div>
            <div className="fund-kpi-icon-box icon-blue">
              <Scale size={16} />
            </div>
          </div>
          <div className="fund-kpi-value-row">
            <span className="fund-kpi-symbol">₹</span>
            <span className="fund-kpi-number">1,240</span>
            <span className="fund-kpi-unit">Cr</span>
          </div>
          <div className="fund-kpi-bottom-row">
            <span className="fund-kpi-subtext">In High Court / Land Authority Escrow</span>
            <span className="fund-kpi-pill-blue">9.95% Sub-Judice</span>
          </div>
          <div className="fund-kpi-bar" style={{ background: '#5BA7D9' }} />
        </div>

        {/* KPI 4: INTEREST PENALTY EXPOSURE */}
        <div className="fund-kpi-card" data-testid="kpi-interest-penalty">
          <div className="fund-kpi-top">
            <span className="fund-kpi-label">INTEREST PENALTY EXPOSURE</span>
            <div className="fund-kpi-icon-box icon-red">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="fund-kpi-value-row">
            <span className="fund-kpi-symbol">₹</span>
            <span className="fund-kpi-number">18.4</span>
            <span className="fund-kpi-unit">Cr</span>
          </div>
          <div className="fund-kpi-bottom-row">
            <span className="fund-kpi-subtext">Annual 9% statutory liability (&gt;1yr delay)</span>
            <span className="fund-kpi-pill-red">5 At-Risk Parcels</span>
          </div>
          <div className="fund-kpi-bar" style={{ background: '#E85D68' }} />
        </div>
      </div>

      {/* 4. Middle Visual Intelligence Grid (Two Cards Side-by-Side) */}
      <div className="fund-visual-grid">
        {/* Card 1: Monthly Compensation Disbursement Velocity */}
        <div className="fund-card" data-testid="card-disbursement-velocity">
          <div className="fund-card-header">
            <div>
              <h2 className="fund-card-title">Monthly Compensation Disbursement Velocity</h2>
              <p className="fund-card-subtitle">Target allocation vs. actual Aadhaar/PFMS DBT execution (₹ Crores, 2025)</p>
            </div>
            <div className="fund-chart-legend">
              <span className="fund-legend-item">
                <span className="fund-legend-bar" /> Actual DBT
              </span>
              <span className="fund-legend-item">
                <span className="fund-legend-line" /> Budget Target
              </span>
            </div>
          </div>

          {/* SVG Velocity Bar + Line Combo Chart */}
          <div className="fund-chart-wrap">
            <svg viewBox="0 0 540 180" className="fund-velocity-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="barTealGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#064C55" />
                  <stop offset="100%" stopColor="#0A363D" />
                </linearGradient>
                <linearGradient id="barTargetArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0FA89A" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0FA89A" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines */}
              <line x1="45" y1="20" x2="520" y2="20" stroke="#E5EFEE" strokeDasharray="3 3" />
              <line x1="45" y1="50" x2="520" y2="50" stroke="#E5EFEE" strokeDasharray="3 3" />
              <line x1="45" y1="80" x2="520" y2="80" stroke="#E5EFEE" strokeDasharray="3 3" />
              <line x1="45" y1="110" x2="520" y2="110" stroke="#E5EFEE" strokeDasharray="3 3" />
              <line x1="45" y1="140" x2="520" y2="140" stroke="#E5EFEE" strokeDasharray="3 3" />

              {/* Y Axis Labels */}
              <text x="38" y="24" textAnchor="end" className="fund-axis-label">₹2,000</text>
              <text x="38" y="54" textAnchor="end" className="fund-axis-label">₹1,500</text>
              <text x="38" y="84" textAnchor="end" className="fund-axis-label">₹1,000</text>
              <text x="38" y="114" textAnchor="end" className="fund-axis-label">₹500</text>
              <text x="38" y="144" textAnchor="end" className="fund-axis-label">₹0</text>

              {/* Month Bars (Actual DBT Execution) */}
              {/* JAN: x=75, h=65 (val=1,120) */}
              <rect x="65" y="75" width="36" height="65" rx="3" fill="url(#barTealGradient)" />
              {/* FEB: x=150, h=92 (val=1,580) */}
              <rect x="145" y="48" width="36" height="92" rx="3" fill="url(#barTealGradient)" />
              {/* MAR: x=230, h=106 (val=1,820) */}
              <rect x="225" y="34" width="36" height="106" rx="3" fill="url(#barTealGradient)" />
              {/* APR: x=310, h=79 (val=1,360) */}
              <rect x="305" y="61" width="36" height="79" rx="3" fill="url(#barTealGradient)" />
              {/* MAY: x=390, h=90 (val=1,540) */}
              <rect x="385" y="50" width="36" height="90" rx="3" fill="url(#barTealGradient)" />
              {/* JUN*: x=470, h=87 (val=1,490) */}
              <rect x="465" y="53" width="36" height="87" rx="3" fill="url(#barTealGradient)" />

              {/* Target Line path */}
              <path
                d="M 83,82 L 163,58 L 243,40 L 323,65 L 403,50 L 483,38"
                fill="none"
                stroke="#0FA89A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Target Line Points */}
              <circle cx="83" cy="82" r="4" fill="#FFFFFF" stroke="#0FA89A" strokeWidth="2.5" />
              <circle cx="163" cy="58" r="4" fill="#FFFFFF" stroke="#0FA89A" strokeWidth="2.5" />
              <circle cx="243" cy="40" r="4" fill="#FFFFFF" stroke="#0FA89A" strokeWidth="2.5" />
              <circle cx="323" cy="65" r="4" fill="#FFFFFF" stroke="#0FA89A" strokeWidth="2.5" />
              <circle cx="403" cy="50" r="4" fill="#FFFFFF" stroke="#0FA89A" strokeWidth="2.5" />
              <circle cx="483" cy="38" r="4" fill="#FFFFFF" stroke="#0FA89A" strokeWidth="2.5" />

              {/* Month X Labels */}
              <text x="83" y="160" textAnchor="middle" className="fund-x-label">JAN</text>
              <text x="163" y="160" textAnchor="middle" className="fund-x-label">FEB</text>
              <text x="243" y="160" textAnchor="middle" className="fund-x-label">MAR</text>
              <text x="323" y="160" textAnchor="middle" className="fund-x-label">APR</text>
              <text x="403" y="160" textAnchor="middle" className="fund-x-label">MAY</text>
              <text x="483" y="160" textAnchor="middle" className="fund-x-label fund-x-active">JUN*</text>
            </svg>
          </div>

          <div className="fund-card-footnote">
            <div className="fund-fn-left">
              <span className="fund-green-bullet" />
              <span>Q2 Target Pace: +16.2% over Q1 baseline</span>
            </div>
            <div className="fund-fn-right">
              <span>Average Settlement Turnaround: <strong>4.2 working days</strong></span>
            </div>
          </div>
        </div>

        {/* Card 2: DBT Gateway Clearance Health */}
        <div className="fund-card" data-testid="card-clearance-health">
          <div className="fund-card-header">
            <div>
              <h2 className="fund-card-title">DBT Gateway Clearance Health</h2>
              <p className="fund-card-subtitle">Real-time status of Aadhaar Payment Bridge & Public Financial Management System.</p>
            </div>
            <span className="fund-badge-npci">NPCI APB LINKED</span>
          </div>

          <div className="fund-clearance-body">
            {/* Dual Circular Clearance Metrics */}
            <div className="fund-circular-metrics">
              {/* Metric 1: Success Direct */}
              <div className="fund-circle-item">
                <div className="fund-ring-box ring-green">
                  <svg viewBox="0 0 36 36" className="fund-ring-svg">
                    <path
                      className="fund-ring-bg"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="fund-ring-stroke stroke-green"
                      strokeDasharray="99.1, 100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="fund-ring-text text-green">99.1%</span>
                </div>
                <div className="fund-ring-info">
                  <div className="fund-ring-number">47,766</div>
                  <div className="fund-ring-caption">SUCCESS DIRECT</div>
                </div>
              </div>

              {/* Metric 2: Exceptions Pending */}
              <div className="fund-circle-item">
                <div className="fund-ring-box ring-orange">
                  <svg viewBox="0 0 36 36" className="fund-ring-svg">
                    <path
                      className="fund-ring-bg"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="fund-ring-stroke stroke-orange"
                      strokeDasharray="9, 100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="fund-ring-text text-orange">0.9%</span>
                </div>
                <div className="fund-ring-info">
                  <div className="fund-ring-number">434</div>
                  <div className="fund-ring-caption">EXCEPTIONS PENDING</div>
                </div>
              </div>
            </div>

            {/* Exception Breakdown List */}
            <div className="fund-exceptions-list">
              <div className="fund-exception-row">
                <div className="fund-exc-left">
                  <span className="fund-dot-blue" />
                  <span className="fund-exc-name">Name Mismatch (RoR vs Bank Passbook)</span>
                </div>
                <span className="fund-exc-status">248 cases • Auto-Notified</span>
              </div>

              <div className="fund-exception-row">
                <div className="fund-exc-left">
                  <span className="fund-dot-orange" />
                  <span className="fund-exc-name">Dormant / Inactive Bank Account</span>
                </div>
                <span className="fund-exc-status">122 cases • Camp Scheduled</span>
              </div>

              <div className="fund-exception-row">
                <div className="fund-exc-left">
                  <span className="fund-dot-red" />
                  <span className="fund-exc-name">Aadhaar De-linked / IFSC Merger</span>
                </div>
                <span className="fund-exc-status">64 cases • Resolving</span>
              </div>
            </div>
          </div>

          <div className="fund-card-footnote">
            <button
              className="fund-link-btn"
              onClick={handleReverification}
              data-testid="button-run-reverification"
            >
              <span>Run automated re-verification batch</span>
              <ArrowUpRight size={13} />
            </button>
            <span className="fund-sla-text">SLA: 48h to retry</span>
          </div>
        </div>
      </div>

      {/* 5. Special Highlight Card: Upcoming DBT Disbursement Banner */}
      <div className="fund-upcoming-banner" data-testid="banner-upcoming-dbt">
        <div className="fund-banner-content">
          <div className="fund-banner-icon-box">
            <ShieldCheck size={24} color="#0FA89A" />
          </div>
          <div className="fund-banner-text">
            <div className="fund-banner-badge-row">
              <span className="fund-banner-tag">UPCOMING DBT DISBURSEMENT</span>
              <span className="fund-banner-batch">Batch DBJ-2025-14B</span>
            </div>
            <h3 className="fund-banner-title">Anand District Bypass & Spur RoW (342 verified farmers)</h3>
            <p className="fund-banner-desc">
              Scheduled execution: 22 June 2025 - 14:00 IST • Escrow account audited & pre-funded: <strong>₹43.80 Cr</strong>
            </p>
          </div>
        </div>

        <div className="fund-banner-actions">
          <button
            className="fund-btn-dark-glass"
            onClick={handleInspectDockets}
            data-testid="button-inspect-dockets"
          >
            <span>Inspect 342 Dockets</span>
          </button>
          <button
            className="fund-btn-solid-teal"
            onClick={handleAuthorizeDsc}
            data-testid="button-authorize-dsc"
          >
            <Lock size={14} />
            <span>Authorize via e-Mudhra DSC</span>
          </button>
        </div>
      </div>

      {/* 6. Detailed Project-wise Financial Disbursement Table */}
      <div className="fund-card" data-testid="card-project-table">
        <div className="fund-card-header">
          <div>
            <h2 className="fund-card-title">Detailed Project-wise Financial Disbursement Table</h2>
            <p className="fund-card-subtitle">Statutory tracking under Section 77 & 80 of the RFCTLARR Act (2013)</p>
          </div>
          <div className="fund-table-controls">
            <button
              className="fund-ctrl-btn"
              onClick={() => {
                setFilterCorridor((prev) => (prev === 'all' ? 'warning' : 'all'));
                triggerNotify(filterCorridor === 'all' ? 'Filtering at-risk corridors' : 'Showing all corridors');
              }}
              data-testid="button-filter-corridors"
            >
              <Filter size={13} />
              <span>Filter Corridors</span>
            </button>
            <button
              className="fund-ctrl-btn"
              onClick={() => triggerNotify('Financial CSV export generated.')}
              data-testid="button-export-csv"
            >
              <FileSpreadsheet size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="fund-table-wrap">
          <table className="fund-table">
            <thead>
              <tr>
                <th style={{ width: '26%' }}>PROJECT & IMPLEMENTING AGENCY</th>
                <th style={{ width: '12%', textAlign: 'right' }}>TOTAL OUTLAY</th>
                <th style={{ width: '16%' }}>DISBURSED (DBT)</th>
                <th style={{ width: '13%', textAlign: 'right' }}>PENDING BANK VERIFY</th>
                <th style={{ width: '13%', textAlign: 'right' }}>COURT ESCROW DEPOSIT</th>
                <th style={{ width: '11%', textAlign: 'right' }}>INTEREST IMPACT</th>
                <th style={{ width: '12%', textAlign: 'center' }}>TRANCHE STATUS</th>
                <th style={{ width: '5%', textAlign: 'center' }}>AUDIT</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((row) => (
                <tr
                  key={row.id}
                  className={`fund-tr ${selectedProjectRow === row.id ? 'row-selected' : ''}`}
                  onClick={() => {
                    setSelectedProjectRow(row.id);
                    triggerNotify(`Selected: ${row.name}`);
                  }}
                  data-testid={`row-project-${row.id}`}
                >
                  {/* Column 1: Project & Agency */}
                  <td>
                    <div className="fund-proj-cell">
                      <span className={`fund-dot-status dot-${row.statusTone}`} />
                      <div>
                        <div className="fund-proj-name">{row.name}</div>
                        <div className="fund-proj-meta">{row.agency} • {row.subtext}</div>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Total Outlay */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="fund-val-bold">₹{row.totalOutlay.toFixed(2)} Cr</div>
                  </td>

                  {/* Column 3: Disbursed (DBT) */}
                  <td>
                    <div className="fund-disbursed-cell">
                      <div className="fund-disbursed-top">
                        <span className="fund-val-bold">₹{row.disbursedDbt.toFixed(2)} Cr</span>
                        <span className="fund-disbursed-pct">{row.disbursedPct}% completed</span>
                      </div>
                      <div className="fund-micro-track">
                        <div
                          className="fund-micro-fill"
                          style={{
                            width: `${row.disbursedPct}%`,
                            background: row.disbursedPct > 80 ? '#16A878' : row.disbursedPct > 60 ? '#0FA89A' : '#F2A51A'
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Column 4: Pending Bank Verify */}
                  <td style={{ textAlign: 'right' }}>
                    <div className={`fund-val-mono ${row.pendingIsWarning ? 'text-red' : ''}`}>
                      ₹{row.pendingVerify.toFixed(2)} Cr
                    </div>
                  </td>

                  {/* Column 5: Court Escrow Deposit */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="fund-val-mono muted-val">
                      (₹{row.courtEscrow.toFixed(2)} Cr)
                    </div>
                  </td>

                  {/* Column 6: Interest Impact */}
                  <td style={{ textAlign: 'right' }}>
                    <div className={`fund-impact-badge impact-${row.interestType}`}>
                      {row.interestType === 'saved' ? `+ ₹${row.interestImpact.toFixed(1)} Cr Saved` : `- ₹${row.interestImpact.toFixed(1)} Cr Risk`}
                    </div>
                  </td>

                  {/* Column 7: Tranche Status */}
                  <td style={{ textAlign: 'center' }}>
                    <span className={`fund-status-pill status-${row.statusTone}`}>
                      ● {row.trancheStatus}
                    </span>
                  </td>

                  {/* Column 8: Audit */}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="fund-audit-icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerNotify(`Cryptographic audit packet opened for ${row.name}`);
                      }}
                      title="Inspect Cryptographic Audit Seal"
                      data-testid={`btn-audit-${row.id}`}
                    >
                      <Shield size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Reconciliation Banner */}
        <div className="fund-table-reconciliation">
          <div className="fund-recon-left">
            <span>Active Tracked Capital: <strong>₹7,650.00 Cr</strong> (5 Corridors Displayed)</span>
            <span className="fund-recon-divider">|</span>
            <span>Reconciliation Frequency: <strong>Daily 23:59 IST</strong></span>
          </div>
          <div className="fund-recon-right">
            <span className="fund-opt-label">NET SECTION 80 INTEREST OPTIMIZATION:</span>
            <span className="fund-opt-badge">+ ₹51.10 Cr Saved</span>
          </div>
        </div>
      </div>

      {/* 7. Bottom Auxiliary Dual-Card Grid */}
      <div className="fund-bottom-grid">
        {/* Left: High Court & Land Tribunal Escrows (Sec 77) */}
        <div className="fund-card" data-testid="card-escrows-sec77">
          <div className="fund-card-header">
            <div>
              <h2 className="fund-card-title">High Court & Land Tribunal Escrows (Sec 77)</h2>
              <p className="fund-card-subtitle">Statutory deposits held in interest-bearing treasury accounts during title litigation or partition challenges.</p>
            </div>
            <div className="fund-escrow-total">₹1,240.00 Cr Total</div>
          </div>

          <div className="fund-escrow-list">
            {/* Escrow Item 1 */}
            <div className="fund-escrow-item">
              <div className="fund-escrow-row-top">
                <span className="fund-escrow-name">Principal District Court Escrow, Surat</span>
                <span className="fund-escrow-amt">₹612.4 Cr</span>
              </div>
              <div className="fund-escrow-meta">
                <span>156 cases • 482.5 Ha commercial peri-urban zone</span>
                <span className="fund-yield-tag">Yield: 6.8% SBI Term</span>
              </div>
            </div>

            {/* Escrow Item 2 */}
            <div className="fund-escrow-item">
              <div className="fund-escrow-row-top">
                <span className="fund-escrow-name">Gujarat High Court Registry Special Escrow</span>
                <span className="fund-escrow-amt">₹380.6 Cr</span>
              </div>
              <div className="fund-escrow-meta">
                <span>42 writ petitions • Bullet Train acquisition objections</span>
                <span className="fund-yield-tag">Yield: 7.1% PNB Term</span>
              </div>
            </div>

            {/* Escrow Item 3 */}
            <div className="fund-escrow-item">
              <div className="fund-escrow-row-top">
                <span className="fund-escrow-name">Competent Authority Land Acquisition (CALA) Anand</span>
                <span className="fund-escrow-amt">₹247.0 Cr</span>
              </div>
              <div className="fund-escrow-meta">
                <span>84 heirship succession certificates pending</span>
                <span className="fund-yield-tag">Yield: 6.6% BoB Term</span>
              </div>
            </div>
          </div>

          <div className="fund-card-footnote">
            <span className="fund-sla-text">Court Disbursement Release SLA: <strong>Avg 18 days post judgment</strong></span>
            <button
              className="fund-link-btn"
              onClick={() => triggerNotify('Opening Judicial Escrow Registry...')}
              data-testid="link-view-docket-registry"
            >
              <span>View Docket Registry</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        {/* Right: Statutory Treasury Compliance & Audit Guardrails */}
        <div className="fund-card" data-testid="card-audit-guardrails">
          <div className="fund-card-header">
            <div>
              <h2 className="fund-card-title">Statutory Treasury Compliance & Audit Guardrails</h2>
              <p className="fund-card-subtitle">Continuous cryptographic audit trail ensuring compliance with section 80 (Mandatory Interest upon delayed possession).</p>
            </div>
            <span className="fund-badge-cag">CAG AUDIT COMPLIANT</span>
          </div>

          <div className="fund-compliance-list">
            {/* Compliance Point 1 */}
            <div className="fund-compliance-item">
              <div className="fund-comp-icon check-teal">
                <CheckCircle2 size={16} />
              </div>
              <div className="fund-comp-content">
                <div className="fund-comp-title">Solatium Computation Audit (100% Statutory Markup)</div>
                <div className="fund-comp-desc">
                  All 48,200 issued awards rigorously calculated with equal 100% Solatium plus 12% additional market value.
                </div>
              </div>
            </div>

            {/* Compliance Point 2 */}
            <div className="fund-compliance-item">
              <div className="fund-comp-icon check-teal">
                <CheckCircle2 size={16} />
              </div>
              <div className="fund-comp-content">
                <div className="fund-comp-title">Biometric Aadhaar Authentication on Final DBT Release</div>
                <div className="fund-comp-desc">
                  Gram Panchayat e-Seva physical biometrics or KYC cross-checked with State RoR revenue records.
                </div>
              </div>
            </div>

            {/* Compliance Point 3 (Alert) */}
            <div className="fund-compliance-item item-alert">
              <div className="fund-comp-icon alert-red">
                <AlertTriangle size={16} />
              </div>
              <div className="fund-comp-content">
                <div className="fund-comp-title text-red">Interest Liability Alert: 5 Parcels exceeding 365 Days</div>
                <div className="fund-comp-desc">
                  Possession taken under Section 38 with pending court settlement. Escalated to Principal Revenue Secretary.
                </div>
              </div>
            </div>
          </div>

          <div className="fund-card-footnote">
            <span className="fund-sla-text">Comptroller and Auditor General (CAG) Ledger Sync: <strong>Today 08:30 IST</strong></span>
            <button
              className="fund-btn-outline-soft"
              onClick={handleDownloadSec80}
              data-testid="button-download-sec80-cert"
            >
              <Download size={13} />
              <span>Download Sec 80 Cert</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
