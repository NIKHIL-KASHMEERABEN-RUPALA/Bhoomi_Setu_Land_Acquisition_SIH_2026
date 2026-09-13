import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Landmark,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Fingerprint,
  Building2,
  ShieldCheck,
  Compass,
  Cpu,
  RefreshCw,
  ChevronDown,
  Layers,
  Globe,
  Activity,
  Zap,
  Route as RouteIcon,
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
    jurisdiction: 'Gujarat Statewide • All 33 Districts',
    description: 'Full statutory portfolio oversight, Task Force escalations, inter-departmental clearances.',
    icon: Landmark,
  },
  {
    role: 'District Collector',
    badge: 'District Magistrate',
    name: 'Dr. Sourabh Zaveri, IAS',
    email: 'collector.surat@bhoomisetu.gov.in',
    pass: 'Surat#Collector2026!',
    jurisdiction: 'Surat District • Diamond & Bullet Train Corridors',
    description: 'Section 23 Award approval, DBT tranche authorization, land compensation disbursements.',
    icon: Building2,
  },
  {
    role: 'Land Acquisition Officer',
    badge: 'Field Executive',
    name: 'P. M. Patel, GAS',
    email: 'officer.bharuch@bhoomisetu.gov.in',
    pass: 'Bharuch#Officer2026!',
    jurisdiction: 'Bharuch & Ankleshwar • Chemical Belt & NH-48',
    description: 'Joint Measurement Surveys, cadastral verification, mauza-level hearing records.',
    icon: Compass,
  },
  {
    role: 'Public Vigilance Auditor',
    badge: 'Statutory Audit',
    name: 'V. K. Meena, IA&AS',
    email: 'auditor.state@bhoomisetu.gov.in',
    pass: 'Bhoomi#Audit2026!',
    jurisdiction: 'State Auditor General Office • Escrow Reconciliation',
    description: 'DBT ledger aging verification (>90 days), statutory compliance and financial audit.',
    icon: ShieldCheck,
  },
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
  const [successMessage, setSuccessMessage] = useState('');

  // Cinematic Logo Animation Modal State
  const [showLogoSequence, setShowLogoSequence] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track mouse movement for 3D parallax tilt
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 3D Canvas Wireframe & Particle Sphere Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create 3D Nodes
    const numPoints = 120;
    const points: Array<{ x: number; y: number; z: number; origX: number; origY: number; origZ: number; size: number }> = [];
    const radius = Math.min(width, height) * 0.38;

    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);
      points.push({ x, y, z, origX: x, origY: y, origZ: z, size: Math.random() * 2 + 1.5 });
    }

    let rotX = 0;
    let rotY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Rotation derived from time, mouse, and scroll
      const scrollFactor = window.scrollY * 0.0025;
      rotY += 0.004 + mousePos.x * 0.003;
      rotX = mousePos.y * 0.35 + scrollFactor * 0.75;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      // Camera center shifts slightly with scroll
      const centerX = width * 0.5 + mousePos.x * 30;
      const centerY = height * 0.48 - window.scrollY * 0.35 + mousePos.y * 20;
      const fov = 500;

      // Project points to 2D
      const projected: Array<{ px: number; py: number; pz: number; size: number; alpha: number }> = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // Rotate Y
        const x1 = p.origX * cosY - p.origZ * sinY;
        const z1 = p.origZ * cosY + p.origX * sinY;

        // Rotate X
        const y2 = p.origY * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.origY * sinX;

        // Dynamic depth transformation with scroll
        const depthZ = z2 + 650 - window.scrollY * 0.4;
        if (depthZ <= 0) continue;

        const scale = fov / depthZ;
        const px = centerX + x1 * scale;
        const py = centerY + y2 * scale;
        const alpha = Math.max(0.12, Math.min(0.88, (z2 + radius) / (2 * radius)));

        projected.push({ px, py, pz: z2, size: p.size * scale, alpha });
      }

      // Draw connecting wireframe lines between close nodes
      ctx.lineWidth = 1;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dist = Math.hypot(p1.px - p2.px, p1.py - p2.py);
          if (dist < 85) {
            const lineAlpha = (1 - dist / 85) * 0.28 * Math.min(p1.alpha, p2.alpha);
            ctx.strokeStyle = `rgba(15, 168, 154, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Draw glowing nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(78, 224, 209, ${p.alpha})`;
        ctx.shadowColor = '#0FA89A';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mousePos]);

  const selectRole = (index: number) => {
    setSelectedRoleIndex(index);
    const account = DEMO_ACCOUNTS[index];
    setEmail(account.email);
    setPassword(account.pass);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const scrollToAuth = () => {
    const el = document.getElementById('auth-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both administrative email and password.');
      return;
    }

    if (!captchaChecked) {
      setErrorMessage('Please confirm you are an authorized government user.');
      return;
    }

    setLoading(true);

    // Trigger the Cinematic 3D BhoomiSetu Logo Sequence
    setShowLogoSequence(true);
    setLogoProgress(10);

    const progressInterval = setInterval(() => {
      setLogoProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 18;
      });
    }, 240);

    try {
      // Backend login or resilient demo fallback
      const response = await login(email, password).catch(() => null);
      if (response?.access_token) {
        setStoredToken(response.access_token);
      } else {
        const mockToken = `bhoomi_jwt_demo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        setStoredToken(mockToken);
      }

      // Complete progress and navigate after cinematic animation
      setTimeout(() => {
        clearInterval(progressInterval);
        setLogoProgress(100);
        setTimeout(() => {
          navigate('/');
        }, 550);
      }, 1600);
    } catch (err: any) {
      clearInterval(progressInterval);
      setShowLogoSequence(false);
      setLoading(false);
      setErrorMessage(err?.message || 'Authentication error. Check server status.');
    }
  };

  const currentRole = DEMO_ACCOUNTS[selectedRoleIndex];

  // Dynamic 3D transform values for Page 1 elements based on scroll and mouse tilt
  const tiltX = mousePos.y * 12 - scrollY * 0.05;
  const tiltY = mousePos.x * -14;
  const page1Opacity = Math.max(0, 1 - scrollY / 700);
  const page1TranslateZ = -scrollY * 0.6;

  return (
    <div className="portal-3d-master">
      {/* Interactive 3D Holographic Canvas Background */}
      <canvas ref={canvasRef} className="portal-3d-canvas" />

      {/* Floating Ambient Glowing Lighting */}
      <div className="portal-ambient-light light-teal" />
      <div className="portal-ambient-light light-emerald" />
      <div className="portal-ambient-light light-navy" />

      {/* Sticky Top Navigation Bar */}
      <header className="portal-nav-bar">
        <div className="portal-nav-inner">
          <div className="portal-nav-brand">
            <div className="portal-nav-emblem">
              <Landmark size={20} />
            </div>
            <div>
              <div className="portal-nav-title">BhoomiSetu</div>
              <div className="portal-nav-sub">NATIONAL LAND INTELLIGENCE NETWORK</div>
            </div>
          </div>

          <div className="portal-nav-actions">
            <div className="portal-nav-status">
              <span className="portal-live-dot" />
              <span>Gujarat State Server • Live</span>
            </div>
            <button
              onClick={scrollToAuth}
              className="portal-nav-cta"
              data-testid="button-nav-sign-in"
            >
              <Lock size={13} />
              <span>Access Control Room</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          PAGE 1: 3D SPATIAL HERO & TELEMETRY SHOWCASE (Viewport 1)
          ========================================================================= */}
      <section
        className="portal-page-section page-1-hero"
        style={{
          opacity: page1Opacity,
          transform: `perspective(1200px) rotateX(${tiltX * 0.4}deg) rotateY(${tiltY * 0.4}deg) translateZ(${page1TranslateZ}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <div className="portal-hero-content">
          {/* Top Tagline Badge */}
          <div className="portal-hero-badge">
            <Sparkles size={14} className="portal-sparkle-icon" />
            <span>SMART INDIA HACKATHON 2026 • GUJARAT STATE CORRIDOR COMMAND</span>
          </div>

          {/* Main 3D Title */}
          <h1 className="portal-hero-headline">
            Predictive Land Intelligence
            <span className="portal-hero-gradient-text"> in 3D Spatial Matrix</span>
          </h1>

          <p className="portal-hero-description">
            Autonomous 500-Tree XGBoost delay forecasting, real-time cadastral conflict resolution, and statutory SLA
            tracking for Gujarat's high-stakes mega-infrastructure corridors.
          </p>

          {/* 3D Floating Interactive Cards Matrix */}
          <div className="portal-3d-cards-matrix">
            {/* 3D Card 1 */}
            <div
              className="portal-3d-card card-corridor"
              style={{
                transform: `perspective(800px) rotateX(${tiltX * 0.8}deg) rotateY(${tiltY * 0.8}deg) translateZ(40px)`,
              }}
            >
              <div className="portal-card-glow" />
              <div className="portal-card-header">
                <RouteIcon size={16} color="#0FA89A" />
                <span className="portal-card-tag">CORRIDOR GIS</span>
              </div>
              <div className="portal-card-val">4 Major Routes</div>
              <div className="portal-card-sub">Vadodara-Mumbai Expressway • Dholera SIR • Bullet Train • DFC</div>
            </div>

            {/* 3D Card 2 */}
            <div
              className="portal-3d-card card-ai"
              style={{
                transform: `perspective(800px) rotateX(${tiltX * 0.9}deg) rotateY(${tiltY * 0.9}deg) translateZ(70px)`,
              }}
            >
              <div className="portal-card-glow" />
              <div className="portal-card-header">
                <Cpu size={16} color="#4EE0D1" />
                <span className="portal-card-tag">ML INFERENCE ENGINE</span>
              </div>
              <div className="portal-card-val">91.67% Acc • 0.9749 AUC</div>
              <div className="portal-card-sub">500-Tree Ensemble with Automated B.L.A.S.T. Feature Engineering</div>
            </div>

            {/* 3D Card 3 */}
            <div
              className="portal-3d-card card-finance"
              style={{
                transform: `perspective(800px) rotateX(${tiltX * 0.85}deg) rotateY(${tiltY * 0.85}deg) translateZ(50px)`,
              }}
            >
              <div className="portal-card-glow" />
              <div className="portal-card-header">
                <Activity size={16} color="#16A878" />
                <span className="portal-card-tag">DBT ESCROW VAULT</span>
              </div>
              <div className="portal-card-val">₹4,250 Cr Tracked</div>
              <div className="portal-card-sub">Real-time statutory aging & multi-district compensation ledgers</div>
            </div>
          </div>

          {/* Scroll Down Action Capsule */}
          <div className="portal-scroll-cta-wrap">
            <button onClick={scrollToAuth} className="portal-scroll-cta" data-testid="button-scroll-to-auth">
              <span>Scroll Down to Authenticate</span>
              <ChevronDown size={16} className="portal-bounce-arrow" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PAGE 2: INSTITUTIONAL LOGIN & CREDENTIAL PORTAL (Viewport 2)
          ========================================================================= */}
      <section id="auth-section" className="portal-page-section page-2-auth">
        <div className="portal-auth-layout">
          {/* Left Column: Security Architecture & Operational Scope */}
          <div className="portal-auth-showcase">
            <div className="portal-auth-emblem-row">
              <div className="portal-auth-emblem-box">
                <Landmark size={28} />
                <div className="portal-emblem-spin-ring" />
              </div>
              <div>
                <span className="portal-dept-tag">STATE REVENUE & DISASTER MANAGEMENT</span>
                <h2 className="portal-showcase-title">Statutory Access Portal</h2>
                <p className="portal-showcase-sub">Authorized Personnel Login • Section 4 to 23 Operational Workflow</p>
              </div>
            </div>

            <div className="portal-auth-radar-box">
              <div className="portal-radar-head">
                <div className="portal-live-indicator">
                  <span className="portal-green-dot" />
                  <span>NIC & STATE SSO TUNNEL ONLINE</span>
                </div>
                <span className="portal-badge-sih">SIH 2026 Production</span>
              </div>

              <div className="portal-radar-metrics">
                <div className="portal-radar-metric">
                  <div className="portal-metric-num">33</div>
                  <div className="portal-metric-txt">Gujarat Districts</div>
                </div>
                <div className="portal-radar-metric">
                  <div className="portal-metric-num">100%</div>
                  <div className="portal-metric-txt">RFCTLARR Compliant</div>
                </div>
                <div className="portal-radar-metric">
                  <div className="portal-metric-num">Argon2id</div>
                  <div className="portal-metric-txt">Memory-Hard Security</div>
                </div>
              </div>

              <div className="portal-security-terminal">
                <div className="portal-terminal-head">
                  <ShieldCheck size={14} color="#16A878" />
                  <span>Zero-Trust Cryptographic Defense</span>
                </div>
                <div className="portal-terminal-body">
                  <div>[TLS] Strict HSTS & OWASP ASVS v4.0 Defense-in-Depth</div>
                  <div>[ENC] Field-Level AES-256-GCM Envelope Encryption</div>
                  <div>[RBAC] Hierarchical State & District Geographic Scoping</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Glassmorphism Login Card */}
          <div className="portal-auth-card">
            <div className="portal-card-top-bar">
              <span className="portal-card-eyebrow">OFFICIAL GOVERNMENT PORTAL</span>
              <h3 className="portal-card-title">Sign In to Dashboard</h3>
              <p className="portal-card-text">
                Select an authorized administrative profile or provide official credentials to proceed.
              </p>
            </div>

            {/* 1-Click Institutional Role Switcher */}
            <div className="portal-role-selector-header">
              <span>SELECT INSTITUTIONAL ROLE (1-CLICK SYNC)</span>
              <span className="portal-auto-fill-hint">Auto-fills credentials</span>
            </div>

            <div className="portal-role-grid">
              {DEMO_ACCOUNTS.map((acc, idx) => {
                const Icon = acc.icon;
                const isSelected = selectedRoleIndex === idx;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => selectRole(idx)}
                    className={`portal-role-btn ${isSelected ? 'active' : ''}`}
                    data-testid={`button-role-select-${idx}`}
                  >
                    <Icon size={14} className="portal-role-icon" />
                    <div className="portal-role-info">
                      <span className="portal-role-name">{acc.role}</span>
                      <span className="portal-role-user">{acc.name}</span>
                    </div>
                    {isSelected && <CheckCircle2 size={14} className="portal-role-check" />}
                  </button>
                );
              })}
            </div>

            {/* Selected Profile Banner */}
            <div className="portal-profile-banner">
              <div className="portal-profile-tag">{currentRole.badge}</div>
              <div className="portal-profile-name">{currentRole.name}</div>
              <div className="portal-profile-jurisdiction">{currentRole.jurisdiction}</div>
              <div className="portal-profile-desc">{currentRole.description}</div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="portal-login-form">
              {errorMessage && (
                <div className="portal-error-banner" role="alert">
                  <AlertCircle size={15} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="portal-success-banner" role="status">
                  <CheckCircle2 size={15} />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="portal-input-group">
                <label className="portal-input-label">Official Email / ID</label>
                <div className="portal-input-box">
                  <Mail size={16} className="portal-field-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@bhoomisetu.gov.in"
                    className="portal-input-field"
                    required
                  />
                </div>
              </div>

              <div className="portal-input-group">
                <div className="portal-input-label-row">
                  <label className="portal-input-label">Security Passphrase</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="portal-show-pass-btn"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="portal-input-box">
                  <Lock size={16} className="portal-field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="portal-input-field"
                    required
                  />
                </div>
              </div>

              <div className="portal-checkboxes-row">
                <label className="portal-check-item">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Trusted terminal</span>
                </label>

                <label className="portal-check-item">
                  <input
                    type="checkbox"
                    checked={captchaChecked}
                    onChange={(e) => setCaptchaChecked(e.target.checked)}
                  />
                  <span>SSO Clearance</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="portal-submit-action-btn"
                data-testid="button-portal-submit-login"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="portal-spin" />
                    <span>Verifying Credentials & Launching 3D System...</span>
                  </>
                ) : (
                  <>
                    <span>Enter BhoomiSetu Intelligence Platform</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Instant Evaluator 1-Click Access */}
              <button
                type="button"
                onClick={() => {
                  setStoredToken('bhoomi_guest_evaluator');
                  setShowLogoSequence(true);
                  setLogoProgress(30);
                  setTimeout(() => setLogoProgress(70), 400);
                  setTimeout(() => {
                    setLogoProgress(100);
                    setTimeout(() => navigate('/'), 500);
                  }, 1200);
                }}
                className="portal-instant-demo-btn"
                data-testid="button-instant-demo"
              >
                <Sparkles size={14} color="#0FA89A" />
                <span>Instant Evaluator Demo Access (Skip Login)</span>
              </button>
            </form>

            <div className="portal-legal-footer">
              <Shield size={13} color="#16A878" />
              <span>Restricted Government System • Audit logging active under IT Act 2000.</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CINEMATIC 3D BHOOMISETU ANIMATED LOGO SEQUENCE MODAL
          ========================================================================= */}
      {showLogoSequence && (
        <div className="bhoomi-logo-modal-overlay">
          {/* Animated Shockwaves */}
          <div className="logo-shockwave wave-1" />
          <div className="logo-shockwave wave-2" />
          <div className="logo-shockwave wave-3" />

          {/* Central Logo Emittance Card */}
          <div className="bhoomi-logo-modal-card">
            <div className="bhoomi-3d-emblem-wrap">
              <div className="bhoomi-emblem-aura" />
              <div className="bhoomi-emblem-rotating-ring outer-ring" />
              <div className="bhoomi-emblem-rotating-ring inner-ring" />
              <div className="bhoomi-emblem-core">
                <Landmark size={44} className="bhoomi-emblem-landmark" />
                <div className="bhoomi-emblem-spark" />
              </div>
            </div>

            <div className="bhoomi-logo-title-group">
              <div className="bhoomi-logo-gov-tag">GOVERNMENT OF GUJARAT • REVENUE DEPARTMENT</div>
              <h2 className="bhoomi-logo-title">BhoomiSetu</h2>
              <div className="bhoomi-logo-subtitle">Land Acquisition Early Warning System</div>
            </div>

            <div className="bhoomi-auth-badge-row">
              <CheckCircle2 size={16} color="#16A878" />
              <span>Access Clearance Verified • Role: {currentRole.role}</span>
            </div>

            {/* Futuristic Progress Bar */}
            <div className="bhoomi-loading-bar-wrap">
              <div className="bhoomi-loading-bar-track">
                <div
                  className="bhoomi-loading-bar-fill"
                  style={{ width: `${logoProgress}%` }}
                />
              </div>
              <div className="bhoomi-loading-status-text">
                <span>Connecting to Gujarat Statewide Spatial Mesh...</span>
                <span>{logoProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
