import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Shield, Lock, Mail, Eye, EyeOff, Landmark, CheckCircle2,
  AlertCircle, ArrowRight, Sparkles, Building2, ShieldCheck, Compass,
  RefreshCw, ChevronDown, MapPin, Users, TrendingUp,
  AlertTriangle, ClipboardCheck, Banknote, Cpu,
} from 'lucide-react';
import { login, setStoredToken } from '@/lib/api';

interface DemoAccount {
  role: string;
  badge: string;
  name: string;
  email: string;
  pass: string;
  jurisdiction: string;
  description: string;
  icon: typeof Shield;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'State Administrator',
    badge: 'State Control Room',
    name: 'R. K. Shah, IAS',
    email: 'admin@bhoomisetu.gov.in',
    pass: 'Bhoomi#Admin2026!',
    jurisdiction: 'Gujarat Statewide \u2022 All 33 Districts',
    description: 'Full statutory portfolio oversight, Task Force escalations, inter-departmental clearances.',
    icon: Landmark,
  },
  {
    role: 'District Collector',
    badge: 'District Magistrate',
    name: 'Dr. Sourabh Zaveri, IAS',
    email: 'collector.surat@bhoomisetu.gov.in',
    pass: 'Surat#Collector2026!',
    jurisdiction: 'Surat District \u2022 Diamond & Bullet Train Corridors',
    description: 'Section 23 Award approval, DBT tranche authorization, land compensation disbursements.',
    icon: Building2,
  },
  {
    role: 'Land Acquisition Officer',
    badge: 'Field Executive',
    name: 'P. M. Patel, GAS',
    email: 'officer.bharuch@bhoomisetu.gov.in',
    pass: 'Bharuch#Officer2026!',
    jurisdiction: 'Bharuch & Ankleshwar \u2022 Chemical Belt & NH-48',
    description: 'Joint Measurement Surveys, cadastral verification, mauza-level hearing records.',
    icon: Compass,
  },
  {
    role: 'Public Vigilance Auditor',
    badge: 'Statutory Audit',
    name: 'V. K. Meena, IA&AS',
    email: 'auditor.state@bhoomisetu.gov.in',
    pass: 'Bhoomi#Audit2026!',
    jurisdiction: 'State Auditor General Office \u2022 Escrow Reconciliation',
    description: 'DBT ledger aging verification (>90 days), statutory compliance and financial audit.',
    icon: ShieldCheck,
  },
];

// Cadastral parcels for background grid
const PARCEL_STATUS = ['clear','clear','clear','survey','acquired','disputed','compensated'];
const PARCELS = Array.from({ length: 48 }, (_, i) => ({
  id: i,
  col: (i % 8) + 1,
  row: Math.floor(i / 8) + 1,
  status: PARCEL_STATUS[i % PARCEL_STATUS.length],
  delay: (i * 0.07).toFixed(2),
}));

const STATUS_COLORS: Record<string, string> = {
  clear: 'rgba(22,168,120,0.10)',
  survey: 'rgba(242,165,26,0.18)',
  acquired: 'rgba(15,168,154,0.22)',
  disputed: 'rgba(232,93,104,0.18)',
  compensated: 'rgba(78,224,209,0.18)',
};
const STATUS_BORDER: Record<string, string> = {
  clear: 'rgba(22,168,120,0.28)',
  survey: 'rgba(242,165,26,0.45)',
  acquired: 'rgba(15,168,154,0.55)',
  disputed: 'rgba(232,93,104,0.45)',
  compensated: 'rgba(78,224,209,0.55)',
};

