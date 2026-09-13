import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Activity, AlertCircle, ArrowDownRight, ArrowUpRight, BarChart2, BarChart3, Bell, BookOpen, Briefcase, BriefcaseBusiness,
  Building2, Check, CheckCircle2, ChevronDown, CircleHelp, ClipboardList, Clock3, Command, Cpu, Download,
  ExternalLink, FileCheck2, FileSearch2, FileText, Filter, Gauge, Globe2, Landmark, LayoutDashboard,
  ListFilter, LockKeyhole, Map as MapIcon, MapPinned, Menu, Moon, MoreHorizontal, Network, PanelLeftClose,
  Search, Send, Server, Settings2, ShieldAlert, SlidersHorizontal, Sparkles, Sun, Target, TrendingDown,
  TrendingUp, Users, WalletCards, X, Zap, Route as RouteIcon,
} from 'lucide-react';
import { Link, Route, Switch, useLocation, useParams, Router as WouterRouter } from 'wouter';
import {
  alerts, assessments, benchmarks, briefing, districts, financials, getProject, interventions, projects,
  auditEntries, corridors, roles, sessionTrust, type Alert, type AuditEntry, type Project, type RiskLevel,
} from '@/lib/mockData';
import { CorridorGisView } from '@/components/corridor-gis-view';
import { IntelligenceModulesView } from '@/components/intelligence-modules-view';
import { Project360View } from '@/components/project-360-view';
import { FundTrackingView } from '@/components/fund-tracking-view';
import { StateBenchmarkingView } from '@/components/state-benchmarking-view';
import { syncRealtimeDataToBackend } from '@/lib/syncService';
import { ProjectIndicatorMatrixModal } from '@/components/project-indicator-matrix-modal';
import { LoginPage } from '@/components/login-page';

const queryClient = new QueryClient();

const navTabs = [
  { href: '/', label: 'Command center', icon: LayoutDashboard },
  { href: '/corridor-map', label: 'National corridor map', icon: RouteIcon },
  { href: '/district-diagnostics', label: 'District diagnostics', icon: BarChart3 },
  { href: '/early-warning', label: 'Early warning center', icon: ShieldAlert },
  { href: '/fund-tracking', label: 'Fund tracking', icon: WalletCards },
  { href: '/project/p-004', label: 'Projects 360', icon: Network },
  { href: '/intelligence', label: 'Intelligence modules', icon: Cpu },
  { href: '/state-benchmarking', label: 'State benchmarking', icon: BarChart2 },
];

const allNavItems = [
  ...navTabs,
  { href: '/policy-briefing', label: 'Policy briefing', icon: FileText },
  { href: '/settings', label: 'Settings & access', icon: Settings2 },
  { href: '/audit-log', label: 'Audit log', icon: ClipboardList },
  { href: '/login', label: 'Official Login Portal', icon: LockKeyhole },
];

