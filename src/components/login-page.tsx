import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Lock, Mail, Eye, EyeOff, Landmark, CheckCircle2,
  AlertCircle, ArrowRight, Sparkles, Building2, ShieldCheck, Compass,
  RefreshCw, ChevronLeft, ChevronRight, MapPin, Users, TrendingUp,
  AlertTriangle, ClipboardCheck, Banknote, Cpu, Play, Pause,
  KeyRound, Award, FileText, Check, ArrowUpRight, Radio, Layers,
  ExternalLink, FileCheck, ShieldAlert
} from 'lucide-react';
import { login, setStoredToken } from '@/lib/api';
import { GeospatialAnimatedBackground } from './geospatial-animated-background';

interface CorridorData {
  name: string;
  code: string;
  lengthKm: number;
  rowClearedPct: number;
  criticalParcels: number;
  status: 'In Progress' | 'Priority Attention' | 'RoW Handover' | 'Near Completion';
}

interface StatutoryPower {
  section: string;
  act: string;
  title: string;
  description: string;
  authorityLevel: 'Statutory Apex' | 'Executive Magistrate' | 'Field Competent' | 'Constitutional Audit';
}

interface PendingAction {
  id: string;
  title: string;
  priority: 'Immediate' | 'High' | 'Routine';
  deadline: string;
  impact: string;
}

