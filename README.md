# 🌍 BhoomiSetu — AI-Powered Land Acquisition Intelligence Platform

> Predictive Foresight. Statutory Precision. Governance at Scale.  
> Smart India Hackathon 2026 | Early Warning System for Infrastructure Delays

BhoomiSetu is an advanced, AI-powered land acquisition early-warning and decision intelligence platform built specifically for government agencies, district authorities, and infrastructure stakeholders. It transforms land acquisition governance from a reactive process into a proactive, data-driven system by combining predictive analytics, GIS insights, statutory monitoring, and transparent dashboards.

## 🎯 What BhoomiSetu Does

BhoomiSetu continuously evaluates multi-dimensional project data to identify which projects are likely to slip beyond the 90-day threshold and require immediate intervention. It helps authorities act before delays become politically, legally, and financially damaging.

At the heart of the platform is an explainable XGBoost-based risk model. This intelligence engine continuously ingests and evaluates multi-dimensional data vectors across five key domains:

- Financial: Fund disbursement tracking, compensation health, and expenditure pressure
- Legal: Title disputes, litigation indicators, and procedural risk factors
- Geographical: Spatial topology, corridor alignment, and parcel-level exposure
- Administrative: Bureaucratic velocity, approval delays, and statutory clearance tracking
- Social: Stakeholder friction, community sentiment, and landowner resistance indicators

By synthesizing these metrics, BhoomiSetu accurately flags projects that are tracking toward critical 90+ day acquisition delays, empowering officials to intervene proactively before problems escalate.

## ⚡ Key Capabilities

- GIS Corridor Mapping: Real-time spatial visualization and oversight of land parcels along infrastructure corridors
- Statutory Milestone Tracking: Automated surveillance of bureaucratic checkpoints to ensure timelines remain on track
- Compensation & Fund Monitoring: Granular visibility into payment distribution, compensation flow, and financial backlog
- Executive Dashboards: Unified, project-level command centers that enable fast, transparent governance
- Early Warning Alerts: Risk scoring and explainable AI insights that surface intervention opportunities before delays become severe
- What-If Simulation: Scenario testing to evaluate impact of policy, funding, or administrative interventions
- Project 360 Overview: End-to-end status of acquisition, litigation, possession, compensation, and grievance pressure

## 🧠 How It Works

BhoomiSetu uses an explainable machine learning pipeline to detect warning signals across project lifecycle data. It combines structured project records with GIS intelligence and policy context to generate:

- Risk probability scores for projected land acquisition delay
- Explainable feature attribution to identify why a project is risky
- District/state benchmarking to compare project health across regions
- Actionable intervention recommendations for faster decision-making

This makes the system not just predictive, but interpretable and operationally useful for government stakeholders who need to act quickly and confidently.

## 🏗️ Architecture Overview

BhoomiSetu is built as a full-stack digital governance platform with an intelligent analytics core:

- Frontend: React + TypeScript for a modern, responsive, and accessible user experience
- Backend: FastAPI for a high-performance asynchronous API layer
- Machine Learning: XGBoost-based predictive engine with SHAP explainability
- Data Layer: Structured records, GIS-aware spatial data, and governance analytics
- Security: Role-based access, token-based authentication, geo-scoping, and secure API design

## 🧩 Backend Modules and Components

The backend of BhoomiSetu is designed to expose a clean, modular AI-powered service layer for the frontend and government workflows.

### Core Backend Stack

- FastAPI: main application framework for REST APIs and Swagger docs
- SQLAlchemy: database modeling and ORM support
- PostgreSQL / SQLite: production and local data storage support
- Redis: caching and fast state access
- Alembic: migrations for database management
- JWT and token-based auth patterns: secure user session handling
- Vercel serverless wrapper: `api/index.py` to expose the app in deployment environments

### Main Backend Functional Modules

- `api/index.py`: deployment entrypoint for the backend service
- `ml/main_fastapi.py`: FastAPI service exposing the trained predictive engine
- `ml/config.py`: configuration, feature schema, and model constants
- `ml/feature_engineering.py`: engineered risk features for B.L.A.S.T. analysis
- `ml/preprocessing.py`: preprocessing pipeline for categorical and numerical variables
- `ml/train.py`: model training pipeline and artifact generation
- `ml/predict.py`: inference engine for danger scoring and SHAP-based explanations
- `ml/what_if.py`: counterfactual simulation for intervention scenarios

### API Capability Areas

The application backend exposes multiple service domains, including:

- Authentication and access control
- Dashboard overview and analytics endpoints
- Project lifecycle monitoring
- Delay prediction and model inference
- Scenario simulation and what-if planning
- Parcel / corridor / GIS mapping APIs
- Group-land parcel and co-ownership APIs
- Recommendation generation for administrative action

These modules support the operational workflow of district authorities, state agencies, and infrastructure monitoring teams.

## 🧠 ML Algorithms, Intelligence Modules, and Model Workflow

BhoomiSetu uses a production-grade machine learning pipeline built for government decision support.

### Model and Algorithm Stack

- XGBoost Classifier (`XGBClassifier` with histogram tree method)
- Decision-tree ensemble model with 500 trees and tuned depth
- SHAP Explainability (`TreeExplainer`) for local feature attribution
- RobustScaler + OneHotEncoder preprocessing pipeline
- B.L.A.S.T. engineered features for domain-aware prediction
- Counterfactual simulation for policy impact modeling