function riskClass(level: RiskLevel | string) {
  const l = level.toLowerCase();
  return `tag risk-${l === 'critical' ? 'critical' : l === 'high' ? 'high' : l === 'moderate' ? 'moderate' : l === 'low' ? 'low' : 'info'}`;
}
function StatusTag({ level }: { level: RiskLevel | string }) { return <span className={riskClass(level)} data-testid={`status-${level.toLowerCase()}`}>{level}</span>; }
function Sparkline({ values, color = '#0FA89A' }: { values: number[]; color?: string }) {
  const max = Math.max(...values); const min = Math.min(...values); const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${36 - ((value - min) / Math.max(max - min, 1)) * 28}`).join(' ');
  return <svg className="sparkline" viewBox="0 0 100 40" preserveAspectRatio="none" aria-label="Trend line"><polyline points={points} fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return <header className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 18, marginBottom: 24, flexWrap: 'wrap' }}>
    <div><div className="eyebrow">{eyebrow}</div><h1 className="display" style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', margin: '6px 0 6px' }}>{title}</h1><p className="muted" style={{ fontSize: 13.5, margin: 0, maxWidth: 680 }}>{description}</p></div>
    {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>{actions}</div>}
  </header>;
}
function Section({ title, subtitle, children, action }: { title: string; subtitle?: string; children: ReactNode; action?: ReactNode }) {
  return <section className="surface surface-pad reveal"><div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}><div><h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#102A43', letterSpacing: '-.02em' }}>{title}</h2>{subtitle && <p className="muted tiny" style={{ margin: '4px 0 0' }}>{subtitle}</p>}</div>{action}</div>{children}</section>;
}
function Kpi({ label, value, note, trend, icon: Icon, tone = 'ocean' }: { label: string; value: string; note: string; trend?: 'up' | 'down'; icon: typeof Activity; tone?: string }) {
  const toneMap: Record<string, { color: string; bg: string }> = {
    ocean: { color: '#0FA89A', bg: '#EDF6F5' },
    emerald: { color: '#16A878', bg: '#E8F7F1' },
    warning: { color: '#D98A08', bg: '#FEF5E7' },
    danger: { color: '#E85D68', bg: '#FDECEE' },
    info: { color: '#5BA7D9', bg: '#EEF6FB' },
    accent: { color: '#D98A08', bg: '#FEF5E7' },
    destructive: { color: '#E85D68', bg: '#FDECEE' },
    'chart-4': { color: '#16A878', bg: '#E8F7F1' },
    primary: { color: '#0FA89A', bg: '#EDF6F5' },
  };
  const currentTone = toneMap[tone] || toneMap.ocean;
  return <div className="surface surface-pad" data-testid={`kpi-${label.toLowerCase().replaceAll(' ', '-')}`}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span className="eyebrow">{label}</span><span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', borderRadius: 8, color: currentTone.color, background: currentTone.bg }}><Icon size={16} /></span></div><div className="stat-value" style={{ marginTop: 12 }}>{value}</div><div className="tiny muted" style={{ display: 'flex', gap: 5, alignItems: 'center', marginTop: 8 }}>{trend === 'up' ? <ArrowUpRight size={13} color={currentTone.color} /> : trend === 'down' ? <ArrowDownRight size={13} color={currentTone.color} /> : null}{note}</div></div>;
}
function MiniBars({ values, labels, colors = ['#0FA89A', '#064C55', '#16A878', '#F2A51A'] }: { values: number[]; labels: string[]; colors?: string[] }) {
  const total = values.reduce((sum, value) => sum + value, 0);
  return <div>{values.map((value, index) => <div key={labels[index]} style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 1.2fr) 2fr 42px', alignItems: 'center', gap: 10, marginBottom: 12 }}><span className="tiny" style={{ color: '#102A43', fontWeight: 500 }}>{labels[index]}</span><div className="bar-track"><div className="bar-fill" style={{ width: `${(value / Math.max(...values)) * 100}%`, background: colors[index % colors.length] }} /></div><span className="tiny mono" style={{ textAlign: 'right', color: '#526B82', fontWeight: 600 }}>{total ? `${Math.round((value / total) * 100)}%` : '0%'}</span></div>)}</div>;
}
function MapPanel({ selected, onSelect }: { selected?: string; onSelect?: (name: string) => void }) {
  return <div className="india-map map-grid" data-testid="map-state-intelligence"><div style={{ position: 'absolute', left: 16, top: 14, zIndex: 2 }}><div className="eyebrow" style={{ color: '#526B82' }}>Geographic intelligence</div><div style={{ fontSize: 13, fontWeight: 700, color: '#102A43', marginTop: 2 }}>Risk concentration by district</div></div>{districts.map((district) => <button key={district.id} className="map-dot" aria-label={`Inspect ${district.name}, ${district.riskRate}% at risk`} title={`${district.name}: ${district.riskRate}% at risk`} onClick={() => onSelect?.(district.name)} style={{ left: `${district.mapPosition.x}%`, top: `${district.mapPosition.y}%`, background: district.riskRate > 35 ? '#E85D68' : district.riskRate > 25 ? '#F2A51A' : '#16A878', outline: selected === district.name ? '3px solid #0FA89A' : 'none' }} data-testid={`map-dot-${district.id}`} />)}<div style={{ position: 'absolute', bottom: 12, left: 14, display: 'flex', gap: 12, background: 'rgba(255, 255, 255, 0.95)', border: '1px solid #D8E8E6', padding: '6px 10px', borderRadius: 8, fontSize: 11, color: '#102A43' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><i style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#E85D68' }} />High risk</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><i style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#16A878' }} />Stable</span></div></div>;
}
function AppShell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [palette, setPalette] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [dark, setDark] = useState(() => window.localStorage.getItem('bhoomi-theme') === 'dark');

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPalette(true);
      }
      if (event.key === 'Escape') setPalette(false);
    };
    const openAiListener = () => setAiModalOpen(true);
    window.addEventListener('keydown', listener);
    window.addEventListener('bhoomi-open-ai-assist', openAiListener);
    return () => {
      window.removeEventListener('keydown', listener);
      window.removeEventListener('bhoomi-open-ai-assist', openAiListener);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    window.localStorage.setItem('bhoomi-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const notify = (message: string) => setToast(message);

  return (
    <div className="app-shell">
      <header className="top-header">
        <div className="top-tier-1">
          <div className="top-tier-1-inner">
            <div className="brand-section">
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="logo-box">
                  <Landmark size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="brand-name">BhoomiSetu</span>
                    <span className="network-badge">LAND INTELLIGENCE NETWORK</span>
                  </div>
                  <div className="brand-subtext">LAND INTELLIGENCE NETWORK</div>
                </div>
              </Link>
            </div>

            <div className="search-section" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                className="search-capsule"
                onClick={() => setPalette(true)}
                data-testid="button-global-search"
                style={{ flex: 1 }}
              >
                <Search size={16} />
                <span className="search-placeholder">Search projects, districts, alerts...</span>
                <span className="search-kbd">⌘ K</span>
              </button>

              <button
                className="ai-assist-btn"
                onClick={() => setAiModalOpen(true)}
                data-testid="button-ai-assist"
                title="Open Project Indicator Matrix & AI Prediction Model"
              >
                <Sparkles size={15} />
                <span>AI Assist</span>
              </button>
            </div>

            <div className="right-section">
              <div className="status-indicator">
                <div className="status-title-row">
                  <span className="status-dot" />
                  <span className="status-title">State-Control Room</span>
                </div>
                <div className="status-subtext">Operational • 12 Jun 2025, 10:42 IST</div>
              </div>

              <button
                className="icon-btn"
                onClick={() => setDark((value) => !value)}
                aria-label={dark ? 'Use light theme' : 'Use dark theme'}
                data-testid="button-toggle-theme"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button
                className="icon-btn"
                onClick={() => notify('Operational status: Normal. All monitoring channels synced.')}
                aria-label="Notifications"
                data-testid="button-notifications"
              >
                <Bell size={18} />
                <span className="notification-dot" />
              </button>

              <Link
                href="/login"
                className="user-avatar"
                title="R. K. Shah • Click to Switch Account / Open Login Portal"
                style={{ textDecoration: 'none', cursor: 'pointer' }}
                data-testid="button-user-login-profile"
              >
                RK
              </Link>
            </div>
          </div>
        </div>

        <div className="top-tier-2">
          <nav className="nav-tabs">
            {navTabs.map(({ href, label, icon: Icon }) => {
              const isActive = href === '/' ? location === '/' : location.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav-tab ${isActive ? 'active' : ''}`}
                  data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="main-content">{children}</main>

      <footer className="app-footer">
        <div className="app-footer-inner">
          <div>
            <span className="footer-brand">BhoomiSetu</span>
            <span className="footer-dot">•</span>
            <span>CAG Infrastructure Decision Protocol v4.2</span>
          </div>
          <div className="footer-right">
            <LockKeyhole size={13} />
            <span>Encrypted StateLink-256-bit</span>
            <span className="footer-dot">•</span>
            <Server size={13} />
            <span>Server Node: Western Grid (Gandhinagar)</span>
          </div>
        </div>
      </footer>

      {palette && (
        <CommandPalette
          commands={allNavItems}
          onClose={() => setPalette(false)}
          onNavigate={(href) => {
            setPalette(false);
            setLocation(href);
          }}
        />
      )}

      {toast && (
        <div className="toast-note" role="status" data-testid="status-toast">
          <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
            <Check size={17} color="#16A878" />
            <div style={{ fontSize: 13 }}>{toast}</div>
            <button
              onClick={() => setToast('')}
              className="icon-btn"
              style={{ width: 20, height: 20, marginLeft: 8, padding: 0 }}
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {aiModalOpen && (
        <ProjectIndicatorMatrixModal onClose={() => setAiModalOpen(false)} />
      )}
    </div>
  );
}
function CommandPalette({ commands, onClose, onNavigate }: { commands: Array<{ href: string; label: string; icon: any }>; onClose: () => void; onNavigate: (href: string) => void }) {
  const [query, setQuery] = useState('');
  const filtered = commands.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="command-overlay" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <div className="command-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid #D8E8E6' }}>
          <Command size={16} color="#526B82" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Jump to a view…"
            style={{ flex: 1, border: 0, background: 'transparent', outline: 0, color: '#102A43', fontSize: 14 }}
            data-testid="input-command-search"
          />
          <span className="search-kbd">ESC</span>
        </div>
        <div style={{ padding: 8 }}>
          {filtered.map(({ href, label, icon: Icon }) => (
            <button
              key={href}
              onClick={() => onNavigate(href)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '11px 10px', border: 0, borderRadius: 7, background: 'transparent', color: '#102A43', textAlign: 'left' }}
              data-testid={`command-${label.toLowerCase().replaceAll(' ', '-')}`}
            >
              <Icon size={16} color="#0FA89A" />
              <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#78909C' }}>Open view</span>
            </button>
          ))}
          {!filtered.length && <div style={{ padding: 22, textAlign: 'center', fontSize: 13, color: '#78909C' }}>No matching operational view.</div>}
        </div>
      </div>
    </div>
  );
}