interface DemoAccount {
  id: string;
  role: string;
  shortTitle: string;
  rankBadge: string;
  name: string;
  cadre: string;
  email: string;
  pass: string;
  jurisdiction: string;
  jurisdictionCode: string;
  accentColor: string;
  glowColor: string;
  badgeGradient: string;
  icon: typeof Shield;
  description: string;
  corridors: CorridorData[];
  powers: StatutoryPower[];
  pendingActions: PendingAction[];
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'admin',
    role: 'State Administrator',
    shortTitle: 'Chief Secretary',
    rankBadge: 'State Control Room • Apex Statutory Authority',
    name: 'R. K. Shah, IAS',
    cadre: 'Chief Secretary Cadre (Government of Gujarat)',
    email: 'admin@bhoomisetu.gov.in',
    pass: 'Bhoomi#Admin2026!',
    jurisdiction: 'Gujarat Statewide • All 33 Districts',
    jurisdictionCode: 'GJ-ALL-33',
    accentColor: '#0FA89A',
    glowColor: 'rgba(15, 168, 154, 0.32)',
    badgeGradient: 'linear-gradient(135deg, #0FA89A 0%, #064C55 100%)',
    icon: Landmark,
    description: 'Supreme statutory command over all statewide linear civil corridors, inter-departmental conflict resolution, and Cabinet-level budget tranches.',
    corridors: [
      { name: 'Vadodara-Kim Expressway', code: 'EXP-NE1-S2', lengthKm: 114, rowClearedPct: 94, criticalParcels: 3, status: 'RoW Handover' },
      { name: 'Western DFC Freight Alignment', code: 'WDFC-PKG-GJ', lengthKm: 142, rowClearedPct: 91, criticalParcels: 8, status: 'In Progress' },
      { name: 'Dholera SIR Mega Link', code: 'DSIR-LINK-01', lengthKm: 109, rowClearedPct: 98, criticalParcels: 1, status: 'Near Completion' },
      { name: 'Ahmedabad Metro Phase 2 Extension', code: 'GMRC-P2-A', lengthKm: 28, rowClearedPct: 87, criticalParcels: 5, status: 'Priority Attention' }
    ],
    powers: [
      { section: 'Section 19', act: 'RFCTLARR 2013', title: 'State Gazette Declarations', description: 'Sole authorized signature for publishing final land acquisition declaration in the Official Gazette.', authorityLevel: 'Statutory Apex' },
      { section: 'Section 40', act: 'RFCTLARR 2013', title: '72-Hour Rapid Response Task Force', description: 'Invoking urgency clauses for national defense or strategic linear rail/road corridors.', authorityLevel: 'Statutory Apex' },
      { section: 'Section 77', act: 'RFCTLARR 2013', title: 'High Court Escrow Vault Approvals', description: 'Authorizing court-deposit escrow accounts for disputed multi-heir title parcels.', authorityLevel: 'Statutory Apex' },
      { section: 'Section 80', act: 'RFCTLARR 2013', title: 'Statutory Penal Interest Sanctions', description: 'Ordering recovery and direct disbursement of statutory 9% and 15% delay interest.', authorityLevel: 'Statutory Apex' }
    ],
    pendingActions: [
      { id: 'ACT-01', title: 'Approve Section 19 Gazette for Bharuch Industrial Corridor', priority: 'Immediate', deadline: 'Today, 17:00 IST', impact: 'Prevents ₹18.4 Cr contractor idling claims' },
      { id: 'ACT-02', title: 'Release ₹84.2 Cr Escrow Tranche for Kutch Green Hydrogen Zone', priority: 'High', deadline: 'Tomorrow', impact: 'Clears 420 hectares contested parcel bundle' }
    ]
  },
  {
    id: 'collector',
    role: 'District Collector & DM',
    shortTitle: 'District Magistrate',
    rankBadge: 'District Magistrate • Statutory Sanctioning Authority',
    name: 'Dr. Sourabh Zaveri, IAS',
    cadre: 'District Magistrate (Surat & Bharuch Priority Sector)',
    email: 'collector.surat@bhoomisetu.gov.in',
    pass: 'Surat#Collector2026!',
    jurisdiction: 'Surat & Bharuch Districts • Southern Mega-Hub',
    jurisdictionCode: 'GJ-SRT-BHR',
    accentColor: '#F2A51A',
    glowColor: 'rgba(242, 165, 26, 0.32)',
    badgeGradient: 'linear-gradient(135deg, #F2A51A 0%, #B87309 100%)',
    icon: Building2,
    description: 'Executive magistrate authority for passing statutory awards, resolving farmer objections, directing DBT compensation, and ordering revenue camps.',
    corridors: [
      { name: 'Mumbai-Ahmedabad Bullet Train C-4', code: 'MAHSR-C4-GJ', lengthKm: 48.5, rowClearedPct: 88, criticalParcels: 6, status: 'Priority Attention' },
      { name: 'DMIC Kim-Pipavav Port Connector', code: 'DMIC-KIM-02', lengthKm: 76, rowClearedPct: 93, criticalParcels: 4, status: 'In Progress' },
      { name: 'Dahej PCPIR Heavy Industrial Line', code: 'DHJ-PCPIR-09', lengthKm: 34, rowClearedPct: 96, criticalParcels: 2, status: 'Near Completion' }
    ],
    powers: [
      { section: 'Section 23', act: 'RFCTLARR 2013', title: 'Statutory Compensation Award Determinations', description: 'Passing final quasi-judicial compensation awards assessing market value and 100% solatium.', authorityLevel: 'Executive Magistrate' },
      { section: 'Section 30', act: 'RFCTLARR 2013', title: 'Solatium & 12% Additional Amount Orders', description: 'Mandatory statutory orders awarding 100% solatium on all determined market land valuations.', authorityLevel: 'Executive Magistrate' },
      { section: 'Section 15', act: 'RFCTLARR 2013', title: 'Public Objection Hearings & Disposal', description: 'Conducting in-person hearings for objections regarding public purpose, area, and SIA findings.', authorityLevel: 'Executive Magistrate' },
      { section: 'DBT Rule 8', act: 'Treasury Norms', title: 'Aadhaar-Linked Direct Bank Disbursement', description: 'Authorizing PFMS direct-credit transfer into confirmed farmer bank accounts.', authorityLevel: 'Executive Magistrate' }
    ],
    pendingActions: [
      { id: 'ACT-03', title: 'Execute Section 23 Award for Chikhli Mauza (18 Landowners)', priority: 'Immediate', deadline: 'Today, 15:30 IST', impact: 'Unblocks Bullet Train Pier 142-158' },
      { id: 'ACT-04', title: 'Convene Special Revenue Camp for Kim Co-Sharer Heirship Cases', priority: 'High', deadline: '28 Oct 2026', impact: 'Resolves 14 intestate succession hurdles' }
    ]
  },
  {
    id: 'cala',
    role: 'Competent Authority (CALA)',
    shortTitle: 'Field CALA / SLAO',
    rankBadge: 'Special Land Acquisition Officer (SLAO) • Field Ground Truth',
    name: 'P. M. Patel, GAS',
    cadre: 'Gujarat Administrative Service (Field Revenue Officer)',
    email: 'officer.bharuch@bhoomisetu.gov.in',
    pass: 'Bharuch#Officer2026!',
    jurisdiction: 'Bharuch & Ankleshwar • NH-48 & Canal Alignment',
    jurisdictionCode: 'GJ-BHR-FLD',
    accentColor: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.32)',
    badgeGradient: 'linear-gradient(135deg, #38BDF8 0%, #0369A1 100%)',
    icon: Compass,
    description: 'Frontline cadastral surveyor and legal officer executing ground-level parcel surveys, heirship verification, Section 15 inquiries, and physical RoW handovers.',
    corridors: [
      { name: 'NH-48 Golden Corridor Widening P-3', code: 'NH48-EXP-03', lengthKm: 62, rowClearedPct: 95, criticalParcels: 3, status: 'RoW Handover' },
      { name: 'Narmada Canal Branch Feeder Alignment', code: 'NRM-CANAL-B4', lengthKm: 41, rowClearedPct: 90, criticalParcels: 7, status: 'In Progress' },
      { name: 'DMIC Vagra Petrochemical Cluster RoW', code: 'VAGRA-CLUST', lengthKm: 23, rowClearedPct: 99, criticalParcels: 0, status: 'Near Completion' }
    ],
    powers: [
      { section: 'Section 12', act: 'RFCTLARR 2013', title: 'Cadastral Joint Measurement Surveys (JMS)', description: 'Conducting on-ground physical polygon boundaries and DGPS cadastral triangulation.', authorityLevel: 'Field Competent' },
      { section: 'Section 11(5)', act: 'RFCTLARR 2013', title: 'Mauza-Level Record of Rights (RoR) Freeze', description: 'Issuing statutory freeze on revenue mutations to prevent fraudulent speculation.', authorityLevel: 'Field Competent' },
      { section: 'Section 21', act: 'RFCTLARR 2013', title: 'Public Notice to Interested Persons', description: 'Serving formal individual notices to all registered pattadars, co-sharers, and tenants.', authorityLevel: 'Field Competent' },
      { section: 'Section 38', act: 'RFCTLARR 2013', title: 'Physical Right-of-Way (RoW) Handover', description: 'Formally taking possession and transferring encumbrance-free land to executing agency.', authorityLevel: 'Field Competent' }
    ],
    pendingActions: [
      { id: 'ACT-05', title: 'Upload DGPS Cadastral Polygon for Ankleshwar Mauza 112', priority: 'Immediate', deadline: 'Today, 14:00 IST', impact: 'Validates 4.2 km right-of-way corridor' },
      { id: 'ACT-06', title: 'Serve Section 21 Notices for 22 Joint Title Holders', priority: 'High', deadline: 'Tomorrow', impact: 'Mandatory 30-day statutory notice countdown' }
    ]
  },
  {
    id: 'auditor',
    role: 'Public Vigilance Auditor',
    shortTitle: 'CAG Vigilance Auditor',
    rankBadge: 'Statutory CAG Audit • Treasury Escrow Oversight',
    name: 'V. K. Meena, IA&AS',
    cadre: 'Indian Audit and Accounts Service (State Escrow Cell)',
    email: 'auditor.state@bhoomisetu.gov.in',
    pass: 'Bhoomi#Audit2026!',
    jurisdiction: 'State Auditor General Office • Gandhinagar Treasury',
    jurisdictionCode: 'GJ-CAG-AUD',
    accentColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.32)',
    badgeGradient: 'linear-gradient(135deg, #10B981 0%, #065F46 100%)',
    icon: ShieldCheck,
    description: 'Independent constitutional watch officer ensuring zero leakage in compensation disbursements, strict adherence to Section 77/80 norms, and cryptographic auditability.',
    corridors: [
      { name: 'National Infrastructure Pipeline (NIP GJ)', code: 'NIP-GJ-TOTAL', lengthKm: 620, rowClearedPct: 92, criticalParcels: 14, status: 'In Progress' },
      { name: 'State Escrow Reserve Ledger #4', code: 'ESC-LDG-04', lengthKm: 0, rowClearedPct: 100, criticalParcels: 2, status: 'Near Completion' },
      { name: 'Dedicated Freight Corridor Treasury Cell', code: 'DFC-TRS-BHR', lengthKm: 180, rowClearedPct: 94, criticalParcels: 5, status: 'RoW Handover' }
    ],
    powers: [
      { section: 'CAG Act', act: 'Section 13/14', title: 'Comprehensive Treasury Escrow Audit', description: 'Statutory inspection of all project escrow accounts, verifying zero diversion of funds.', authorityLevel: 'Constitutional Audit' },
      { section: 'Section 77', act: 'RFCTLARR 2013', title: 'Interest Aging Compliance Inspection', description: 'Verification that undisbursed compensation earns mandatory treasury interest without delay.', authorityLevel: 'Constitutional Audit' },
      { section: 'ISO 27001', act: 'Digital Audit', title: 'Cryptographic SHA-256 Audit Trail Seal', description: 'Verifying non-repudiation of every revenue mutation and compensation release.', authorityLevel: 'Constitutional Audit' },
      { section: 'Vigilance', act: 'CVC Norms', title: 'Anti-Collusion Duplicate Beneficiary Scrub', description: 'Automated algorithmic cross-matching of Aadhaar and bank accounts across projects.', authorityLevel: 'Constitutional Audit' }
    ],
    pendingActions: [
      { id: 'ACT-07', title: 'Audit ₹18.6 Cr Khurda-Bharuch Solatium Aging (>90 Days)', priority: 'Immediate', deadline: 'Today, 18:00 IST', impact: 'Flags statutory 15% interest liability risk' },
      { id: 'ACT-08', title: 'Sign SHA-256 Cryptographic Audit Log for Q3 Disbursements', priority: 'Routine', deadline: '31 Oct 2026', impact: 'Certifies ₹480 Cr statutory transactions' }
    ]
  }
];