### AI Modules Included

- `ml/train.py`: trains and validates the predictive model
- `ml/predict.py`: predicts risk probability using the trained model
- `ml/what_if.py`: calculates impact of changes in compensation, litigation, possession, and delays
- `ml/feature_engineering.py`: creates financial, legal, acquisition, social, and temporal variables
- `ml/config.py`: stores risk thresholds, feature metadata, and scoring logic

### What the ML Module Detects

The model predicts:

- 90-day critical delay probability
- Risk category: Low / Moderate / High / Critical
- Projection over Day 30 / Day 60 / Day 90
- Primary feature drivers behind a risk signal
- Recommended actions to reduce delay exposure

### Model Design Highlights

- Calibrated early warning risk scoring for land acquisition projects
- Interpretable decision support instead of a black-box prediction
- Feature breakdown aligned to RFCTLARR and project execution realities
- Useful for both strategic decisions and operational monitoring

## 🛡️ Security Features and Governance Controls

BhoomiSetu includes a security-first design intended for government-grade deployment and sensitive land acquisition workflows.

### Included Security Capabilities

- JWT-based session handling for authenticated access
- Role-based access patterns for different operational user types
- Access control around sensitive project and district-level data
- Token-based API authorization in the frontend client layer
- Secure deployment setup via environment variables and `.env.example`
- CORS handling in the API layer to restrict browser access patterns
- API validation and structured request models for safer backend integration
- Sensitive operational data separated behind service boundaries rather than exposing raw data directly
- Security documentation file: `docs/SECURITY.md`

### Security Focus Areas

The platform is designed to address key concerns in public governance systems:

- Confidential project data exposure
- Unauthorized district or state access
- Manipulation of risk or compensation data
- Unvalidated external API usage
- Operational misuse of land acquisition intelligence

### Production Security Recommendations

For real-world government deployment, the project should further harden with:

- Strong secret management via cloud vaults or environment secret stores
- Fine-grained RBAC and permission scopes for district/state/admin roles
- Audit trails for all data access and administrative actions
- Data encryption at rest and in transit
- Rate limiting and request throttling
- Strict input validation and anomaly detection
- Session expiry and refresh token rotation
- Logging and monitoring for privileged access and changes

## 🧬 Technology Stack

### Frontend

- React 19
- TypeScript 5.x
- Vite 7
- TailwindCSS 4
- Radix UI
- Recharts
- Framer Motion

### Backend

- FastAPI
- SQLAlchemy
- PostgreSQL / SQLite
- Redis
- Alembic
- Argon2id + JWT

### Intelligence & Analytics

- XGBoost
- SHAP
- scikit-learn
- Pandas / NumPy
- GIS-enabled spatial analysis

## 📊 Smart Impact

BhoomiSetu is designed to reduce uncertainty in infrastructure delivery by enabling government departments to:

- Detect risk before it becomes a crisis
- Reduce land acquisition delays and administrative bottlenecks
- Improve transparency in compensation and project monitoring
- Strengthen inter-department coordination
- Accelerate project completion through data-backed decisions

## 🚀 Project Vision

The project envisions a future where land acquisition governance is not ruled by ambiguity and delay, but guided by intelligence, accountability, and evidence-based action. BhoomiSetu aims to become a digital governance platform that helps authorities resolve land acquisition bottlenecks before they trigger social, financial, and legal escalation.

---

## 🌍 Executive Summary

BhoomiSetu is an AI-powered land acquisition early warning and decision intelligence platform designed for government agencies, district authorities, and infrastructure stakeholders to predict, monitor, and mitigate project delays. It integrates GIS corridor mapping, statutory milestone tracking, compensation and fund monitoring, stakeholder risk insights, and project-level dashboards to help officials take proactive action before land acquisition issues escalate.

---

# BhoomiSetu — Frontend Application

Predictive Land Acquisition Delay Intelligence Platform for Gujarat state and district authorities.

## Architecture

- `src/`
  - `components/` — Operational intelligence dashboard views (Corridor GIS, State Benchmarking, Fund Tracking, Project 360, Intelligence Modules) and Error Boundary
  - `components/ui/` — 55+ accessible shadcn/ui & Radix UI primitives
  - `lib/` — Mock dataset (`mockData.ts`), API integration (`api.ts`), and inference logic (`ml-engine.ts`)
  - `hooks/` — Custom hooks (`use-mobile.tsx`, `use-toast.ts`)
  - `styles/` — Global styling and Tailwind CSS v4 setup (`index.css`)
  - `pages/` — Route fallback pages (`not-found.tsx`)
  - `App.tsx` — Root application shell, navigation chrome, state management, and tab views
  - `main.tsx` — DOM root entrypoint
- `public/` — Static assets, icons, and benchmarking reference imagery

## Development

```bash
# Install dependencies
bun install

# Start the frontend dev server
bun run dev

# Build the frontend for production
bun run build

# Preview the production build locally
bun run preview

# Type-check the frontend app
bun run typecheck

# Lint the frontend app
bun run lint
```

```bash
# Enter the ML workspace
cd ml

# Create a Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Train the XGBoost model
python3 train.py

# Run prediction inference
python3 predict.py

# Run counterfactual simulations
python3 what_if.py

# Start the FastAPI service
uvicorn main_fastapi:app --host 0.0.0.0 --port 8000 --reload
```