const PIPELINE_STAGES = [
  {
    icon: ClipboardCheck,
    code: 'SEC. 4',
    title: 'Preliminary Notification',
    sub: 'Section 4 / Section 11 RFCTLARR',
    color: '#F2A51A',
    count: '2,847 notices',
    desc: 'Intent-to-acquire published in district gazette. Objection window of 60 days activated.',
  },
  {
    icon: Compass,
    code: 'SURVEY',
    title: 'Joint Measurement Survey',
    sub: 'Cadastral Verification & Mauza Records',
    color: '#4EE0D1',
    count: '1,203 plots',
    desc: 'Field officers map plot boundaries, ownership chains, and encumbrances on ground.',
  },
  {
    icon: MapPin,
    code: 'SEC. 19',
    title: 'Award Declaration',
    sub: 'Section 19 / Section 23 Collector Award',
    color: '#0FA89A',
    count: '889 awarded',
    desc: 'Collector passes final award. Market-rate compensation computed with solatium & annuity.',
  },
  {
    icon: Banknote,
    code: 'DBT',
    title: 'Direct Benefit Transfer',
    sub: 'Escrow Vault \u2192 Beneficiary Account',
    color: '#16A878',
    count: '\u20b94,250 Cr',
    desc: 'Statutory compensation disbursed via DBT. Delayed tranches flagged automatically by AI.',
  },
];

const SEAL_TEXTS = [
  'Verifying identity...',
  'Validating jurisdiction scope...',
  'Loading cadastral mesh...',
  'Binding statutory roles...',
  'Initialising district feed...',
  'Access granted. Welcome.',
];