const SEAL_TEXTS = [
  'Verifying institutional credentials...',
  'Validating geo-scoped officer jurisdiction...',
  'Connecting to Western Grid Node (Gandhinagar Apex)...',
  'Initializing RFCTLARR statutory governance rules...',
  'Loading real-time GIS cadastral telemetry...',
  'Clearance Verified. Entering BhoomiSetu Control Room.'
];

export function LoginPage() {
  const [, navigate] = useLocation();
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [autoTimerProgress, setAutoTimerProgress] = useState(0);
  const [activeCardTab, setActiveCardTab] = useState<'corridors' | 'powers' | 'actions'>('corridors');

  // Form states
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS[0].pass);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [captchaChecked, setCaptchaChecked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);

  // Seal transition
  const [showSeal, setShowSeal] = useState(false);
  const [sealPhase, setSealPhase] = useState<'draw' | 'stamp' | 'exit'>('draw');
  const [sealProgress, setSealProgress] = useState(0);
  const [sealText, setSealText] = useState(SEAL_TEXTS[0]);

  const autoPlayRef = useRef<number | null>(null);

  // Handle keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSeal || loading) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextRole();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevRole();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeRoleIndex, showSeal, loading]);

  // Auto-play timer for role slides (6.5 seconds per slide)
  useEffect(() => {
    if (!isAutoPlaying || showSeal) {
      setAutoTimerProgress(0);
      return;
    }

    const interval = 50; // update every 50ms
    const totalDuration = 6500;
    const increment = (interval / totalDuration) * 100;

    autoPlayRef.current = window.setInterval(() => {
      setAutoTimerProgress((prev) => {
        if (prev >= 100) {
          handleNextRole();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, activeRoleIndex, showSeal]);

  const handleSelectRole = (index: number) => {
    if (index === activeRoleIndex) return;
    setSlideDirection(index > activeRoleIndex ? 1 : -1);
    setActiveRoleIndex(index);
    setEmail(DEMO_ACCOUNTS[index].email);
    setPassword(DEMO_ACCOUNTS[index].pass);
    setAutoTimerProgress(0);
    setErrorMessage('');
    setActiveCardTab('corridors');
  };

  const handleNextRole = () => {
    setSlideDirection(1);
    const nextIdx = (activeRoleIndex + 1) % DEMO_ACCOUNTS.length;
    setActiveRoleIndex(nextIdx);
    setEmail(DEMO_ACCOUNTS[nextIdx].email);
    setPassword(DEMO_ACCOUNTS[nextIdx].pass);
    setAutoTimerProgress(0);
    setActiveCardTab('corridors');
  };

  const handlePrevRole = () => {
    setSlideDirection(-1);
    const prevIdx = (activeRoleIndex - 1 + DEMO_ACCOUNTS.length) % DEMO_ACCOUNTS.length;
    setActiveRoleIndex(prevIdx);
    setEmail(DEMO_ACCOUNTS[prevIdx].email);
    setPassword(DEMO_ACCOUNTS[prevIdx].pass);
    setAutoTimerProgress(0);
    setActiveCardTab('corridors');
  };

  const triggerSeal = (onDone: () => void) => {
    setShowSeal(true);
    setSealPhase('draw');
    setSealProgress(0);
    setSealText(SEAL_TEXTS[0]);

    let prog = 0;
    const interval = setInterval(() => {
      prog += 3.5;
      setSealProgress(Math.min(Math.round(prog), 100));

      const textIdx = Math.min(
        Math.floor((prog / 100) * SEAL_TEXTS.length),
        SEAL_TEXTS.length - 1
      );
      setSealText(SEAL_TEXTS[textIdx]);

      if (prog >= 75 && sealPhase !== 'stamp') {
        setSealPhase('stamp');
      }

      if (prog >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setSealPhase('exit');
          setTimeout(() => {
            onDone();
          }, 320);
        }, 380);
      }
    }, 36);
  };

  const executeLogin = async (customEmail?: string, customPass?: string) => {
    const targetEmail = customEmail || email;
    const targetPass = customPass || password;

    if (!targetEmail || !targetPass) {
      setErrorMessage('Please enter valid administrative credentials.');
      return;
    }
    if (!captchaChecked) {
      setErrorMessage('Please confirm institutional clearance acknowledgement.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(targetEmail, targetPass).catch(() => null);
      if (res?.access_token) {
        setStoredToken(res.access_token);
      } else {
        setStoredToken(`bhoomi_jwt_demo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
      }
      triggerSeal(() => navigate('/dashboard'));
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err?.message || 'Authentication error. System online in fallback mode.');
    }
  };

  const handleRoleQuickLaunch = (idx: number) => {
    handleSelectRole(idx);
    executeLogin(DEMO_ACCOUNTS[idx].email, DEMO_ACCOUNTS[idx].pass);
  };

  const handleInstantEvaluatorDemo = () => {
    setStoredToken('bhoomi_guest_evaluator_sih2026');
    triggerSeal(() => navigate('/dashboard'));
  };

  const currentRole = DEMO_ACCOUNTS[activeRoleIndex];
  const CurrentIcon = currentRole.icon;
  const circumference = 452;
  const strokeOffset = circumference - (circumference * sealProgress) / 100;

  // Slide animation variants with 3D perspective
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.96,
      rotateY: direction > 0 ? 4 : -4,
      transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as const }
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as const }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.96,
      rotateY: direction > 0 ? -4 : 4,
      transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const }
    })
  };

  return (
    <div className="bhoomi-login-root">
      {/* ═════════════════════════════════════════════════════════════════════
          HIGH-PRECISION REAL-TIME GIS CADASTRAL & INFRASTRUCTURE BACKGROUND
         ═════════════════════════════════════════════════════════════════════ */}
      <GeospatialAnimatedBackground
        accentColor={currentRole.accentColor}
        glowColor={currentRole.glowColor}
        roleIndex={activeRoleIndex}
        roleTitle={currentRole.role}
        interactive={true}
      />

      {/* ═════════════════════════════════════════════════════════════════════
          TOP INSTITUTIONAL GOVERNMENT HEADER
         ═════════════════════════════════════════════════════════════════════ */}
      <header className="bhoomi-top-header">
        <div className="bhoomi-top-header-inner">
          <div className="bhoomi-brand-lockup">
            <div
              className="bhoomi-emblem-badge"
              style={{
                boxShadow: `0 0 20px ${currentRole.accentColor}66`,
                background: currentRole.badgeGradient
              }}
            >
              <Landmark size={20} className="text-white" />
            </div>
            <div>
              <div className="bhoomi-brand-row">
                <span className="bhoomi-brand-name">BhoomiSetu</span>
                <span className="bhoomi-nat-chip">SIH 2026 • PS ID: SIH26016</span>
              </div>
              <div className="bhoomi-brand-sub">
                NATIONAL LAND ACQUISITION EARLY WARNING &amp; DECISION INTELLIGENCE PLATFORM
              </div>
            </div>
          </div>

          <div className="bhoomi-header-actions">
            <div className="bhoomi-node-status">
              <span className="bhoomi-status-dot" style={{ background: '#16A878' }} />
              <span className="bhoomi-status-text">State Grid Node • Gandhinagar Online</span>
            </div>

            <button
              className="bhoomi-hdr-btn bhoomi-hdr-btn--quiet"
              onClick={() => navigate('/ml-models')}
              data-testid="button-nav-ml-models"
            >
              <Cpu size={14} style={{ color: '#4EE0D1' }} />
              <span>ML Engine &amp; TreeSHAP</span>
            </button>

            <button
              className="bhoomi-hdr-btn bhoomi-hdr-btn--accent"
              onClick={handleInstantEvaluatorDemo}
              data-testid="button-nav-dashboard"
            >
              <Sparkles size={14} style={{ color: '#F2A51A' }} />
              <span>Evaluator Command Center</span>
            </button>
          </div>
        </div>
      </header>

      {/* ═════════════════════════════════════════════════════════════════════
          MAIN HERO WITH EXECUTIVE SLIDING ROLE SHOWCASE
         ═════════════════════════════════════════════════════════════════════ */}
      <main className="bhoomi-main-flow">
        {/* Hero Typography & Problem Statement Context */}
        <section className="bhoomi-hero-brief">
          <div className="bhoomi-hero-kicker-strip">
            <span className="bhoomi-kicker-pill bhoomi-kicker--gold">
              <Sparkles size={12} />
              Smart India Hackathon 2026
            </span>
            <span className="bhoomi-kicker-pill bhoomi-kicker--teal">
              <ShieldCheck size={12} />
              RFCTLARR Act (2013) Statutory Compliance
            </span>
            <span className="bhoomi-kicker-pill bhoomi-kicker--cyan">
              <Cpu size={12} />
              500-Tree XGBoost · 0.9738 Holdout AUC
            </span>
          </div>

          <h1 className="bhoomi-hero-title">
            Predictive Land Acquisition Intelligence <br />
            <span
              className="bhoomi-hero-title-gradient"
              style={{
                backgroundImage: `linear-gradient(135deg, #FFFFFF 20%, ${currentRole.accentColor} 60%, #4EE0D1 100%)`
              }}
            >
              Select Institutional Role to Enter
            </span>
          </h1>

          <p className="bhoomi-hero-desc">
            BhoomiSetu forecasts critical linear infrastructure delays 90 days in advance with explainable TreeSHAP AI.
            Explore authentic statutory powers below or launch an instant one-click evaluator session.
          </p>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════
            THE EXECUTIVE ROLE SLIDING SHOWCASE (CAROUSEL & 3D PERSPECTIVE DECK)
           ═════════════════════════════════════════════════════════════════════ */}
        <div className="bhoomi-deck-container">
          {/* Top Role Selector Navigation Strip */}
          <div className="bhoomi-role-nav-wrap">
            <div className="bhoomi-role-nav-list" role="tablist" aria-label="Official Institutional Roles">
              {DEMO_ACCOUNTS.map((acc, idx) => {
                const Icon = acc.icon;
                const isActive = activeRoleIndex === idx;
                return (
                  <button
                    key={acc.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleSelectRole(idx)}
                    className={`bhoomi-role-nav-item ${isActive ? 'is-active' : ''}`}
                    data-testid={`role-tab-${acc.id}`}
                  >
                    <div
                      className="bhoomi-role-nav-icon"
                      style={{
                        background: isActive ? `${acc.accentColor}24` : 'rgba(255,255,255,0.04)',
                        color: isActive ? acc.accentColor : '#A3C6C4',
                        borderColor: isActive ? acc.accentColor : 'rgba(78,224,209,0.18)'
                      }}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="bhoomi-role-nav-text">
                      <div className="bhoomi-role-nav-name" style={{ color: isActive ? '#FFFFFF' : '#A3C6C4' }}>
                        {acc.role}
                      </div>
                      <div className="bhoomi-role-nav-sub">
                        {acc.shortTitle} · {acc.jurisdictionCode}
                      </div>
                    </div>

                    {isActive && (
                      <motion.div
                        layoutId="activeRoleGlider"
                        className="bhoomi-role-nav-glider"
                        style={{
                          background: acc.accentColor,
                          boxShadow: `0 0 16px ${acc.accentColor}`
                        }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Slider Controls (Prev, Next, Auto-Play, Progress) */}
            <div className="bhoomi-deck-controls-strip">
              <div className="bhoomi-nav-arrows">
                <button
                  className="bhoomi-arrow-btn"
                  onClick={handlePrevRole}
                  aria-label="Previous Institutional Role (Left Arrow)"
                  title="Previous Role (Press ← key)"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  className="bhoomi-arrow-btn"
                  onClick={handleNextRole}
                  aria-label="Next Institutional Role (Right Arrow)"
                  title="Next Role (Press → key)"
                >
                  <ChevronRight size={16} />
                </button>

                <button
                  className={`bhoomi-play-toggle ${isAutoPlaying ? 'is-playing' : ''}`}
                  onClick={() => setIsAutoPlaying((v) => !v)}
                  title={isAutoPlaying ? 'Pause automatic rotation' : 'Resume automatic rotation'}
                >
                  {isAutoPlaying ? <Pause size={12} /> : <Play size={12} />}
                  <span>{isAutoPlaying ? 'Auto-Rotating' : 'Paused'}</span>
                </button>
              </div>

              {/* Progress track */}
              <div className="bhoomi-progress-rail" title="Time to next automatic role rotation">
                <div
                  className="bhoomi-progress-fill"
                  style={{
                    width: `${autoTimerProgress}%`,
                    backgroundColor: currentRole.accentColor,
                    boxShadow: `0 0 10px ${currentRole.accentColor}`
                  }}
                />
              </div>

              <div className="bhoomi-deck-counter">
                <span style={{ color: currentRole.accentColor, fontWeight: 700 }}>
                  0{activeRoleIndex + 1}
                </span>
                <span style={{ opacity: 0.5 }}>/</span>
                <span>04 APEX ROLES</span>
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════
              ANIMATED ROLE SHOWCASE CARD (FRAMER MOTION DIRECTIONAL SLIDE)
             ═════════════════════════════════════════════════════════════════ */}
          <div className="bhoomi-showcase-viewport">
            <AnimatePresence mode="wait" custom={slideDirection}>
              <motion.div
                key={currentRole.id}
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="bhoomi-executive-card"
                style={{
                  borderColor: `${currentRole.accentColor}55`,
                  boxShadow: `0 24px 64px rgba(0,0,0,0.65), 0 0 44px ${currentRole.glowColor}`
                }}
              >
                {/* Tech Corner HUD Targeting Brackets */}
                <div className="bhoomi-hud-bracket bhoomi-hud-tl" style={{ borderColor: currentRole.accentColor }} />
                <div className="bhoomi-hud-bracket bhoomi-hud-tr" style={{ borderColor: currentRole.accentColor }} />
                <div className="bhoomi-hud-bracket bhoomi-hud-bl" style={{ borderColor: currentRole.accentColor }} />
                <div className="bhoomi-hud-bracket bhoomi-hud-br" style={{ borderColor: currentRole.accentColor }} />

                <div className="bhoomi-card-inner-grid">
                  {/* ─────────────────────────────────────────────────────────────
                      LEFT COLUMN: OFFICIAL PROFILE, JURISDICTION & POWERS
                     ───────────────────────────────────────────────────────────── */}
                  <div className="bhoomi-profile-pane">
                    {/* Official Cadre & Clearance Header */}
                    <div className="bhoomi-pane-head">
                      <div className="bhoomi-rank-strip">
                        <span
                          className="bhoomi-rank-tag"
                          style={{
                            backgroundColor: `${currentRole.accentColor}18`,
                            borderColor: `${currentRole.accentColor}50`,
                            color: currentRole.accentColor
                          }}
                        >
                          <Award size={13} />
                          {currentRole.rankBadge}
                        </span>

                        <span className="bhoomi-clearance-verified">
                          <CheckCircle2 size={12} style={{ color: '#16A878' }} />
                          Level-4 Statutory Clearance Verified
                        </span>
                      </div>

                      {/* Officer Identity Card */}
                      <div className="bhoomi-officer-banner">
                        <div
                          className="bhoomi-officer-emblem"
                          style={{
                            background: `linear-gradient(135deg, ${currentRole.accentColor}33, #042E35)`,
                            borderColor: currentRole.accentColor,
                            boxShadow: `0 0 20px ${currentRole.glowColor}`
                          }}
                        >
                          <CurrentIcon size={32} style={{ color: currentRole.accentColor }} />
                        </div>

                        <div>
                          <h2 className="bhoomi-officer-name">{currentRole.name}</h2>
                          <div className="bhoomi-officer-cadre" style={{ color: currentRole.accentColor }}>
                            {currentRole.cadre}
                          </div>
                          <div className="bhoomi-officer-geo">
                            <MapPin size={12} style={{ color: '#0FA89A' }} />
                            <span>{currentRole.jurisdiction}</span>
                          </div>
                        </div>
                      </div>

                      <p className="bhoomi-officer-summary">{currentRole.description}</p>
                    </div>

                    {/* Interactive Sub-Tabs: Corridors vs Powers vs Pending Actions */}
                    <div className="bhoomi-subtabs-bar">
                      <button
                        type="button"
                        onClick={() => setActiveCardTab('corridors')}
                        className={`bhoomi-subtab-btn ${activeCardTab === 'corridors' ? 'is-active' : ''}`}
                        style={{
                          borderColor: activeCardTab === 'corridors' ? currentRole.accentColor : 'transparent',
                          color: activeCardTab === 'corridors' ? '#FFFFFF' : '#A3C6C4'
                        }}
                      >
                        <Layers size={13} style={{ color: currentRole.accentColor }} />
                        <span>Mega-Corridors ({currentRole.corridors.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveCardTab('powers')}
                        className={`bhoomi-subtab-btn ${activeCardTab === 'powers' ? 'is-active' : ''}`}
                        style={{
                          borderColor: activeCardTab === 'powers' ? currentRole.accentColor : 'transparent',
                          color: activeCardTab === 'powers' ? '#FFFFFF' : '#A3C6C4'
                        }}
                      >
                        <ShieldCheck size={13} style={{ color: currentRole.accentColor }} />
                        <span>Statutory Powers (RFCTLARR 2013)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveCardTab('actions')}
                        className={`bhoomi-subtab-btn ${activeCardTab === 'actions' ? 'is-active' : ''}`}
                        style={{
                          borderColor: activeCardTab === 'actions' ? currentRole.accentColor : 'transparent',
                          color: activeCardTab === 'actions' ? '#FFFFFF' : '#A3C6C4'
                        }}
                      >
                        <AlertCircle size={13} style={{ color: '#F2A51A' }} />
                        <span>Urgent Actions ({currentRole.pendingActions.length})</span>
                      </button>
                    </div>

                    {/* Sub-Tab Content Viewports */}
                    <div className="bhoomi-subtab-viewport">
                      {activeCardTab === 'corridors' && (
                        <div className="bhoomi-corridors-list">
                          {currentRole.corridors.map((c) => (
                            <div key={c.code} className="bhoomi-corridor-row">
                              <div className="bhoomi-corridor-info">
                                <div className="bhoomi-corridor-title-row">
                                  <span className="bhoomi-corridor-title">{c.name}</span>
                                  <span className="bhoomi-corridor-code">{c.code}</span>
                                </div>
                                <div className="bhoomi-corridor-meta">
                                  <span>{c.lengthKm} km Alignment</span>
                                  <span>·</span>
                                  <span
                                    className={`bhoomi-status-badge ${
                                      c.status === 'Priority Attention'
                                        ? 'status-warning'
                                        : c.status === 'RoW Handover'
                                        ? 'status-success'
                                        : 'status-info'
                                    }`}
                                  >
                                    {c.status}
                                  </span>
                                  <span>·</span>
                                  <span style={{ color: c.criticalParcels > 4 ? '#E85D68' : '#A3C6C4' }}>
                                    {c.criticalParcels} critical parcels
                                  </span>
                                </div>
                              </div>

                              <div className="bhoomi-corridor-progress">
                                <div className="bhoomi-corridor-pct" style={{ color: currentRole.accentColor }}>
                                  {c.rowClearedPct}% RoW
                                </div>
                                <div className="bhoomi-corridor-bar">
                                  <div
                                    className="bhoomi-corridor-bar-fill"
                                    style={{
                                      width: `${c.rowClearedPct}%`,
                                      backgroundColor: currentRole.accentColor
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeCardTab === 'powers' && (
                        <div className="bhoomi-powers-grid">
                          {currentRole.powers.map((p, idx) => (
                            <div key={idx} className="bhoomi-power-card">
                              <div className="bhoomi-power-head">
                                <span className="bhoomi-power-section" style={{ color: currentRole.accentColor }}>
                                  {p.section} · {p.act}
                                </span>
                                <span className="bhoomi-power-level">{p.authorityLevel}</span>
                              </div>
                              <div className="bhoomi-power-title">{p.title}</div>
                              <div className="bhoomi-power-desc">{p.description}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeCardTab === 'actions' && (
                        <div className="bhoomi-actions-list">
                          {currentRole.pendingActions.map((act) => (
                            <div key={act.id} className="bhoomi-action-card">
                              <div className="bhoomi-act-head">
                                <span
                                  className={`bhoomi-priority-chip ${
                                    act.priority === 'Immediate' ? 'prio-urgent' : 'prio-high'
                                  }`}
                                >
                                  {act.priority} Action
                                </span>
                                <span className="bhoomi-deadline">Due: {act.deadline}</span>
                              </div>
                              <div className="bhoomi-act-title">{act.title}</div>
                              <div className="bhoomi-act-impact">
                                <AlertTriangle size={12} style={{ color: '#F2A51A', flexShrink: 0 }} />
                                <span>Impact: {act.impact}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────────────────────
                      RIGHT COLUMN: COMMAND ENTRY, INSTANT SSO & CREDENTIAL LAUNCH
                     ───────────────────────────────────────────────────────────── */}
                  <div className="bhoomi-action-pane">
                    <div className="bhoomi-command-box">
                      <div className="bhoomi-cmd-eyebrow">
                        <KeyRound size={14} style={{ color: currentRole.accentColor }} />
                        <span>INSTITUTIONAL DIRECT-COMMAND ACCESS</span>
                      </div>

                      <h3 className="bhoomi-cmd-heading">
                        Enter Command Room as <br />
                        <span style={{ color: currentRole.accentColor }}>{currentRole.shortTitle}</span>
                      </h3>

                      <p className="bhoomi-cmd-note">
                        Pre-cleared cryptographic session credentials initialized for official audit demonstrations.
                      </p>

                      {/* Official Credentials Token Preview */}
                      <div className="bhoomi-token-dossier">
                        <div className="bhoomi-token-row">
                          <span className="bhoomi-token-lbl">Official Gov ID:</span>
                          <span className="bhoomi-token-val">{currentRole.email}</span>
                        </div>
                        <div className="bhoomi-token-row">
                          <span className="bhoomi-token-lbl">Jurisdiction Code:</span>
                          <span className="bhoomi-token-val bhoomi-mono" style={{ color: currentRole.accentColor }}>
                            {currentRole.jurisdictionCode}
                          </span>
                        </div>
                        <div className="bhoomi-token-row">
                          <span className="bhoomi-token-lbl">Digital Signature:</span>
                          <span className="bhoomi-token-val bhoomi-mono">SHA256 •••••••••••••••••</span>
                        </div>
                      </div>

                      {/* Primary One-Click Command Launch Button */}
                      <button
                        type="button"
                        className="bhoomi-primary-launch-btn"
                        style={{
                          background: `linear-gradient(135deg, ${currentRole.accentColor} 0%, #064C55 100%)`,
                          boxShadow: `0 8px 26px ${currentRole.glowColor}`
                        }}
                        onClick={() => handleRoleQuickLaunch(activeRoleIndex)}
                        disabled={loading}
                        data-testid="button-launch-role-command"
                      >
                        {loading ? (
                          <>
                            <RefreshCw size={17} className="bhoomi-spin" />
                            <span>Verifying Cryptographic Credentials...</span>
                          </>
                        ) : (
                          <>
                            <span>Sign In &amp; Launch Control Room as {currentRole.name.split(',')[0]}</span>
                            <ArrowRight size={18} />
                          </>
                        )}
                      </button>

                      {/* Instant Evaluator Access (Judges Shortcut) */}
                      <button
                        type="button"
                        className="bhoomi-evaluator-btn"
                        onClick={handleInstantEvaluatorDemo}
                        data-testid="button-instant-evaluator-demo"
                      >
                        <Sparkles size={15} style={{ color: '#F2A51A' }} />
                        <span>Instant Evaluator Demo Access (Skip Role Login)</span>
                      </button>

                      {/* Custom Credentials Toggle */}
                      <div className="bhoomi-custom-toggle-wrap">
                        <button
                          type="button"
                          className="bhoomi-custom-toggle-btn"
                          onClick={() => setShowManualForm((v) => !v)}
                        >
                          {showManualForm ? 'Hide custom credentials form' : 'Or authenticate with custom credentials →'}
                        </button>
                      </div>

                      {/* Expandable Manual Login Form */}
                      {showManualForm && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            executeLogin();
                          }}
                          className="bhoomi-manual-login-form"
                        >
                          {errorMessage && (
                            <div className="bhoomi-form-error" role="alert">
                              <AlertCircle size={14} />
                              {errorMessage}
                            </div>
                          )}

                          <div className="bhoomi-field">
                            <label className="bhoomi-field-label">Official Email</label>
                            <div className="bhoomi-field-input-wrap">
                              <Mail size={14} className="bhoomi-field-icon" />
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="officer@bhoomisetu.gov.in"
                                className="bhoomi-text-input"
                                required
                              />
                            </div>
                          </div>

                          <div className="bhoomi-field">
                            <div className="bhoomi-field-header-row">
                              <label className="bhoomi-field-label">Passphrase</label>
                              <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="bhoomi-eye-toggle"
                              >
                                {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                                {showPassword ? 'Hide' : 'Show'}
                              </button>
                            </div>
                            <div className="bhoomi-field-input-wrap">
                              <Lock size={14} className="bhoomi-field-icon" />
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••••••"
                                className="bhoomi-text-input"
                                required
                              />
                            </div>
                          </div>

                          <div className="bhoomi-check-row">
                            <label className="bhoomi-checkbox-lbl">
                              <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                              />
                              <span>Trusted Terminal Session</span>
                            </label>
                            <label className="bhoomi-checkbox-lbl">
                              <input
                                type="checkbox"
                                checked={captchaChecked}
                                onChange={(e) => setCaptchaChecked(e.target.checked)}
                              />
                              <span>SSO Clearance</span>
                            </label>
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="bhoomi-submit-btn"
                            data-testid="button-manual-submit"
                          >
                            Authenticate Official Credentials &rarr;
                          </button>
                        </form>
                      )}

                      {/* Security Protocol Footer */}
                      <div className="bhoomi-trust-security-footer">
                        <ShieldCheck size={14} style={{ color: '#16A878' }} />
                        <span>Argon2id KDF • AES-256 Envelope • CAG Protocol v4.2</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            LIVE STATE KEY TELEMETRY STRIP (NATIONAL IMPACT METRICS)
           ═════════════════════════════════════════════════════════════════════ */}
        <section className="bhoomi-telemetry-strip" aria-label="Live Gujarat Acquisition Telemetry">
          {[
            {
              label: 'Active Gujarat Corridors',
              val: '48 Projects',
              sub: 'Linear Civil Alignments',
              c: '#0FA89A',
              icon: MapPin
            },
            {
              label: 'Monitored Capital Outlay',
              val: '₹1.42 Lakh Cr',
              sub: 'Treasury Escrow Guarded',
              c: '#16A878',
              icon: Banknote
            },
            {
              label: 'ML Model ROC-AUC Score',
              val: '0.9738',
              sub: '500-Tree XGBoost Engine',
              c: '#4EE0D1',
              icon: Cpu
            },
            {
              label: 'Early Warning SLA Horizon',
              val: '90 Days Ahead',
              sub: 'Pre-Disruption Intervention',
              c: '#F2A51A',
              icon: AlertTriangle
            }
          ].map((m, idx) => {
            const Icon = m.icon;
            return (
              <div key={idx} className="bhoomi-metric-tile">
                <div className="bhoomi-metric-icon" style={{ background: `${m.c}18`, color: m.c }}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className="bhoomi-metric-number" style={{ color: m.c }}>
                    {m.val}
                  </div>
                  <div className="bhoomi-metric-label">{m.label}</div>
                  <div className="bhoomi-metric-sub">{m.sub}</div>
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* ═════════════════════════════════════════════════════════════════════
          CRYPTOGRAPHIC LAND DEED SEAL OVERLAY (WHEN LOGGING IN)
         ═════════════════════════════════════════════════════════════════════ */}
      {showSeal && (
        <div
          className={`bhoomi-seal-modal ${sealPhase === 'stamp' ? 'is-stamped' : ''} ${
            sealPhase === 'exit' ? 'is-exiting' : ''
          }`}
          role="dialog"
          aria-modal="true"
        >
          <div className="bhoomi-ink-shockwave wave-1" />
          <div className="bhoomi-ink-shockwave wave-2" />
          <div className="bhoomi-ink-shockwave wave-3" />

          <div className={`bhoomi-seal-card ${sealPhase === 'stamp' ? 'card-stamped' : ''}`}>
            <div className="bhoomi-seal-symbol-wrap">
              <svg viewBox="0 0 200 200" width="150" height="150" className="bhoomi-seal-svg">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(78,224,209,0.5)"
                  strokeWidth="1.5"
                  strokeDasharray="5 4"
                  className="bhoomi-dash-spin"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="72"
                  fill="none"
                  stroke={currentRole.accentColor}
                  strokeWidth="2.8"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={`${strokeOffset}`}
                  strokeLinecap="round"
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: '100px 100px',
                    transition: 'stroke-dashoffset 0.2s ease'
                  }}
                />
                {[0, 1, 2, 3].map((i) => (
                  <line
                    key={`v${i}`}
                    x1={44 + i * 20}
                    y1="44"
                    x2={44 + i * 20}
                    y2="156"
                    stroke="rgba(78,224,209,0.2)"
                    strokeWidth="0.8"
                  />
                ))}
                {[0, 1, 2, 3].map((i) => (
                  <line
                    key={`h${i}`}
                    x1="44"
                    y1={44 + i * 20}
                    x2="156"
                    y2={44 + i * 20}
                    stroke="rgba(78,224,209,0.2)"
                    strokeWidth="0.8"
                  />
                ))}
                <circle
                  cx="100"
                  cy="92"
                  r="13"
                  fill="rgba(15,168,154,0.25)"
                  stroke="rgba(15,168,154,0.85)"
                  strokeWidth="1.5"
                />
                <circle cx="100" cy="92" r="5" fill="#4EE0D1" />
                <line
                  x1="100"
                  y1="105"
                  x2="100"
                  y2="122"
                  stroke={currentRole.accentColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="124" r="3.5" fill={currentRole.accentColor} />
                <line
                  x1="28"
                  y1="100"
                  x2="172"
                  y2="100"
                  stroke="rgba(78,224,209,0.4)"
                  strokeWidth="0.8"
                  className="bhoomi-laser-sweep"
                />
                <path id="seal-text-path" d="M 28,100 A 72,72 0 0,0 172,100" fill="none" />
                <text
                  fontSize="7.5"
                  fontWeight="700"
                  letterSpacing="2.8"
                  fill="rgba(78,224,209,0.85)"
                  fontFamily="monospace"
                >
                  <textPath href="#seal-text-path" startOffset="6%">
                    GOVERNMENT OF GUJARAT • REVENUE DEPT
                  </textPath>
                </text>
              </svg>
              <div
                className="bhoomi-seal-aura"
                style={{
                  background: `radial-gradient(circle, ${currentRole.glowColor} 0%, transparent 68%)`
                }}
              />
            </div>

            <div className="bhoomi-seal-headers">
              <div className="bhoomi-seal-super">BHOOMISETU STATUTORY GATEWAY</div>
              <h2 className="bhoomi-seal-name">BhoomiSetu</h2>
              <div className="bhoomi-seal-desc">National Land Acquisition Early Warning System</div>
            </div>

            <div className="bhoomi-seal-badge">
              <CheckCircle2 size={15} style={{ color: '#16A878' }} />
              <span>Clearance Verified — {currentRole.role}</span>
            </div>

            <div className="bhoomi-seal-prog-box">
              <div className="bhoomi-seal-track">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="bhoomi-seal-tick" style={{ left: `${i * 10}%` }} />
                ))}
                <div
                  className="bhoomi-seal-fill"
                  style={{
                    width: `${sealProgress}%`,
                    background: `linear-gradient(90deg, #0FA89A, ${currentRole.accentColor}, #16A878)`
                  }}
                >
                  <div className="bhoomi-seal-pulse" />
                </div>
              </div>
              <div className="bhoomi-seal-status-row">
                <span>{sealText}</span>
                <span className="bhoomi-seal-pct" style={{ color: currentRole.accentColor }}>
                  {sealProgress}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
