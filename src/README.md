# 💻 BhoomiSetu — Frontend Architecture & UI Engine

**Smart India Hackathon 2026 | Problem Statement ID: SIH26016**

The BhoomiSetu frontend is a modern, high-performance React 19 Single-Page Application (SPA) compiled with Vite 7 and TypeScript 5. It features real-time client-side XGBoost + TreeSHAP inference, high-density GIS corridor rendering, and responsive views optimized for smartphones, tablets, and 4K command centers.

---

## 🏛️ Directory Structure

```
src/
├── app/                  # Application root wrappers & providers
├── assets/               # Static icons, logos, and vector assets
├── components/           # Operational view dashboards & UI components
│   ├── ui/               # 55+ Radix UI & shadcn/ui design primitives
│   ├── corridor-gis-view.tsx            # Cadastral alignment & Right-of-Way GIS
│   ├── district-diagnostics-view.tsx     # District SLA compliance & rankings
│   ├── early-warning-view.tsx           # 72-hour task force triage & dispatch
│   ├── fund-tracking-view.tsx           # Sec 77/80 escrow ledger & DBT waterfalls
│   ├── group-land-view.tsx              # Co-ownership lineage & e-Sign matrix
│   ├── intelligence-modules-view.tsx    # Multi-modal B.L.A.S.T. analytics
│   ├── login-page.tsx                   # Multi-role RBAC authentication portal
│   ├── ml-models-view.tsx               # XGBoost sandbox & Python code inspector
│   ├── project-360-view.tsx             # Counterfactual What-If simulation
│   ├── project-indicator-matrix-modal.tsx # AI assist diagnostic modal
│   └── state-benchmarking-view.tsx      # Interstate comparative SLA matrix
├── context/              # React context providers (theme, auth, user session)
├── hooks/                # Custom React hooks (use-mobile, use-toast, use-auth)
├── lib/                  # Core client-side libraries
│   ├── api.ts            # REST client with automatic fallback routing
│   ├── ml-engine.ts      # Zero-latency compiled XGBoost inference & TreeSHAP math
│   ├── mockData.ts       # Validated master dataset & geo-spatial mock records
│   ├── syncService.ts    # Bi-directional state & telemetry synchronization
│   └── utils.ts          # Tailwind styling & class merging utilities
├── pages/                # Route fallback pages (e.g., not-found.tsx)
├── styles/               # Global CSS, institutional color palette, animations
├── types/                # Strict TypeScript interfaces and statutory enums
├── App.tsx               # Main application routing & responsive AppShell
└── main.tsx              # React DOM entrypoint
```

---

## ⚡ Key Frontend Capabilities

1. **Zero-Latency In-Browser ML Engine (`src/lib/ml-engine.ts`):**  
   Executes the full 500-Tree XGBoost ensemble and TreeSHAP attribution math in under 5ms directly inside the user's browser, eliminating server cold starts when adjusting sliders.
2. **Institutional Ocean Teal Design System:**  
   Tailwind CSS v4 with custom color ramps (`--ocean-teal`, `--dark-teal`, `--navy-primary`, `--status-danger`), accessible contrast, and smooth micro-animations.
3. **Multi-Device Responsiveness:**  
   Adaptive bottom navigation bar on smartphones ($\le 768\text{px}$), slide-over navigation drawer, and fluid grid layouts.
4. **Offline Capability & PWA Ready:**  
   Service worker and local caching support uninterrupted field operation for district surveyors.