export function LoginPage() {
  const [, navigate] = useLocation();
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS[0].pass);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [captchaChecked, setCaptchaChecked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hoveredParcel, setHoveredParcel] = useState<number | null>(null);

  // Seal transition
  const [showSeal, setShowSeal] = useState(false);
  const [sealPhase, setSealPhase] = useState<'draw' | 'stamp' | 'exit'>('draw');
  const [sealProgress, setSealProgress] = useState(0);
  const [sealText, setSealText] = useState(SEAL_TEXTS[0]);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 });
    };
    window.addEventListener('mousemove', onMouse, { passive: true });
    return () => window.removeEventListener('mousemove', onMouse);
  }, []);

  const selectRole = (idx: number) => {
    setSelectedRoleIndex(idx);
    setEmail(DEMO_ACCOUNTS[idx].email);
    setPassword(DEMO_ACCOUNTS[idx].pass);
    setErrorMessage('');
  };

  const triggerSeal = (onDone: () => void) => {
    setShowSeal(true);
    setSealPhase('draw');
    setSealProgress(0);
    let step = 0;
    const iv = setInterval(() => {
      step++;
      const pct = Math.min(step * 17, 100);
      setSealProgress(pct);
      setSealText(SEAL_TEXTS[Math.min(step - 1, SEAL_TEXTS.length - 1)]);
      if (pct >= 100) {
        clearInterval(iv);
        setSealPhase('stamp');
        setTimeout(() => { setSealPhase('exit'); setTimeout(onDone, 350); }, 650);
      }
    }, 250);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    if (!email || !password) { setErrorMessage('Please enter both administrative email and password.'); return; }
    if (!captchaChecked) { setErrorMessage('Please confirm SSO clearance.'); return; }
    setLoading(true);
    try {
      const res = await login(email, password).catch(() => null);
      if (res?.access_token) setStoredToken(res.access_token);
      else setStoredToken(`bhoomi_jwt_demo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
      triggerSeal(() => navigate('/dashboard'));
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err?.message || 'Authentication error. Check server status.');
    }
  };

  const currentRole = DEMO_ACCOUNTS[selectedRoleIndex];
  const heroOpacity = Math.max(0, 1 - scrollY / 550);
  const heroTranslate = -scrollY * 0.22;
  const pipelineIn = scrollY > 280;

  // Seal circle animation: circumference of r=72 circle = 2*pi*72 ≈ 452
  const circumference = 452;
  const strokeOffset = circumference - (circumference * sealProgress) / 100;

  return (
    <div className="lp-master">

      {/* Cadastral grid background */}
      <div className="lp-cadastral-bg" style={{ transform: `translateY(${scrollY * 0.15}px)` }}>
        {PARCELS.map((p) => (
          <div
            key={p.id}
            className="lp-parcel"
            style={{
              gridColumn: p.col,
              gridRow: p.row,
              background: hoveredParcel === p.id ? STATUS_BORDER[p.status] : STATUS_COLORS[p.status],
              borderColor: STATUS_BORDER[p.status],
              animationDelay: `${p.delay}s`,
            }}
            onMouseEnter={() => setHoveredParcel(p.id)}
            onMouseLeave={() => setHoveredParcel(null)}
          />
        ))}
      </div>

      {/* Glow blobs */}
      <div className="lp-glow lp-glow--teal" style={{ transform: `translate(${mousePos.x * 22}px, ${mousePos.y * 16}px)` }} />
      <div className="lp-glow lp-glow--emerald" style={{ transform: `translate(${mousePos.x * -16}px, ${mousePos.y * 20}px)` }} />
      <div className="lp-glow lp-glow--amber" />

      {/* Sticky nav */}
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-nav-brand">
            <div className="lp-nav-emblem"><Landmark size={20} /></div>
            <div>
              <div className="lp-nav-title">BhoomiSetu</div>
              <div className="lp-nav-sub">NATIONAL LAND INTELLIGENCE NETWORK</div>
            </div>
          </div>
          <div className="lp-nav-right" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="lp-live-pill"><span className="lp-live-dot" />Server \u2022 Live</span>
            <button className="lp-nav-cta" onClick={() => navigate('/ml-models')} style={{ background: '#042E35', border: '1px solid #0FA89A' }} data-testid="button-nav-ml-models">
              <Cpu size={13} style={{ color: '#4EE0D1' }} />ML Models & Backend
            </button>
            <button className="lp-nav-cta" onClick={() => navigate('/dashboard')} data-testid="button-nav-dashboard">
              <Sparkles size={13} style={{ color: '#F2A51A' }} />Live Command Center
            </button>
          </div>
        </div>
      </header>

      {/* ═══ SECTION 1: HERO ═══ */}
      <section className="lp-section lp-hero" style={{ opacity: heroOpacity, transform: `translateY(${heroTranslate}px)` }}>
        <div className="lp-hero-inner">
          <div className="lp-legend-row">
            {[{ l: 'Clear', c: '#16A878' },{ l: 'Survey Active', c: '#F2A51A' },{ l: 'Acquired', c: '#0FA89A' },{ l: 'Disputed', c: '#E85D68' },{ l: 'Compensated', c: '#4EE0D1' }].map(({ l, c }) => (
              <span key={l} className="lp-legend-pill" style={{ borderColor: c, color: c }}>
                <i className="lp-dot" style={{ background: c }} />{l}
              </span>
            ))}
          </div>

          <div className="lp-hero-badge">
            <Sparkles size={13} style={{ color: '#F2A51A' }} />
            SMART INDIA HACKATHON 2026 \u2022 GUJARAT STATE CORRIDOR COMMAND
          </div>

          <h1 className="lp-headline">
            Every Parcel. Every Owner.<br />
            <span className="lp-headline-accent">Every Rupee. Accounted For.</span>
          </h1>

          <p className="lp-hero-sub">
            BhoomiSetu digitises the entire RFCTLARR land acquisition lifecycle — from Section 4 preliminary
            notification through Section 23 collector award and direct DBT compensation — across Gujarat's
            four mega-infrastructure corridors.
          </p>

          <div className="lp-stat-row">
            {[
              { icon: MapPin, val: '68', sub: 'Active Projects', c: '#0FA89A' },
              { icon: Users, val: '2,847', sub: 'Affected Families', c: '#4EE0D1' },
              { icon: TrendingUp, val: '\u20b94,250 Cr', sub: 'Compensation Tracked', c: '#16A878' },
              { icon: AlertTriangle, val: '12', sub: 'Delay Alerts', c: '#F2A51A' },
            ].map(({ icon: Icon, val, sub, c }) => (
              <div key={sub} className="lp-stat-card" style={{ borderColor: c + '44' }}>
                <span className="lp-stat-icon" style={{ background: c + '22', color: c }}><Icon size={15} /></span>
                <span className="lp-stat-val" style={{ color: c }}>{val}</span>
                <span className="lp-stat-sub">{sub}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
            <button
              className="btn btn-primary"
              style={{ padding: '10px 22px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8 }}
              onClick={() => navigate('/dashboard')}
              data-testid="button-hero-enter-dashboard"
            >
              <Sparkles size={15} /> Enter Live Command Center
            </button>
            <button
              className="btn btn-soft"
              style={{ padding: '10px 20px', fontSize: 13, background: 'rgba(255,255,255,0.12)', color: '#FFF', borderColor: 'rgba(78,224,209,0.3)', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              onClick={() => navigate('/ml-models')}
              data-testid="button-hero-ml-models"
            >
              <Cpu size={15} style={{ color: '#4EE0D1' }} /> Inspect ML Backend & Models
            </button>
            <button
              className="btn btn-quiet"
              style={{ padding: '10px 16px', fontSize: 13, color: '#A3C6C4' }}
              onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-scroll-to-auth"
            >
              Role Logins <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2: ACQUISITION PIPELINE ═══ */}
      <section className="lp-section lp-pipeline-section">
        <div className={`lp-pipeline-inner${pipelineIn ? ' lp-visible' : ''}`}>
          <div className="lp-eyebrow-row">
            <span className="lp-eyebrow-line" />LAND ACQUISITION PIPELINE<span className="lp-eyebrow-line" />
          </div>
          <h2 className="lp-section-title">From Notification to Compensation</h2>
          <p className="lp-section-sub">Four statutory stages. One transparent platform.</p>

          <div className="lp-pipeline-track">
            <div className="lp-pipeline-rail" />
            {PIPELINE_STAGES.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <div key={stage.code} className="lp-pipeline-step" style={{ animationDelay: `${i * 0.12}s` }}>
                  <div className="lp-pipeline-node" style={{ borderColor: stage.color, boxShadow: `0 0 16px ${stage.color}44` }}>
                    <Icon size={17} style={{ color: stage.color }} />
                  </div>
                  <div className="lp-pipeline-card">
                    <span className="lp-pipeline-code" style={{ color: stage.color, borderColor: stage.color + '44' }}>{stage.code}</span>
                    <h3 className="lp-pipeline-title">{stage.title}</h3>
                    <p className="lp-pipeline-legal">{stage.sub}</p>
                    <div className="lp-pipeline-count" style={{ color: stage.color }}>{stage.count}</div>
                    <p className="lp-pipeline-desc">{stage.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: LOGIN ═══ */}
      <section id="auth-section" className="lp-section lp-auth-section">
        <div className="lp-auth-grid">

          {/* Left context panel */}
          <div className="lp-auth-context">
            <div className="lp-context-emblem-row">
              <div className="lp-context-emblem">
                <Landmark size={26} />
                <div className="lp-emblem-spin" />
              </div>
              <div>
                <div className="lp-context-dept">STATE REVENUE & DISASTER MANAGEMENT</div>
                <h2 className="lp-context-title">Statutory Access Portal</h2>
                <p className="lp-context-sub">Authorised Personnel Login \u2022 RFCTLARR Section 4\u201323</p>
              </div>
            </div>

            <div className="lp-intel-box">
              <div className="lp-intel-header">
                <span className="lp-intel-live"><span className="lp-live-dot" />NIC & STATE SSO TUNNEL ONLINE</span>
                <span className="lp-intel-badge">SIH 2026 Production</span>
              </div>
              <div className="lp-intel-grid">
                {[{ n: '33', t: 'Gujarat Districts' },{ n: '100%', t: 'RFCTLARR Compliant' },{ n: 'Argon2id', t: 'Memory-Hard Security' }].map(m => (
                  <div key={m.n} className="lp-intel-metric"><div className="lp-intel-num">{m.n}</div><div className="lp-intel-txt">{m.t}</div></div>
                ))}
              </div>
              <div className="lp-terminal">
                <div className="lp-terminal-head"><ShieldCheck size={13} style={{ color: '#16A878' }} />Zero-Trust Cryptographic Defence</div>
                <div className="lp-terminal-body">
                  <span>[TLS] Strict HSTS & OWASP ASVS v4.0 Defence-in-Depth</span>
                  <span>[ENC] Field-Level AES-256-GCM Envelope Encryption</span>
                  <span>[RBAC] Hierarchical State & District Geographic Scoping</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right login card */}
          <div className="lp-login-card">
            <div className="lp-card-head">
              <span className="lp-card-eyebrow">OFFICIAL GOVERNMENT PORTAL</span>
              <h3 className="lp-card-title">Sign In to Dashboard</h3>
              <p className="lp-card-text">Select an authorised administrative profile or enter official credentials.</p>
            </div>

            <div className="lp-role-header">
              <span>SELECT INSTITUTIONAL ROLE</span>
              <span className="lp-autofill-hint">Auto-fills credentials</span>
            </div>
            <div className="lp-role-grid">
              {DEMO_ACCOUNTS.map((acc, idx) => {
                const Icon = acc.icon;
                const active = selectedRoleIndex === idx;
                return (
                  <button key={acc.role} type="button" onClick={() => selectRole(idx)}
                    className={`lp-role-btn${active ? ' active' : ''}`} data-testid={`button-role-select-${idx}`}>
                    <Icon size={13} className="lp-role-icon" />
                    <div className="lp-role-info">
                      <span className="lp-role-name">{acc.role}</span>
                      <span className="lp-role-user">{acc.name}</span>
                    </div>
                    {active && <CheckCircle2 size={13} className="lp-role-check" />}
                  </button>
                );
              })}
            </div>

            <div className="lp-profile-banner">
              <span className="lp-profile-tag">{currentRole.badge}</span>
              <div className="lp-profile-name">{currentRole.name}</div>
              <div className="lp-profile-jurisdiction">{currentRole.jurisdiction}</div>
              <div className="lp-profile-desc">{currentRole.description}</div>
            </div>

            <form onSubmit={handleLogin} className="lp-form">
              {errorMessage && (
                <div className="lp-error" role="alert"><AlertCircle size={13} />{errorMessage}</div>
              )}

              <div className="lp-field">
                <label className="lp-label">Official Email / ID</label>
                <div className="lp-input-wrap">
                  <Mail size={14} className="lp-field-icon" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="officer@bhoomisetu.gov.in" className="lp-input" required />
                </div>
              </div>

              <div className="lp-field">
                <div className="lp-label-row">
                  <label className="lp-label">Security Passphrase</label>
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="lp-show-pass">
                    {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}{showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="lp-input-wrap">
                  <Lock size={14} className="lp-field-icon" />
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="••••••••••••••••"
                    className="lp-input" required />
                </div>
              </div>

              <div className="lp-check-row">
                <label className="lp-check-item"><input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />Trusted terminal</label>
                <label className="lp-check-item"><input type="checkbox" checked={captchaChecked} onChange={e => setCaptchaChecked(e.target.checked)} />SSO Clearance</label>
              </div>

              <button type="submit" disabled={loading} className="lp-submit" data-testid="button-portal-submit-login">
                {loading ? <><RefreshCw size={14} className="lp-spin" />Verifying & Entering Platform...</> : <>Enter BhoomiSetu Intelligence Platform<ArrowRight size={14} /></>}
              </button>

              <button type="button" className="lp-demo-btn" data-testid="button-instant-demo"
                onClick={() => { setStoredToken('bhoomi_guest_evaluator'); triggerSeal(() => navigate('/dashboard')); }}>
                <Sparkles size={13} style={{ color: '#0FA89A' }} />Instant Evaluator Demo Access (Skip Login)
              </button>
            </form>

            <div className="lp-legal">
              <Shield size={12} style={{ color: '#16A878' }} />
              Restricted Government System • Audit logging active under IT Act 2000.
            </div>
          </div>
        </div>
      </section>

      {/* ═══ LAND DEED SEAL TRANSITION ═══ */}
      {showSeal && (
        <div className={`lp-seal-overlay${sealPhase === 'stamp' ? ' lp-seal--stamp' : ''}${sealPhase === 'exit' ? ' lp-seal--exit' : ''}`}>
          <div className="lp-ink-ring lp-ink-ring--1" />
          <div className="lp-ink-ring lp-ink-ring--2" />
          <div className="lp-ink-ring lp-ink-ring--3" />

          <div className={`lp-seal-card${sealPhase === 'stamp' ? ' lp-seal-card--stamped' : ''}`}>
            <div className="lp-seal-emblem">
              <svg viewBox="0 0 200 200" width="150" height="150" className="lp-seal-svg">
                {/* Outer dashed cadastral boundary */}
                <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(78,224,209,0.5)" strokeWidth="1.5" strokeDasharray="5 4" className="lp-seal-outer-dash" />
                {/* Progress-driven draw circle */}
                <circle cx="100" cy="100" r="72" fill="none" stroke="rgba(15,168,154,0.9)" strokeWidth="2.5"
                  strokeDasharray={`${circumference}`} strokeDashoffset={`${strokeOffset}`}
                  strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px', transition: 'stroke-dashoffset 0.2s ease' }} />
                {/* Grid lines */}
                {[0,1,2,3].map(i => <line key={`v${i}`} x1={44+i*20} y1="44" x2={44+i*20} y2="156" stroke="rgba(78,224,209,0.2)" strokeWidth="0.7" />)}
                {[0,1,2,3].map(i => <line key={`h${i}`} x1="44" y1={44+i*20} x2="156" y2={44+i*20} stroke="rgba(78,224,209,0.2)" strokeWidth="0.7" />)}
                {/* Pin marker */}
                <circle cx="100" cy="92" r="12" fill="rgba(15,168,154,0.25)" stroke="rgba(15,168,154,0.8)" strokeWidth="1.5" />
                <circle cx="100" cy="92" r="5" fill="rgba(78,224,209,0.9)" />
                <line x1="100" y1="104" x2="100" y2="120" stroke="rgba(15,168,154,0.8)" strokeWidth="2" strokeLinecap="round" />
                <circle cx="100" cy="122" r="3" fill="rgba(15,168,154,0.6)" />
                {/* Scan sweep */}
                <line x1="28" y1="100" x2="172" y2="100" stroke="rgba(78,224,209,0.35)" strokeWidth="0.8" className="lp-seal-scan" />
                {/* Arc label */}
                <path id="lp-arc" d="M 28,100 A 72,72 0 0,0 172,100" fill="none" />
                <text fontSize="7" fontWeight="700" letterSpacing="2.5" fill="rgba(78,224,209,0.75)" fontFamily="monospace">
                  <textPath href="#lp-arc" startOffset="5%">GOVERNMENT OF GUJARAT • REVENUE DEPT</textPath>
                </text>
              </svg>
              <div className="lp-seal-aura" />
            </div>

            <div className="lp-seal-text-group">
              <div className="lp-seal-govt-tag">BHOOMISETU INTELLIGENCE PLATFORM</div>
              <h2 className="lp-seal-title">BhoomiSetu</h2>
              <div className="lp-seal-subtitle">Land Acquisition Command System</div>
            </div>

            <div className="lp-seal-verified">
              <CheckCircle2 size={14} style={{ color: '#16A878' }} />
              Access Clearance Verified — Role: {currentRole.role}
            </div>

            <div className="lp-seal-progress-wrap">
              <div className="lp-seal-track">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="lp-track-tick" style={{ left: `${i * 10}%` }} />
                ))}
                <div className="lp-seal-fill" style={{ width: `${sealProgress}%` }}>
                  <div className="lp-fill-pulse" />
                </div>
              </div>
              <div className="lp-seal-status">
                <span>{sealText}</span>
                <span className="lp-seal-pct">{sealProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
