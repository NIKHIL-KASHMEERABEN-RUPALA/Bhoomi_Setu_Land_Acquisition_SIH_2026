# 🏛️ BhoomiSetu (भूमि सेतु)
### AI-Powered Land Acquisition Early Warning System & Decision Intelligence Platform
**Smart India Hackathon 2026 | Problem Statement ID: SIH26016**  
*Predictive Foresight · Statutory Precision · National Governance at Scale*

---

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Production-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://bhoomisetu.vercel.app)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python 3.11](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Production%20REST-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![XGBoost](https://img.shields.io/badge/XGBoost-500--Tree%20Ensemble-EB5424?style=for-the-badge)](https://xgboost.readthedocs.io)
[![TreeSHAP](https://img.shields.io/badge/Explainability-TreeSHAP-0FA89A?style=for-the-badge)](https://shap.readthedocs.io)
[![RFCTLARR Act](https://img.shields.io/badge/Statutory-RFCTLARR%202013-16A878?style=for-the-badge)](https://legislative.gov.in)

---

## 📌 Executive Summary

Over **44% of mega-infrastructure projects in India face severe time and cost overruns**, with nearly two-thirds of stalled corridors directly hindered by **land acquisition bottlenecks**. Under the **RFCTLARR Act of 2013**, when statutory milestones lapse (e.g., Section 11 preliminary notifications, Section 19 declarations, or Section 23 award inquiries), projects risk lapsing into multi-crore arbitrations, court injunctions, and public friction.

**BhoomiSetu transforms land acquisition governance from a reactive struggle into proactive, data-driven foresight.** Grounded in statutory Indian land laws and linear civil engineering practices, BhoomiSetu forecasts critical project delays **90 days in advance** with **91.37% accuracy and an ROC-AUC of 0.9738**, pinpoints exact statutory drivers via **TreeSHAP local attributions**, and enables decision-makers to test policy interventions in a **Counterfactual "What-If" Simulation Sandbox**.

---

## 🏛️ Comprehensive Folder-Wise Architecture

The BhoomiSetu repository is organized into five modular subsystems, engineered for enterprise reliability, Vercel serverless deployment, and maintainability:

```
bhoomisetu/
│
├── 📂 src/                        # [FRONTEND] React 19 + TypeScript + Vite SPA
│   ├── app/                       # Application root providers & layout wrappers
│   ├── assets/                    # Vector icons, government emblems & graphic assets
│   ├── components/                # 14 Operational View Dashboards & Subsystems
│   │   ├── ui/                    # 55+ Radix UI & shadcn/ui accessible primitives
│   │   ├── corridor-gis-view.tsx            # Cadastral alignment & Right-of-Way GIS
│   │   ├── district-diagnostics-view.tsx     # District SLA compliance & rankings
│   │   ├── early-warning-view.tsx           # 72-hour task force triage & dispatch
│   │   ├── fund-tracking-view.tsx           # Sec 77/80 escrow ledger & DBT waterfalls
│   │   ├── group-land-view.tsx              # Co-ownership lineage & e-Sign matrix
│   │   ├── intelligence-modules-view.tsx    # Multi-modal B.L.A.S.T. analytics
│   │   ├── login-page.tsx                   # Multi-role RBAC authentication portal
│   │   ├── ml-models-view.tsx               # XGBoost sandbox & Python code inspector
│   │   ├── project-360-view.tsx             # Counterfactual What-If simulation
│   │   ├── project-indicator-matrix-modal.tsx # AI assist diagnostic modal
│   │   └── state-benchmarking-view.tsx      # Interstate comparative SLA matrix
│   ├── context/                   # Global theme, auth tokens & session context
│   ├── hooks/                     # Custom React hooks (use-mobile, use-toast)
│   ├── lib/                       # Core client-side libraries
│   │   ├── api.ts                 # REST client with automatic fallback routing
│   │   ├── ml-engine.ts           # Zero-latency compiled XGBoost inference & TreeSHAP math
│   │   ├── mockData.ts            # Validated master dataset & geo-spatial mock records
│   │   ├── syncService.ts         # Bi-directional state & telemetry synchronization
│   │   └── utils.ts               # Tailwind styling & class merging utilities
│   ├── pages/                     # Route fallback pages (not-found.tsx)
│   ├── styles/                    # Global CSS, institutional color palette, animations
│   ├── types/                     # Strict TypeScript interfaces and statutory enums
│   ├── App.tsx                    # Main routing, AppShell & responsive mobile drawer
│   └── main.tsx                   # React DOM entrypoint
│
├── 📂 backend/                    # [BACKEND] Production Microservices & Entrypoints
│   ├── server.py                  # Standalone Uvicorn runner for local & server hosting
│   └── README.md                  # Backend API routing and microservice architecture
│
├── 📂 api/                        # [VERCEL SERVERLESS] Serverless API Gateway
│   └── index.py                   # Vercel Python runtime entrypoint bridging to FastAPI
│
├── 📂 database/                   # [DATABASE] Relational Data Layer & Ingestion ETL
│   ├── schema.sql                 # DDL relational schema for PostgreSQL / SQLite
│   ├── seed_data.py               # Automated ETL pipeline ingesting master CSVs
│   ├── queries.py                 # Pre-built statutory analytical SQL queries
│   └── README.md                  # Entity Relationship Model & Database setup guide
│
├── 📂 ml/                         # [AI & MACHINE LEARNING] Predictive Subsystem
│   ├── config.py                  # Model hyperparameters, statutory schemas & risk bands
│   ├── feature_engineering.py     # 21 statutory interaction features (B.L.A.S.T.)
│   ├── preprocessing.py           # RobustScaler & OneHotEncoder column transformers
│   ├── train.py                   # 500-Tree XGBoost training & cross-validation routine
│   ├── predict.py                 # Production batch/single inference & TreeSHAP explainer
│   ├── what_if.py                 # Counterfactual simulation engine for policy levers
│   ├── main_fastapi.py            # Complete FastAPI REST service with /docs OpenAPI UI
│   ├── requirements.txt           # Python dependency manifest
│   └── README.md                  # Detailed ML methodology & statistical proofs
│
├── 📂 models/                     # [SERIALIZED ARTIFACTS] Trained Weights & Metadata
│   ├── bhoomi_xgb_pipeline.joblib # Serialized Pipeline (Preprocessor + 500-Tree XGBoost)
│   ├── bhoomi_shap_explainer.joblib # Serialized TreeSHAP Explainer artifact
│   ├── model_metadata.json        # Holdout metrics, ROC-AUC score & audit trail
│   ├── sample_projects.json       # Representative test cases across 12 Indian states
│   └── README.md                  # Artifact specifications and verification checksums
│
├── 📂 docs/                       # [DOCUMENTATION & PRESENTATIONS] Official Submissions
│   ├── presentations/             # Official PPTX pitch decks & HTML5 presentations
│   │   ├── BhoomiSetu_SIH2026_Presentation.pptx
│   │   ├── BhoomiSetu_SIH_Official_Submission.pptx
│   │   ├── SIH2026-IDEA-Presentation-Format.pptx
│   │   └── BhoomiSetu_Presentation.html
│   ├── SECURITY.md                # Government-grade security, RBAC & cryptography spec
│   └── README.md                  # Documentation index & evaluation guide
│
├── 📂 hf_space/                   # [HUGGING FACE] 1-Click Gradio Space Package
│   ├── app.py                     # Standalone interactive Gradio demo application
│   ├── requirements.txt           # Hugging Face deployment dependencies
│   └── README.md                  # Hugging Face Spaces metadata card
│
├── 📄 package.json                # Frontend package dependencies & scripts
├── 📄 tsconfig.json               # Strict TypeScript configuration
├── 📄 vite.config.ts              # Vite 7 build configuration
├── 📄 vercel.json                 # Vercel routing, rewrites & security headers
├── 📄 requirements.txt            # Root Python dependencies
├── 📄 app.py                      # Root Hugging Face auto-detection entrypoint
└── 📄 land_acquisition_master.csv  # 30,000-record empirical land acquisition dataset
```

---

## 🛠️ Technology Stack Breakdown

| Layer | Technologies Used | Operational Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19**, **TypeScript 5.x**, **Vite 7** | High-performance Single Page Application with instantaneous hot-module replacement and strict type safety. |
| **Styling & Design** | **Tailwind CSS v4**, **Framer Motion**, **Lucide Icons** | Bespoke Ocean Teal Institutional UI (`#0FA89A`, `#064C55`, `#102A43`), fluid typography (`clamp`), accessible contrast. |
| **Mobile & PWA** | **Responsive Bottom Nav**, **Slide-Over Drawer** | Native app-like experience on iOS/Android smartphones ($\le 768\text{px}$) with safe-area notch and home-bar support. |
| **Backend & Microservices** | **FastAPI**, **Uvicorn**, **Pydantic v2** | Asynchronous Python REST service exposing `/api/v1/predict`, `/api/v1/simulate`, and interactive Swagger `/docs`. |
| **Cloud Deployment** | **Vercel** (`vercel.json`), **Hugging Face Spaces** | Edge-accelerated static asset delivery with zero-cold-start frontend routing and serverless Python integration. |
| **Predictive ML Model** | **XGBoost 2.0+** (`tree_method='hist'`) | 500-Tree ensemble classifier with depth 6 regularized gradient boosting trained on 30,000 multi-state records. |
| **Explainable AI (XAI)** | **TreeSHAP** (`shap.TreeExplainer`) | Exact local attribution calculating the mathematical contribution of each statutory feature to delay risk. |
| **Database & Ingestion** | **PostgreSQL**, **SQLite 3**, **SQLAlchemy** | Relational schema with B-Tree indexes for cadastral parcels, escrow accounts, dispute dockets, and audit logs. |
| **Spatial & GIS** | **SVG Cadastral Canvas**, **Real-Time Linear Chainage** | Continuous Right-of-Way (RoW) tracking with survey-level parcel inspection and stay order detection. |
| **Security & Auditing** | **Argon2id**, **JWT**, **SHA-256 Ledger** | CAG Protocol v4.2 immutable cryptographic audit trail and 4-tier Role-Based Access Control (DM, PD, SLAO, Secretary). |

---

## 🧠 Machine Learning Engine & Benchmark Scorecard

BhoomiSetu employs a domain-engineered **B.L.A.S.T.** feature framework, translating Indian statutory nuances into 254 mathematical dimensions:

```
       B.L.A.S.T. Statutory Feature Engineering Framework
 ┌──────────────────────────────────────────────────────────────┐
 │ [B] Budget & Solatium Health  : Compensation pending %, DBT  │
 │ [L] Legal Risk Velocity       : Court writs, stay petitions  │
 │ [A] Acquisition Progress      : Sec 11 to 23 milestone days  │
 │ [S] Social Friction Index     : Objections, R&R grievances   │
 │ [T] Temporal Stagnation       : Stage inactivity multipliers │
 └──────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
         500-Tree Regularized XGBoost Classifier
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼                                           ▼
 90-Day Delay Probability                    TreeSHAP Local Drivers
 (P ∈ [0.0, 1.0], Calibrated Bands)          (Exact Feature ± Impact %)
```

### 🏆 Verified Model Evaluation (Holdout Test Set: 6,000 Records)

| Metric | Score | SIH Target | Benchmark Status | Operational Meaning |
| :--- | :---: | :---: | :---: | :--- |
| **ROC-AUC** | **0.9738** | > 0.90 | 🟢 **Exceeded** | Exceptional discrimination between delayed and normal corridors |
| **Accuracy** | **91.37%** | > 85.0% | 🟢 **Exceeded** | Overall milestone prediction precision across 12 Indian states |
| **Recall** | **93.94%** | > 90.0% | 🟢 **Exceeded** | Catches 94 out of every 100 critical acquisition bottlenecks in advance |
| **Precision** | **93.40%** | > 88.0% | 🟢 **Verified** | Minimizes false alarms to prevent misallocating administrative task forces |
| **F1-Score** | **0.9367** | > 0.88 | 🟢 **Verified** | Balanced accuracy across minority class severe delays |
| **Brier Score** | **0.0612** | < 0.10 | 🟢 **Calibrated** | Probability outputs reflect true empirical risk frequency |

---

## 🖥️ Core Operational Dashboards

| View Name | Route | Core Functional Capabilities |
| :--- | :---: | :--- |
| **Command Center** | `/dashboard` | Statewide portfolio health check, ₹1.42 Lakh Cr capital outlay overview, Gujarat corridor hotspot map, and real-time risk distribution. |
| **ML Models & Backend** | `/ml-models` | Interactive Prediction Sandbox, live TreeSHAP waterfall charts, model performance scorecard, and syntax-highlighted Python codebase viewer. |
| **National Corridor GIS** | `/corridor-map` | Linear chainage progress tracking, Right-of-Way (RoW) width meters, cadastral parcel inspection, and stay order chokepoints. |
| **District Diagnostics** | `/district-diagnostics` | District-level SLA benchmarking, Section 4 to 23 turnaround clocks, and Tehsil ranking matrices. |
| **Early Warning Center** | `/early-warning` | 72-hour emergency task force triage queue, statutory violation alerts, and automated collector dispatch directives. |
| **Fund Tracking & DBT** | `/fund-tracking` | RFCTLARR Sec 77/80 escrow balance monitoring, Aadhaar-enabled DBT disbursement aging, and interest penalty calculations. |
| **Group Land & Co-Ownership**| `/group-land` | Joint ancestral land resolution, co-sharer genealogy trees, ownership share ratios, and Aadhaar e-Sign tracking. |
| **Projects 360** | `/project/:id` | 1:1 circular delay gauge, multi-horizon risk trajectory (Day 30/60/90), and Counterfactual What-If simulation sliders. |
| **State Benchmarking** | `/state-benchmarking` | Interstate performance matrix comparing acquisition velocity, litigation incidence, and DBT adoption across Indian states. |
| **Policy Briefing Packet** | `/policy-briefing` | Statutory compliance packets with 1-click official PDF export formatted for Ministerial reviews and Cabinet meetings. |
| **Tamper-Evident Audit Log** | `/audit-log` | CAG Protocol v4.2 immutable cryptographic ledger recording user actions, timestamps, and SHA-256 hash fingerprints. |

---

## 🚀 Installation & Local Development

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Package Manager**: npm, pnpm, or bun

### 2. Frontend Setup
```bash
# Clone the repository
git clone https://github.com/NIKHILPATEL00212/bhoomisetu.git
cd bhoomisetu

# Install Node dependencies
npm install

# Start Vite development server (Port 3000)
npm run dev
```

### 3. Backend & ML Subsystem Setup
```bash
# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r ml/requirements.txt

# Seed the relational database
python database/seed_data.py

# Launch the FastAPI REST service (Port 8000)
python -m backend.server
```
Once running, open **`http://localhost:8000/docs`** to access the interactive Swagger API documentation.

---

## 🌐 Production Deployment Architecture

### 1. Vercel Hosting (Active Production)
The application is pre-configured with `vercel.json` for zero-configuration deployment:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Routing:** SPA fallback to `/index.html` with optional `/api/*` serverless Python routing via `/api/index.py`.

### 2. Hugging Face Spaces (Interactive ML Demo)
A self-contained Gradio Space package is available in `/hf_space`:
- Direct integration via `.github/workflows/sync_to_hf.yml` automatically syncs the repository to Hugging Face on push.
- Public URL: `https://huggingface.co/spaces/NIKHILPATEL00212/bhoomisetu-ml-engine`

---

## 🛡️ Security, Governance & Audit Protocols

- **Role-Based Access Control (RBAC):** Geo-scoped permissions distinguishing District Magistrates, Project Directors, Competent Authorities (CALA), and State Secretaries.
- **CAG Protocol v4.2 Audit Trail:** Every award modification, risk override, and alert dismissal is cryptographically hashed with SHA-256 and stored with immutable timestamps.
- **Zero Raw Data Exposure:** Direct database queries are shielded behind Pydantic-validated API boundaries with CORS origin restrictions.

---

## 👥 Team: Quorum Intelligence

* **Smart India Hackathon 2026**
* **Problem Statement ID:** SIH26016
* **Domain:** Land Acquisition Early Warning System & Infrastructure Decision Intelligence
* **Lead Developer & Contact:** [rupalanikhil8@gmail.com](mailto:rupalanikhil8@gmail.com)

---

<p align="center">
  <b>BhoomiSetu — Transforming Land Acquisition from Reactive Friction into Predictive Foresight.</b>
</p>