function Overview() {
  const [, setLocation] = useLocation();
  const [district, setDistrict] = useState('All districts');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const handleSyncTelemetry = async () => {
    try {
      setIsSyncing(true);
      setSyncNotice('Syncing telemetry to backend dataset & database...');
      const res = await syncRealtimeDataToBackend();
      if (res.success) {
        setSyncNotice(`Synced to DB & Dataset created! (${res.counts?.projects ?? 0} projects, ${res.counts?.districts ?? 0} districts)`);
      } else {
        setSyncNotice(`Sync warning: ${res.message} ${res.error ? `(${res.error})` : ''}`);
      }
    } catch (e: any) {
      setSyncNotice(`Sync error: ${e?.message || e}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncNotice(null), 5000);
    }
  };

  return (
    <div className="page-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 26, flexWrap: 'wrap' }}>
        <div>
          <div className="eyebrow-container">
            <span className="green-dot" />
            <span className="eyebrow-text">STATE COMMAND • 12 JUNE 2025</span>
          </div>
          <h1 className="overview-title">Acquisition health, at a glance.</h1>
          <p className="overview-description">
            A live decision layer across 68 monitored projects. Start with the signal, inspect the cause, then assign the next move.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="district-dropdown-container">
            <select
              className="district-select"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              data-testid="select-overview-district"
            >
              <option>All districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="dropdown-arrow" />
          </div>

          <button
            onClick={handleSyncTelemetry}
            disabled={isSyncing}
            className="create-briefing-btn"
            style={{
              background: isSyncing ? '#526B82' : '#0FA89A',
              color: '#FFFFFF',
              border: 'none',
              cursor: isSyncing ? 'not-allowed' : 'pointer'
            }}
            data-testid="button-sync-cloud-db"
            title="Upload realtime frontend telemetry to backend dataset & Supabase DB"
          >
            <Zap size={16} />
            <span>{isSyncing ? 'Syncing...' : 'Sync to Cloud DB'}</span>
          </button>

          <Link href="/policy-briefing" className="create-briefing-btn" data-testid="link-create-briefing">
            <FileText size={16} />
            <span>Create briefing</span>
          </Link>
        </div>
      </div>

      <div className="grid-kpis">
        <div className="kpi-card kpi-card-monitored" data-testid="kpi-monitored-projects">
          <div className="kpi-top">
            <span className="kpi-label" style={{ color: '#16A878' }}>MONITORED PROJECTS</span>
            <div className="kpi-icon-badge" style={{ background: '#E8F7F1', color: '#16A878' }}>
              <Briefcase size={17} />
            </div>
          </div>
          <div className="kpi-stat-value">68</div>
          <div className="kpi-note" style={{ color: '#16A878' }}>
            <span style={{ fontWeight: 700 }}>↗ +6</span>
            <span style={{ color: '#526B82', marginLeft: 4 }}>since last quarter</span>
          </div>
        </div>

        <div className="kpi-card kpi-card-risk" data-testid="kpi-at-risk-projects">
          <div className="kpi-top">
            <span className="kpi-label" style={{ color: '#D98A08' }}>AT-RISK PROJECTS</span>
            <div className="kpi-icon-badge" style={{ background: '#FEF5E7', color: '#F2A51A' }}>
              <ShieldAlert size={17} />
            </div>
          </div>
          <div className="kpi-stat-value">24</div>
          <div className="kpi-note" style={{ color: '#D98A08' }}>
            <span>35.3% of portfolio</span>
          </div>
        </div>

        <div className="kpi-card kpi-card-delay" data-testid="kpi-predicted-delay-exposure">
          <div className="kpi-top">
            <span className="kpi-label" style={{ color: '#E85D68' }}>PREDICTED DELAY EXPOSURE</span>
            <div className="kpi-icon-badge" style={{ background: '#FDECEE', color: '#E85D68' }}>
              <Clock3 size={17} />
            </div>
          </div>
          <div className="kpi-stat-value">₹184.6 Cr</div>
          <div className="kpi-note" style={{ color: '#E85D68' }}>
            <span style={{ fontWeight: 700 }}>↗ ₹28.4 Cr</span>
            <span style={{ marginLeft: 4 }}>higher than May</span>
          </div>
        </div>

        <div className="kpi-card kpi-card-active" data-testid="kpi-interventions-active">
          <div className="kpi-top">
            <span className="kpi-label" style={{ color: '#0FA89A' }}>INTERVENTIONS ACTIVE</span>
            <div className="kpi-icon-badge" style={{ background: '#EDF6F5', color: '#0FA89A' }}>
              <Target size={17} />
            </div>
          </div>
          <div className="kpi-stat-value">17</div>
          <div className="kpi-note" style={{ color: '#0FA89A' }}>
            <span style={{ fontWeight: 700 }}>↓ 11</span>
            <span style={{ color: '#526B82', marginLeft: 4 }}>owners assigned</span>
          </div>
        </div>
      </div>

      <div className="grid-main">
        <div className="surface surface-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#102A43', letterSpacing: '-0.02em' }}>
                State risk pulse
              </h2>
              <div style={{ fontSize: 13, color: '#526B82', marginTop: 4 }}>
                Real-time risk delta by acquisition • Trailing 6 weeks
              </div>
            </div>
            <Link
              href="/district-diagnostics"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#0FA89A' }}
              data-testid="link-view-diagnostics"
            >
              <span>View diagnostics</span>
              <ExternalLink size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 28, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: '#102A43', letterSpacing: '-0.03em' }}>35.3%</span>
                <span className="pulse-stat-badge">
                  <ArrowUpRight size={12} strokeWidth={2.5} />
                  <span>4.8 pts</span>
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#526B82', marginTop: 4, marginBottom: 12 }}>
                Projects with a leading indicator of delay
              </div>

              <div style={{ height: 110, position: 'relative' }}>
                <svg viewBox="0 0 400 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="mintWaveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0FA89A" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#0FA89A" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0,95 Q 60,90 110,92 T 210,82 T 310,72 T 400,50 L 400,120 L 0,120 Z"
                    fill="url(#mintWaveGrad)"
                  />
                  <path
                    d="M 0,95 Q 60,90 110,92 T 210,82 T 310,72 T 400,50"
                    fill="none"
                    stroke="#0FA89A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#78909C', marginTop: 6 }}>
                <span>May 01</span>
                <span>Jun 12</span>
              </div>
            </div>

            <div style={{ paddingLeft: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#064C55', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                DELAY EXPOSURE
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#102A43', marginTop: 4, letterSpacing: '-0.03em' }}>
                ₹184.6 Cr
              </div>
              <div style={{ fontSize: 12.5, color: '#526B82', marginTop: 2, marginBottom: 18 }}>
                across high-risk projects
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr 34px', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, color: '#102A43', fontWeight: 500 }}>Compensation</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: '45%', background: '#064C55' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#102A43', textAlign: 'right' }}>45%</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr 34px', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, color: '#102A43', fontWeight: 500 }}>Legal</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: '32%', background: '#F2A51A' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#102A43', textAlign: 'right' }}>32%</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr 34px', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, color: '#102A43', fontWeight: 500 }}>Records</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: '23%', background: '#5BA7D9' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#102A43', textAlign: 'right' }}>23%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pulse-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: '#E8F7F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A878' }}>
                <TrendingUp size={16} />
              </div>
              <span style={{ fontSize: 12.5, color: '#102A43', fontWeight: 500 }}>
                Automated signal ingestion synced via BhoomiGIS Registry API
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#064C55' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A878', display: 'inline-block' }} />
              <span>Confidence: 98.2%</span>
            </div>
          </div>
        </div>

        <div className="surface surface-pad" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#EDF6F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0FA89A', flexShrink: 0 }}>
                <Zap size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#102A43', letterSpacing: '-0.02em' }}>
                  Next actions
                </h2>
                <div style={{ fontSize: 13, color: '#526B82', marginTop: 3 }}>
                  Highest value moves in the next 72 hours
                </div>
              </div>
            </div>

            <div>
              <div className="action-item-row" data-testid="action-item-1">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F2A51A' }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#102A43', lineHeight: 1.3 }}>
                    Clear Kutch liter review docket
                  </div>
                  <div style={{ fontSize: 12, color: '#526B82', marginTop: 3 }}>
                    Legal Cell – Kutch • due 18 Jun 2025
                  </div>
                </div>
                <span className="action-tag-open">Open</span>
              </div>

              <div className="action-item-row" data-testid="action-item-2">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A878' }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#102A43', lineHeight: 1.3 }}>
                    Release verified compenstation tranche
                  </div>
                  <div style={{ fontSize: 12, color: '#526B82', marginTop: 3 }}>
                    Finance – Anand • due 22 Jun 2025
                  </div>
                </div>
                <span className="action-tag-progress">In progress</span>
              </div>

              <div className="action-item-row" data-testid="action-item-3">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A878' }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#102A43', lineHeight: 1.3 }}>
                    Reconcile Bharuch village registers
                  </div>
                  <div style={{ fontSize: 12, color: '#526B82', marginTop: 3 }}>
                    Revenue – Bharuch • due 26 Jun 2025
                  </div>
                </div>
                <span className="action-tag-progress">In progress</span>
              </div>
            </div>
          </div>

          <button
            className="review-alerts-btn"
            onClick={() => setLocation('/early-warning')}
            data-testid="button-review-alerts"
          >
            <ListFilter size={16} />
            <span>Review all alerts</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {syncNotice && (
        <div className="toast-note" role="status" data-testid="status-sync-toast" style={{ bottom: 32, right: 32 }}>
          <Check size={16} color="#16A878" /> {syncNotice}
        </div>
      )}
    </div>
  );
}

function Diagnostics() {
  const [selected, setSelected] = useState('Kutch'); const sorted = [...districts].sort((a, b) => b.riskRate - a.riskRate);
  return <div className="page-wrap"><PageHeader eyebrow="Diagnostics · comparative view" title="Where is friction accumulating?" description="District-level patterns turn portfolio noise into a prioritised field plan." actions={<button className="btn btn-soft" onClick={() => window.print()} data-testid="button-print-diagnostics"><Download size={14} /> Export diagnostic</button>} /><div className="grid-kpis" style={{ marginBottom: 16 }}><Kpi label="State risk rate" value="35.3%" note="↑ 4.8 pts in 6 weeks" trend="up" icon={Gauge} tone="accent" /><Kpi label="Median delay" value="3.8 mo" note="Across at-risk projects" icon={Clock3} /><Kpi label="Highest exposure" value="Khurda" note="38.9% risk rate" icon={MapIcon} tone="destructive" /><Kpi label="Districts improving" value="2 / 5" note="Ahmedabad, Mandya" trend="down" icon={TrendingDown} tone="chart-4" /></div><div className="grid-main" style={{ marginBottom: 16 }}><Section title="District ranking" subtitle="Normalised risk rate · click a row to inspect"><div className="table-wrap"><table className="data-table" style={{ minWidth: 620 }}><thead><tr><th>Rank</th><th>District</th><th>Risk rate</th><th>Avg delay</th><th>6-wk trend</th></tr></thead><tbody>{sorted.map((item, index) => <tr key={item.id} onClick={() => setSelected(item.name)} style={{ cursor: 'pointer', background: selected === item.name ? '#EDF6F5' : undefined }} data-testid={`row-district-${item.id}`}><td className="mono muted">0{index + 1}</td><td><strong>{item.name}</strong><div className="tiny muted">{item.atRiskProjects} of {item.monitoredProjects} projects at risk</div></td><td><strong>{item.riskRate}%</strong></td><td className="mono">{item.averageDelay} mo</td><td style={{ width: 110 }}><Sparkline values={item.trend} color={item.riskRate > 35 ? '#E85D68' : '#0FA89A'} /></td></tr>)}</tbody></table></div></Section><Section title="Geographic concentration" subtitle={selected ? `Selected district: ${selected}` : 'Select a district'}><MapPanel selected={selected} onSelect={setSelected} /><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 13 }}><div><div className="eyebrow">At-risk projects</div><div className="stat-value" style={{ fontSize: 24, marginTop: 5 }}>{districts.find((item) => item.name === selected)?.atRiskProjects ?? 0}</div></div><div><div className="eyebrow">Legal cases</div><div className="stat-value" style={{ fontSize: 24, marginTop: 5 }}>{districts.find((item) => item.name === selected)?.legalCases ?? 0}</div></div></div></Section></div><div className="grid-thirds"><Section title="Risk distribution" subtitle="All monitored projects"><MiniBars values={[8, 16, 20, 24]} labels={['Critical', 'High', 'Moderate', 'Low']} colors={['#E85D68', '#F2A51A', '#5BA7D9', '#16A878']} /></Section><Section title="Delay trajectory" subtitle="State average · months"><div style={{ display: 'flex', alignItems: 'end', gap: 7, height: 110 }}>{[3.1, 3.4, 3.2, 3.7, 4.1, 4.4].map((value, index) => <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}><div style={{ height: `${value * 18}px`, width: '100%', background: index > 3 ? '#0FA89A' : '#D8E8E6', borderRadius: '4px 4px 0 0' }} /><span className="tiny muted">{['W1', 'W2', 'W3', 'W4', 'W5', 'W6'][index]}</span></div>)}</div></Section><Section title="Field coverage" subtitle="Data freshness by district"><div style={{ display: 'grid', gap: 11 }}>{districts.slice(0, 3).map((item) => <div key={item.id}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}><span>{item.name}</span><span className="mono tiny muted">{item.name === 'Khurda' ? '91%' : item.name === 'Saharsa' ? '84%' : '78%'}</span></div><div className="bar-track"><div className="bar-fill" style={{ width: item.name === 'Khurda' ? '91%' : item.name === 'Saharsa' ? '84%' : '78%', background: '#0FA89A' }} /></div></div>)}</div></Section></div></div>;
}

function EarlyWarning() {
  const [category, setCategory] = useState('All categories'); const [severity, setSeverity] = useState('All severity'); const [status, setStatus] = useState('All status'); const [selected, setSelected] = useState<Alert | null>(null); const [items, setItems] = useState(alerts);
  const filtered = items.filter((item) => (category === 'All categories' || item.category === category) && (severity === 'All severity' || item.severity === severity) && (status === 'All status' || item.status === status));
  const assign = (alert: Alert) => { setItems((current) => current.map((item) => item.id === alert.id ? { ...item, status: 'Assigned' } : item)); setSelected({ ...alert, status: 'Assigned' }); };
  return <div className="page-wrap"><PageHeader eyebrow="Early warning · leading indicators" title="Intervene before the delay." description="Alerts are ranked by predicted schedule impact, confidence, and actionability. Every signal has a recommended field move." actions={<div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span className="tag risk-info"><Activity size={11} /> Model refreshed 12 min ago</span></div>} /><div className="surface surface-pad" style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}><div style={{ width: 175, position: 'relative' }}><Filter size={14} className="muted" style={{ position: 'absolute', left: 11, top: 12 }} /><select className="select" value={category} onChange={(event) => setCategory(event.target.value)} style={{ paddingLeft: 32 }} data-testid="select-alert-category"><option>All categories</option>{['Legal', 'Compensation', 'Documentation', 'Ownership', 'R&R'].map((item) => <option key={item}>{item}</option>)}</select></div><select className="select" style={{ width: 145 }} value={severity} onChange={(event) => setSeverity(event.target.value)} data-testid="select-alert-severity"><option>All severity</option>{['Critical', 'High', 'Moderate', 'Low'].map((item) => <option key={item}>{item}</option>)}</select><select className="select" style={{ width: 145 }} value={status} onChange={(event) => setStatus(event.target.value)} data-testid="select-alert-status"><option>All status</option>{['Open', 'Assigned', 'Monitoring'].map((item) => <option key={item}>{item}</option>)}</select><div style={{ marginLeft: 'auto', alignSelf: 'center' }} className="tiny muted">{filtered.length} signals in view</div></div><div className="grid-main"><Section title="Emerging signals" subtitle="Sorted by risk score × confidence"><div style={{ display: 'grid', gap: 8 }}>{filtered.map((item) => <button key={item.id} onClick={() => setSelected(item)} style={{ display: 'grid', gridTemplateColumns: '10px minmax(0, 1fr) auto', gap: 12, alignItems: 'start', padding: '13px 10px', textAlign: 'left', background: selected?.id === item.id ? '#EDF6F5' : 'transparent', border: '1px solid transparent', borderRadius: 8, color: 'inherit' }} data-testid={`alert-row-${item.id}`}><span style={{ width: 8, height: 8, marginTop: 5, borderRadius: '50%', background: item.severity === 'Critical' ? '#E85D68' : item.severity === 'High' ? '#F2A51A' : item.severity === 'Moderate' ? '#D98A08' : '#16A878' }} /><span style={{ minWidth: 0 }}><strong style={{ display: 'block', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#102A43' }}>{item.projectName}</strong><span className="tiny muted">{item.district} · {item.category} · {item.timestamp}</span><span style={{ display: 'block', marginTop: 8, fontSize: 12, color: '#526B82' }}>{item.primaryCause}</span></span><span style={{ display: 'grid', justifyItems: 'end', gap: 7 }}><StatusTag level={item.severity} /><span className="mono tiny muted">{item.confidence}% conf.</span></span></button>)}{!filtered.length && <div className="muted" style={{ padding: 28, textAlign: 'center' }}>No signals match these filters.</div>}</div></Section><Section title={selected ? 'Signal detail' : 'Select a signal'} subtitle={selected ? `${selected.category} pathway · ${selected.district}` : 'Choose an alert to inspect the explanation and next move'}>{selected ? <div className="reveal"><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'start' }}><div><div className="eyebrow">Predicted delay</div><div style={{ fontSize: 25, fontWeight: 700, marginTop: 5, color: '#102A43' }}>{selected.predictedDelay}</div></div><StatusTag level={selected.status === 'Assigned' ? 'Low' : selected.severity} /></div><div style={{ marginTop: 22, padding: 13, borderLeft: '3px solid #0FA89A', background: '#EDF6F5', fontSize: 13, lineHeight: 1.55 }}><strong>Primary cause</strong><br />{selected.primaryCause}</div><div style={{ marginTop: 20 }}><div className="eyebrow">Recommended intervention</div><p style={{ fontSize: 13, lineHeight: 1.5, margin: '7px 0 15px', color: '#526B82' }}>{selected.recommendedIntervention}</p><div style={{ display: 'flex', gap: 8 }}>{selected.status === 'Open' ? <button className="btn btn-primary" onClick={() => assign(selected)} data-testid="button-assign-intervention"><Target size={14} /> Accept & assign</button> : <button className="btn btn-soft" onClick={() => setSelected(null)} data-testid="button-close-alert"><Check size={14} /> {selected.status}</button>}<Link className="btn btn-secondary" href={`/project/${selected.projectId}`} data-testid="link-open-project">Open project <ExternalLink size={13} /></Link></div></div></div> : <div style={{ padding: '45px 12px', textAlign: 'center' }}><CircleHelp size={27} className="muted" /><p className="muted tiny">Select an alert from the list to see evidence and ownership.</p></div>}</Section></div></div>;
}

function Funds() {
  const [notice, setNotice] = useState('');
  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3200);
  };
  return (
    <div className="page-wrap">
      <FundTrackingView onNotify={notify} />
      {notice && (
        <div className="toast-note" role="status" data-testid="status-fund-toast">
          <Check size={16} color="#16A878" /> {notice}
        </div>
      )}
    </div>
  );
}

function Project360() {
  const [notice, setNotice] = useState('');
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 3200); };
  return (
    <div className="page-wrap">
      <Project360View onNotify={notify} />
      {notice && <div className="toast-note" role="status" data-testid="status-p360-toast"><Check size={16} color="#16A878" /> {notice}</div>}
    </div>
  );
}

function Intelligence() {
  const [notice, setNotice] = useState('');
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 3200); };
  return (
    <div className="page-wrap">
      <IntelligenceModulesView onNotify={notify} />
      {notice && <div className="toast-note" role="status" data-testid="status-intel-toast"><Check size={16} color="#16A878" /> {notice}</div>}
    </div>
  );
}


function PolicyBriefingPage() {
  const [scope, setScope] = useState('All monitored projects'); const [range, setRange] = useState('Last 30 days'); const [generating, setGenerating] = useState(false); const [generated, setGenerated] = useState(false); const [toast, setToast] = useState('');
  const generate = () => { setGenerating(true); window.setTimeout(() => { setGenerating(false); setGenerated(true); setToast('Briefing generated with current data.'); }, 1000); };
  return <div className="page-wrap"><PageHeader eyebrow="Policy briefing · decision packet" title="Turn the signal into a brief." description="Assemble a clear, defensible view for the weekly review. Every number carries a timestamp and confidence context." actions={<><button className="btn btn-soft" onClick={() => { navigator.clipboard?.writeText('BhoomiSetu policy briefing · 12 Jun 2025'); setToast('Briefing link copied to clipboard.'); }} data-testid="button-share-briefing"><Send size={14} /> Share</button><button className="btn btn-primary" onClick={() => { window.print(); setToast('Print / PDF export opened.'); }} data-testid="button-export-briefing"><Download size={14} /> Export PDF</button></>} /><div className="grid-main"><Section title="Briefing scope" subtitle="Set the lens before generating"><div style={{ display: 'grid', gap: 17 }}><label><span className="eyebrow" style={{ display: 'block', marginBottom: 7 }}>Portfolio scope</span><select className="select" value={scope} onChange={(event) => setScope(event.target.value)} data-testid="select-briefing-scope"><option>All monitored projects</option><option>Critical and high-risk projects</option><option>Eastern region districts</option><option>Projects with compensation exposure</option></select></label><label><span className="eyebrow" style={{ display: 'block', marginBottom: 7 }}>Time range</span><select className="select" value={range} onChange={(event) => setRange(event.target.value)} data-testid="select-briefing-range"><option>Last 30 days</option><option>Last 90 days</option><option>Current quarter</option></select></label><div style={{ marginTop: 5, padding: 13, background: '#EDF6F5', border: '1px solid #D8E8E6', borderRadius: 7, fontSize: 12, lineHeight: 1.5 }}><div className="eyebrow">Briefing will include</div><div style={{ marginTop: 8, display: 'grid', gap: 6 }}>{briefing.sections.map((section) => <div key={section} style={{ display: 'flex', gap: 7, alignItems: 'center', color: '#102A43' }}><Check size={13} color="#16A878" />{section}</div>)}</div></div><button className="btn btn-primary" onClick={generate} disabled={generating} data-testid="button-generate-briefing">{generating ? <><Activity size={14} /> Generating evidence…</> : <><Sparkles size={14} /> Generate briefing</>}</button></div></Section><Section title="Briefing preview" subtitle={generated ? `Generated just now · ${scope} · ${range}` : 'A preview will appear after generation'}>{generated ? <div className="reveal"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', paddingBottom: 15, borderBottom: '1px solid #D8E8E6' }}><div><div className="eyebrow">State acquisition health brief</div><h2 style={{ fontSize: 23, letterSpacing: '-.04em', margin: '7px 0 0', color: '#102A43' }}>{scope}</h2><div className="tiny muted" style={{ marginTop: 5 }}>Prepared 12 Jun 2025 · Data through 11 Jun 2025</div></div><div style={{ textAlign: 'right' }}><div className="eyebrow">Confidence</div><div style={{ fontSize: 21, fontWeight: 700, color: '#102A43' }}>{briefing.confidence}%</div></div></div><div style={{ marginTop: 18, display: 'grid', gap: 17 }}>{briefing.sections.map((section, index) => <div key={section}><div className="eyebrow">{`0${index + 1}`} · {section}</div><p style={{ fontSize: 12, lineHeight: 1.55, margin: '6px 0 0', color: '#526B82' }}>{index === 0 ? 'Risk rate has increased 4.8 points in six weeks. Compensation pendency is the clearest cross-district leading indicator.' : index === 1 ? 'Khurda and Saharsa account for 12 of 24 at-risk projects; both have accelerating risk trajectories.' : index === 2 ? '₹18.6 Cr remains pending in Khurda, with ₹6.2 Cr aged beyond 90 days.' : index === 3 ? 'Three new stay orders and fourteen mauza-level record mismatches require coordinated district response.' : 'Release the next compensation tranche, convene two payment camps, and escalate aged legal matters.'}</p></div>)}</div></div> : <div style={{ minHeight: 300, display: 'grid', placeItems: 'center', textAlign: 'center' }}><div><BookOpen size={32} className="muted" style={{ margin: '0 auto 12px' }} /><div style={{ fontSize: 13, color: '#102A43' }}>Your structured briefing will appear here.</div><div className="tiny muted" style={{ marginTop: 5 }}>Generation takes a few seconds and uses the latest model snapshot.</div></div></div>}</Section></div>{(toast || generating) && <div className="toast-note" role="status" data-testid="status-briefing-toast">{generating ? 'Assembling current indicators and evidence…' : toast}</div>}</div>;
}

function Benchmarking() {
  const [benchmark, setBenchmark] = useState(benchmarks[0]); const [selected, setSelected] = useState('Odisha');
  return <div className="page-wrap"><PageHeader eyebrow="State benchmarking · normalised comparison" title="Know the distance to better." description="Compare like-for-like performance, then drill into the district or state that needs the next decision." actions={<select className="select" style={{ width: 195 }} value={benchmark.metric} onChange={(event) => setBenchmark(benchmarks.find((item) => item.metric === event.target.value) ?? benchmarks[0])} data-testid="select-benchmark-metric">{benchmarks.map((item) => <option key={item.metric}>{item.metric}</option>)}</select>} /><div className="grid-kpis" style={{ marginBottom: 16 }}><Kpi label="Selected state" value="Odisha" note="Rank 4 of 5 in delay" icon={Globe2} tone="accent" /><Kpi label="Peer sample" value={`${benchmark.sampleSize}`} note="Comparable projects" icon={Users} tone="ocean" /><Kpi label="State percentile" value="28th" note="Needs attention" trend="up" icon={TrendingDown} tone="destructive" /><Kpi label="Best peer gap" value="4.6 mo" note="vs Gujarat benchmark" icon={Target} tone="chart-4" /></div><Section title={benchmark.metric} subtitle={`${benchmark.period} · normalised peer view · sample size ${benchmark.sampleSize}`}><div className="table-wrap"><table className="data-table" style={{ minWidth: 740 }}><thead><tr><th>Rank</th><th>State</th><th>Value</th><th>Percentile</th><th>Trend</th><th>Position</th></tr></thead><tbody>{benchmark.values.map((item) => <tr key={item.label} onClick={() => setSelected(item.label)} style={{ cursor: 'pointer', background: selected === item.label ? '#EDF6F5' : undefined }} data-testid={`row-benchmark-${item.label}`}><td className="mono muted">0{item.rank}</td><td><strong>{item.label}</strong>{item.label === 'Odisha' && <span className="tag risk-info" style={{ marginLeft: 8 }}>Selected</span>}</td><td className="mono" style={{ fontWeight: 700 }}>{item.value}{benchmark.metric.includes('delay') ? ' mo' : '%'}</td><td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="bar-track" style={{ width: 74 }}><div className="bar-fill" style={{ width: `${item.percentile}%`, background: item.percentile < 40 ? '#E85D68' : '#0FA89A' }} /></div><span className="mono tiny">{item.percentile}th</span></div></td><td style={{ color: item.trend > 0 && benchmark.metric.includes('delay') ? '#E85D68' : '#16A878' }}>{item.trend > 0 ? '+' : ''}{item.trend}%</td><td style={{ width: 150 }}><Sparkline values={[Math.max(1, item.value * .8), item.value * 1.1, item.value]} color={item.label === selected ? '#0FA89A' : '#A3C6C4'} /></td></tr>)}</tbody></table></div></Section><div className="grid-main" style={{ marginTop: 16 }}><Section title="Selected peer context" subtitle={`${selected} · why this comparison matters`}><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}><div><div className="eyebrow">Current value</div><div className="stat-value" style={{ marginTop: 7 }}>{benchmark.values.find((item) => item.label === selected)?.value}{benchmark.metric.includes('delay') ? ' mo' : '%'}</div></div><div><div className="eyebrow">Percentile</div><div className="stat-value" style={{ marginTop: 7 }}>{benchmark.values.find((item) => item.label === selected)?.percentile}<span style={{ fontSize: 14, letterSpacing: 0 }}>th</span></div></div></div><p className="tiny muted" style={{ lineHeight: 1.6, margin: '20px 0 0' }}>This view controls for project mix, stage composition, and reporting freshness. Use the district diagnostics view to identify the operational levers behind the gap.</p></Section><Section title="Read the benchmark" subtitle="A practical interpretation"><div style={{ display: 'grid', gap: 13 }}><div style={{ display: 'flex', gap: 10 }}><span className="tag risk-low">01</span><span style={{ fontSize: 12, lineHeight: 1.45, color: '#526B82' }}>Gujarat is the peer frontier for current delay performance.</span></div><div style={{ display: 'flex', gap: 10 }}><span className="tag risk-moderate">02</span><span style={{ fontSize: 12, lineHeight: 1.45, color: '#526B82' }}>Odisha is 4.6 months behind the frontier; compensation velocity is the first lever.</span></div><div style={{ display: 'flex', gap: 10 }}><span className="tag risk-info">03</span><span style={{ fontSize: 12, lineHeight: 1.45, color: '#526B82' }}>Use within-state district rankings before setting targets.</span></div></div></Section></div></div>;
}

function DiagnosticsGujarat() {
  const [selected, setSelected] = useState('Kutch'); const sorted = [...districts].sort((a, b) => b.riskRate - a.riskRate);
  return <div className="page-wrap"><PageHeader eyebrow="District diagnostics · comparative view" title="Where is friction accumulating?" description="District-level patterns turn Gujarat portfolio signals into a prioritised field plan." actions={<button className="btn btn-soft" onClick={() => window.print()} data-testid="button-print-diagnostics"><Download size={14} /> Export diagnostic</button>} /><div className="grid-kpis" style={{ marginBottom: 16 }}><Kpi label="State risk rate" value="35.3%" note="↑ 4.8 pts in 6 weeks" trend="up" icon={Gauge} tone="accent" /><Kpi label="Median delay" value="3.8 mo" note="Across at-risk projects" icon={Clock3} /><Kpi label="Highest exposure" value="Kutch" note="50% risk rate" icon={MapIcon} tone="destructive" /><Kpi label="Districts improving" value="3 / 8" note="Ahmedabad, Mehsana, Anand" trend="down" icon={TrendingDown} tone="chart-4" /></div><div className="grid-main"><Section title="District ranking" subtitle="Normalised risk rate · click a row to inspect"><div className="table-wrap"><table className="data-table" style={{ minWidth: 620 }}><thead><tr><th>Rank</th><th>District</th><th>Risk rate</th><th>Avg delay</th><th>6-wk trend</th></tr></thead><tbody>{sorted.map((item, index) => <tr key={item.id} onClick={() => setSelected(item.name)} style={{ cursor: 'pointer', background: selected === item.name ? '#EDF6F5' : undefined }} data-testid={`row-district-${item.id}`}><td className="mono muted">0{index + 1}</td><td><strong>{item.name}</strong><div className="tiny muted">{item.atRiskProjects} of {item.monitoredProjects} projects at risk</div></td><td><StatusTag level={item.riskRate > 35 ? 'High' : item.riskRate > 25 ? 'Moderate' : 'Low'} /><span style={{ marginLeft: 8 }}>{item.riskRate}%</span></td><td className="mono">{item.averageDelay} mo</td><td><Sparkline values={item.trend} color={item.riskRate > 35 ? '#E85D68' : '#0FA89A'} /></td></tr>)}</tbody></table></div></Section><Section title="Geographic concentration" subtitle={`Selected district: ${selected}`}><MapPanel selected={selected} onSelect={setSelected} /><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 13 }}><div><div className="eyebrow">At-risk projects</div><div className="stat-value" style={{ fontSize: 24, marginTop: 5 }}>{districts.find((item) => item.name === selected)?.atRiskProjects ?? 0}</div></div><div><div className="eyebrow">Legal cases</div><div className="stat-value" style={{ fontSize: 24, marginTop: 5 }}>{districts.find((item) => item.name === selected)?.legalCases ?? 0}</div></div></div></Section></div></div>;
}
function BenchmarkingGujarat() {
  const [notice, setNotice] = useState('');
  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3200);
  };
  return (
    <div className="page-wrap">
      <StateBenchmarkingView onNotify={notify} />
      {notice && (
        <div className="toast-note" role="status" data-testid="status-benchmarking-toast">
          <Check size={16} color="#16A878" /> {notice}
        </div>
      )}
    </div>
  );
}
function CorridorMap() {
  const [notice, setNotice] = useState('');
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 3200); };
  return (
    <div className="page-wrap">
      <CorridorGisView onNotify={notify} />
      {notice && <div className="toast-note" role="status" data-testid="status-corridor-toast"><Check size={16} color="#16A878" /> {notice}</div>}
    </div>
  );
}
function SettingsAccess() {
  const [selectedRole, setSelectedRole] = useState(roles[0].name); const [notice, setNotice] = useState(''); const [reviewed, setReviewed] = useState(false);
  const role = roles.find((item) => item.name === selectedRole) ?? roles[0];
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 3200); };
  return <div className="page-wrap"><PageHeader eyebrow="Settings & access · governance" title="Make access explicit." description="Role-aware controls for the Gujarat state decision system. Changes are reviewed, bounded by scope and captured in the audit log." actions={<Link className="btn btn-soft" href="/audit-log" data-testid="link-settings-audit"><ClipboardList size={14} /> Inspect audit log</Link>} />
    <div className="grid-main" style={{ marginBottom: 16 }}><Section title="Current signed-in session" subtitle="Safe action state for R. K. Shah"><div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}><div style={{ width: 38, height: 38, borderRadius: 9, display: 'grid', placeItems: 'center', background: '#EDF6F5', color: '#064C55', fontWeight: 700 }}>RK</div><div><strong style={{ color: '#102A43' }}>State Control Room</strong><div className="tiny muted" style={{ marginTop: 4 }}>Gujarat · all districts · 12 active users</div><span className="tag risk-low" style={{ marginTop: 10 }}><CheckCircle2 size={11} /> Trusted session</span></div></div><div style={{ display: 'grid', gap: 10, marginTop: 20 }}>{[['Device', sessionTrust.device], ['Network location', sessionTrust.location], ['Last verified', sessionTrust.lastVerified], ['Assurance', sessionTrust.assurance], ['Session expires', sessionTrust.expires]].map(([label, value]) => <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, borderTop: '1px solid #E5EFEE', paddingTop: 9 }}><span className="tiny muted">{label}</span><span className="tiny" style={{ textAlign: 'right', color: '#102A43' }}>{value}</span></div>)}</div></Section><Section title="Permission-aware action" subtitle="The signed-in role can export and assign, but cannot change access"><div className="audit-detail"><div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}><LockKeyhole size={16} className="muted" /><div><strong style={{ fontSize: 12, color: '#102A43' }}>Access changes require an administrator</strong><p className="tiny muted" style={{ lineHeight: 1.5, margin: '6px 0 12px' }}>Your scope is sufficient for operational decisions. A request can be raised without changing permissions in this session.</p><button className="btn btn-primary" onClick={() => notify('Access review request created for the Gujarat platform administrator.')} data-testid="button-request-access"><Send size={14} /> Request access review</button></div></div></div><div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}><span className={`tag ${reviewed ? 'risk-low' : 'risk-info'}`}>{reviewed ? 'Review recorded' : 'Review pending'}</span><button className="btn btn-quiet" onClick={() => { setReviewed(true); notify('Your current role and scope review was recorded.'); }} data-testid="button-record-access-review">Record review</button></div></Section></div>
    <Section title="Roles and permission matrix" subtitle="Select a role to inspect its allowed actions"><div className="permission-layout"><div style={{ display: 'grid', gap: 8 }}>{roles.map((item) => <button key={item.name} onClick={() => setSelectedRole(item.name)} data-testid={`button-role-${item.name.toLowerCase().replaceAll(' ', '-')}`} style={{ textAlign: 'left', padding: 13, color: 'inherit', background: selectedRole === item.name ? '#EDF6F5' : 'transparent', border: `1px solid ${selectedRole === item.name ? '#0FA89A' : '#D8E8E6'}`, borderRadius: 8 }}><strong style={{ display: 'block', fontSize: 12, color: '#102A43' }}>{item.name}</strong><span className="tiny muted">{item.scope}</span><span className="tiny muted" style={{ display: 'block', marginTop: 6 }}>{item.users} users</span></button>)}</div><div><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start' }}><div><h3 style={{ margin: 0, fontSize: 14, color: '#102A43' }}>{role.name}</h3><p className="tiny muted" style={{ margin: '5px 0 15px' }}>{role.description}</p></div><span className="tag risk-info">{role.scope}</span></div><div style={{ display: 'grid', gap: 8 }}>{role.permissions.map((permission) => <div key={permission.key} style={{ display: 'flex', gap: 11, alignItems: 'center', padding: '10px 11px', border: '1px solid #E5EFEE', borderRadius: 7 }}><span className={permission.state === 'Granted' ? 'permission-on' : 'permission-off'}>{permission.state === 'Granted' ? <CheckCircle2 size={16} /> : <LockKeyhole size={16} />}</span><div><strong style={{ display: 'block', fontSize: 12, color: '#102A43' }}>{permission.label}</strong><span className="tiny muted">{permission.description}</span></div><span className={`tag ${permission.state === 'Granted' ? 'risk-low' : 'risk-info'}`} style={{ marginLeft: 'auto' }}>{permission.state}</span></div>)}</div></div></div></Section>
    {notice && <div className="toast-note" role="status" data-testid="status-settings-toast"><Check size={16} color="#16A878" /> {notice}</div>}
  </div>;
}
function AuditLog() {
  const [status, setStatus] = useState('All statuses'); const [query, setQuery] = useState(''); const [selected, setSelected] = useState<AuditEntry | null>(null);
  const filtered = auditEntries.filter((entry) => (status === 'All statuses' || entry.status === status) && `${entry.actor} ${entry.action} ${entry.resource}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="page-wrap"><PageHeader eyebrow="Audit log · traceability" title="Every decision leaves a trail." description="Immutable-looking demo activity for access reviews, interventions and briefing generation across Gujarat." actions={<button className="btn btn-soft" onClick={() => window.print()} data-testid="button-export-audit"><Download size={14} /> Export audit log</button>} />
    <div className="surface filter-strip" style={{ marginBottom: 16 }}><FileSearch2 size={15} className="muted" /><input className="input" style={{ maxWidth: 280 }} placeholder="Search actor, action or resource" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search audit log" data-testid="input-audit-search" /><select className="select" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter audit status" data-testid="select-audit-status"><option>All statuses</option><option>Success</option><option>Review</option><option>Blocked</option></select><span className="tiny muted" style={{ marginLeft: 'auto' }}>{filtered.length} events · demo data</span></div>
    <div className="grid-main"><Section title="Activity stream" subtitle="Timestamp · actor · action · resource · status"><div className="table-wrap"><table className="data-table" style={{ minWidth: 740 }}><thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Resource</th><th>Status</th><th aria-label="Inspect event" /></tr></thead><tbody>{filtered.map((entry) => <tr key={entry.id} onClick={() => setSelected(entry)} style={{ cursor: 'pointer', background: selected?.id === entry.id ? '#EDF6F5' : undefined }} data-testid={`row-audit-${entry.id}`}><td className="mono tiny">{entry.timestamp}</td><td><strong>{entry.actor}</strong><div className="tiny muted">{entry.role}</div></td><td>{entry.action}</td><td className="mono tiny">{entry.resource}</td><td><span className={`tag ${entry.status === 'Success' ? 'risk-low' : entry.status === 'Review' ? 'risk-moderate' : 'risk-critical'}`}>{entry.status}</span></td><td><button className="btn btn-quiet" onClick={(event) => { event.stopPropagation(); setSelected(entry); }} aria-label={`Inspect audit event ${entry.id}`} data-testid={`button-inspect-${entry.id}`}><MoreHorizontal size={16} /></button></td></tr>)}</tbody></table></div>{!filtered.length && <div className="muted" style={{ padding: 28, textAlign: 'center' }}>No audit events match these filters.</div>}</Section><Section title={selected ? 'Event detail' : 'Inspect an event'} subtitle={selected ? selected.id : 'Select a row to review the recorded context'}>{selected ? <div className="reveal"><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'start' }}><div><div className="eyebrow">{selected.action}</div><div style={{ fontSize: 20, fontWeight: 700, marginTop: 6, color: '#102A43' }}>{selected.resource}</div></div><span className={`tag ${selected.status === 'Success' ? 'risk-low' : selected.status === 'Review' ? 'risk-moderate' : 'risk-critical'}`}>{selected.status}</span></div><div className="audit-detail" style={{ marginTop: 20 }}><div className="tiny muted">Recorded detail</div><p style={{ fontSize: 13, lineHeight: 1.55, margin: '6px 0 0', color: '#526B82' }}>{selected.detail}</p></div><div style={{ display: 'grid', gap: 9, marginTop: 18 }}>{[['Actor', selected.actor], ['Role', selected.role], ['Timestamp', selected.timestamp]].map(([label, value]) => <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5EFEE', paddingBottom: 8 }}><span className="tiny muted">{label}</span><span className="tiny" style={{ color: '#102A43' }}>{value}</span></div>)}</div></div> : <div style={{ padding: '45px 12px', textAlign: 'center' }}><ClipboardList size={27} className="muted" /><p className="muted tiny">Select an event to inspect its evidence and status.</p></div>}</Section></div>
  </div>;
}
function ShaderDemo() { return <div className="page-wrap"><PageHeader eyebrow="Visual lab · isolated demo" title="A quiet visual instrument." description="A separate exploration space for the BhoomiSetu signal language. Nothing here changes operational data." actions={<Link className="btn btn-soft" href="/">Return to operations</Link>} /><div className="surface" style={{ overflow: 'hidden', minHeight: 440, background: '#042E35', position: 'relative' }}><div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 25% 40%, rgba(15, 168, 154, 0.22), transparent 30%), radial-gradient(circle at 78% 60%, rgba(6, 76, 85, 0.5), transparent 35%)' }} /><div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px)', backgroundSize: '42px 42px', transform: 'perspective(500px) rotateX(54deg) scale(1.35)', transformOrigin: 'center bottom' }} /><div style={{ position: 'relative', zIndex: 1, padding: 45, color: '#F5FAF9' }}><div className="eyebrow" style={{ color: '#0FA89A' }}>Signal / terrain / action</div><div style={{ fontSize: 'clamp(36px, 8vw, 88px)', maxWidth: 760, letterSpacing: '-.07em', lineHeight: .9, marginTop: 17 }}>See the <span style={{ color: '#0FA89A' }}>terrain</span><br />before you move.</div><p style={{ maxWidth: 480, fontSize: 14, lineHeight: 1.6, color: '#A3C6C4', marginTop: 24 }}>The visual language is grounded in Deep Teal, Ocean Teal, and Clean Navy — an institutional GovTech framework for national infrastructure intelligence that values evidence over spectacle.</p><div style={{ display: 'flex', gap: 8, marginTop: 30 }}><span className="tag" style={{ color: '#E85D68', borderColor: 'rgba(232, 93, 104, 0.4)', background: 'transparent' }}>Critical signal</span><span className="tag" style={{ color: '#16A878', borderColor: 'rgba(22, 168, 120, 0.4)', background: 'transparent' }}>Actionable</span></div></div></div></div>; }
function Placeholder({ title, eyebrow = 'Workspace' }: { title: string; eyebrow?: string }) { return <div className="page-wrap"><PageHeader eyebrow={eyebrow} title={title} description="This operational view is ready for the next data service connection." /><div className="surface" style={{ minHeight: 330, display: 'grid', placeItems: 'center', textAlign: 'center', padding: 28 }}><div><FileCheck2 size={34} className="muted" style={{ margin: '0 auto 13px' }} /><h2 style={{ fontSize: 17, margin: 0, color: '#102A43' }}>No records to display</h2><p className="muted tiny" style={{ maxWidth: 360, lineHeight: 1.5 }}>The service boundary is in place. Connect the district feed to populate this workspace.</p><Link href="/" className="btn btn-primary" style={{ marginTop: 11 }}>Back to state overview</Link></div></div></div>; }
function NotFound() { return <div className="page-wrap" style={{ minHeight: 'calc(100dvh - 76px)', display: 'grid', placeItems: 'center' }}><div style={{ textAlign: 'center' }}><div className="mono" style={{ fontSize: 86, lineHeight: .9, color: 'rgba(15, 168, 154, 0.2)', fontWeight: 700 }}>404</div><h1 className="display" style={{ fontSize: 30, margin: '20px 0 8px', color: '#102A43' }}>This parcel is not on the map.</h1><p className="muted" style={{ fontSize: 13 }}>The view you requested does not exist in this control room.</p><Link className="btn btn-primary" style={{ marginTop: 16 }} href="/">Return to state overview</Link></div></div>; }

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route>
        <AppShell>
          <Switch>
            <Route path="/" component={Overview} />
            <Route path="/corridor-map" component={CorridorMap} />
            <Route path="/district-diagnostics" component={DiagnosticsGujarat} />
            <Route path="/early-warning" component={EarlyWarning} />
            <Route path="/fund-tracking" component={Funds} />
            <Route path="/project/:id" component={Project360} />
            <Route path="/intelligence" component={Intelligence} />
            <Route path="/policy-briefing" component={PolicyBriefingPage} />
            <Route path="/state-benchmarking" component={BenchmarkingGujarat} />
            <Route path="/settings" component={SettingsAccess} />
            <Route path="/audit-log" component={AuditLog} />
            <Route path="/shader-demo" component={ShaderDemo} />
            <Route component={NotFound} />
          </Switch>
        </AppShell>
      </Route>
    </Switch>
  );
}
function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }
function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedErrorBoundary><Router /></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>; }
export default App;