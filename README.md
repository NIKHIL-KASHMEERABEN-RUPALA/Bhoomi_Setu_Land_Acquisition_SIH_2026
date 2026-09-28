# 🌍 BhoomiSetu — AI-Powered Land Acquisition Intelligence Platform

> Predictive Foresight. Statutory Precision. Governance at Scale.  
> Smart India Hackathon 2026 | Early Warning System for Infrastructure Delays

BhoomiSetu is an advanced, AI-powered land acquisition early-warning and decision intelligence platform built specifically for government agencies, district authorities, and infrastructure stakeholders. Its core mission is to predict, monitor, and mitigate land acquisition bottlenecks before they cascade into critical delays, massive cost overruns, legal disputes, and public friction.

## 🎯 What BhoomiSetu Does

BhoomiSetu transforms land acquisition governance from a reactive process into a proactive, data-driven system. The platform continuously evaluates multi-dimensional project data to identify which infrastructure initiatives are most likely to face acquisition delays and where intervention is needed the most.

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
- Security: Role-based access, geo-scoping, authentication, and enterprise-safe design

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

The project envisions a future where land acquisition governance is not ruled by ambiguity and delay, but guided by intelligence, accountability, and evidence-based action. BhoomiSetu aims to become a strategic decision-support platform for modern infrastructure governance in India.

---

## 🌍 Executive Summary

BhoomiSetu is an AI-powered land acquisition early warning and decision intelligence platform designed for government agencies, district authorities, and infrastructure stakeholders to predict, monitor, and mitigate project delays in land acquisition processes. Built around an explainable XGBoost-based risk model, the platform analyzes project health using financial, legal, geographical, administrative, and social indicators to flag projects likely to exceed 90-day acquisition delays.

It integrates GIS corridor mapping, statutory milestone tracking, compensation and fund monitoring, stakeholder risk insights, and project-level dashboards to help officials take proactive action before delays escalate into cost overruns, legal disputes, and public disruption. The project combines modern React + TypeScript frontend, FastAPI backend, structured data models, and ML-driven intelligence to support smarter, data-backed governance and faster decision-making in infrastructure planning.

---

# BhoomiSetu — Frontend Application

Predictive Land Acquisition Delay Intelligence Platform for Gujarat state and district authorities.

## Architecture

- `src/`
  - `components/` — Operational intelligence dashboard views (Corridor GIS, State Benchmarking, Fund Tracking, Project 360, Intelligence Modules) and Error Boundary
  - `components/ui/` — 55+ accessible shadcn/ui & Radix UI primitives
  - `lib/` — Mock dataset (`mockData.ts`) and styling utilities (`utils.ts`)
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
