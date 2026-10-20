# BhoomiSetu — AI-Powered Land Acquisition Intelligence Platform

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" />
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-Async-009688?logo=fastapi&logoColor=white" />
  <img alt="XGBoost" src="https://img.shields.io/badge/XGBoost-TreeSHAP-FF8C00?logo=xgboost&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white" />
</p>

BhoomiSetu is an AI-driven governance and decision-support platform designed to detect, monitor, and mitigate risks in land acquisition projects for large-scale infrastructure development. The solution focuses on the early warning and prediction of project delays, legal bottlenecks, compensation pressure, acquisition friction, and administrative execution risk.

Built as part of the Smart India Hackathon 2026 vision, BhoomiSetu helps public agencies, district authorities, state departments, and infrastructure stakeholders identify which projects are likely to slip beyond critical statutory thresholds and act before delays escalate.

---

## Why BhoomiSetu exists

Land acquisition and corridor execution are among the most sensitive and delay-prone components of national infrastructure development. Delays are often caused by a combination of:

- compensation backlog and disbursement friction
- court cases and legal disputes
- parcel ownership conflicts and unclear title records
- low administrative velocity and approval delay
- insufficient field execution and possession progress
- poor visibility across state and district teams

BhoomiSetu brings these signals together in one operational intelligence layer so that government teams can intervene early and make faster, evidence-based decisions.

---

## What the platform does

BhoomiSetu provides a full-stack decision intelligence system that includes:

- project risk forecasting across land acquisition lifecycles
- 90-day delay prediction for high-risk projects
- explainable AI outputs showing why a project is risky
- district/state benchmarking for comparison and prioritization
- compensation, litigation, and possession risk monitoring
- what-if simulation of intervention scenarios
- public-sector dashboarding for decision makers
- GIS-aware project monitoring and corridor insights

---

## Key capabilities

### 1. Early Warning System
BhoomiSetu continuously evaluates project health and predicts whether a project is likely to breach the critical 90-day delay threshold.

### 2. Explainable Intelligence
The system does not only output a risk score. It identifies the top drivers affecting the project, such as:

- compensation pending percentage
- court case volume
- possession gap
- administrative delay signals
- landowner resistance and stakeholder friction

### 3. What-If Simulation
Decision makers can simulate policy or administrative interventions to see their effect on project risk reduction before implementation.

### 4. Governance Dashboarding
The front-end exposes project health visuals, district comparisons, action recommendations, and a high-level operational snapshot for state and district authorities.

### 5. Multi-layered data intelligence
The platform combines:

- structured project records
- risk features derived from land acquisition domain logic
- GIS-aware spatial context
- administrative and legal signal patterns
- simulation and forecasting outputs

---

## Product vision

BhoomiSetu aspires to create a transparent and intelligent land acquisition governance layer for public infrastructure programs. It aims to reduce ambiguity, improve intervention timing, support faster statutory compliance, and improve trust between agencies and affected communities.

---

## Architecture overview

```text
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React + Vite)                 │
│  Dashboards, risk views, simulations, project monitoring   │
└───────────────────────────────┬─────────────────────────────┘
                                │ HTTP / API
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend / ML Service Layer                 │
│  FastAPI endpoints + XGBoost prediction + explainability    │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      Intelligence Engine                     │
│  Feature engineering, preprocessing, model inference,      │
│  SHAP explanations, scenario simulation                     │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data and Model Artifacts                 │
│  CSV datasets, preprocessing pipeline, trained models        │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech stack

### Frontend
- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- Radix UI
- Recharts
- Framer Motion
- Wouter for client-side routing

### Backend and ML
- FastAPI
- Python
- XGBoost
- SHAP
- scikit-learn
- Pandas / NumPy
- Joblib-based model serialization

### Data and deployment
- CSV-driven project datasets
- model artifact storage in `models/`
- Vercel-compatible deployment patterns
- static frontend build with Vite

---

## Repository structure

```text
Bhoomi_Setu_Land_Acquisition_SIH_2026/
├── api/                         # Backend API / FastAPI service layer
├── docs/                       # Documentation and reference notes
├── hf_space/                   # Hugging Face Gradio space metadata / deployment config
├── ml/                         # Core ML pipeline and model documentation
│   ├── README.md
│   ├── config.py
│   ├── feature_engineering.py
│   ├── preprocessing.py
│   ├── train.py
│   ├── predict.py
│   ├── what_if.py
│   ├── main_fastapi.py
│   └── requirements.txt
├── models/                     # Trained model artifacts and metadata
├── public/                     # Static app assets and frontend resources
├── src/                        # Frontend application source
│   ├── App.tsx
│   ├── main.tsx
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── styles/
│   ├── types/
│   └── assets/
├── .env.example                # Example environment configuration
├── .gitignore                  # Git ignore rules
├── components.json             # Component configuration
├── index.html                  # Root HTML entry
├── land_acquisition_master.csv # Main dataset
├── land_acquisition_master-1.csv
├── metadata.json               # Metadata for project artifacts
├── package.json                # Frontend dependencies and scripts
├── pyproject.toml              # Python project metadata
├── README.md                   # Repository overview
├── test_prediction.js          # Prediction smoke test helper
├── tsconfig.json               # TypeScript config
├── vercel.json                 # Vercel deployment config
├── vite.config.ts              # Vite config
├── bun.lock                    # Bun lock file
├── ppt_assets/                 # Presentation images and support assets
├── BhoomiSetu_Documentation.md # Documentation export
├── BhoomiSetu_Presentation.html # Presentation viewer export
├── BhoomiSetu_SIH2026_Presentation.pptx
├── BhoomiSetu_SIH_Official_Submission.pptx
├── SIH2026-IDEA-Presentation-Format.pptx
├── deploy_instructions.md
├── TROUBLESHOOTING_AND_ARCHITECTURE_GUIDE.md
├── Model_Description.pdf
├── Model_Features_List.pdf
├── BhoomiSetu_Unique_Features_and_Government_Value_Proposition.pdf
└── SIH_2026_Land_Acquisition_EWS_Model_Description.pdf
```

---

## Machine learning module

The model layer is one of the strongest parts of this project. It is designed around early warning theory and policy-aware prediction for land acquisition delays.

### Model approach
- XGBoost classifier
- histogram-based tree learning
- SHAP-based explainability
- preprocessing via scaling and encoding
- domain-aware feature engineering

### Risk signals used
The pipeline evaluates a diverse set of variables such as:

- compensation pending percentage
- possession status and deficit
- litigation count and court intensity
- administrative delay duration
- project scale and corridor coverage
- district/state execution pressure
- legal procedural lag and stakeholder resistance

### Output style
The model returns:

- project delay probability
- risk band classification
- day-30 / day-60 / day-90 trajectory
- top drivers behind the risk
- recommended administrative intervention steps

---

## ML + API workflow

The project includes a complete model lifecycle:

1. ingest land acquisition data
2. engineer feature vectors
3. preprocess numerical and categorical fields
4. train and validate the model
5. persist model artifacts
6. expose prediction endpoints through FastAPI
7. generate SHAP explanations for explainability
8. run counterfactual simulations for policy changes

---

## Frontend application overview

The app in `src/` is built as a modern intelligence dashboard for Gujarat/state infrastructure workflows and decision-making. It contains:

- operational intelligence views
- project corridor summaries
- state benchmarking panels
- compensation and fund tracking modules
- project 360 overview panels
- AI explanation and support modules
- error boundary and UI resilience support

The frontend architecture is designed to make decision-support information easy to read for agencies and district teams without overwhelming them with raw data.

---

## Core user experience

The dashboard is designed for decision-makers who need to answer questions like:

- Which projects are at high risk?
- Why are they likely to be delayed?
- Which intervention would reduce risk the fastest?
- Are state/district comparisons indicating a systemic issue?
- What part of the workflow is underperforming?

This is a practical governance intelligence experience rather than just a model demo.

---

## Local development setup

### Frontend setup

```bash
npm install
npm run dev
```

### Production frontend build

```bash
npm run build
npm run preview
```

### Type check

```bash
npm run typecheck
```

### ML environment

```bash
cd ml
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Train the model

```bash
python3 ml/train.py
```

### Run prediction

```bash
python3 ml/predict.py
```

### Run counterfactual simulation

```bash
python3 ml/what_if.py
```

### Start the API server

```bash
auvicorn ml.main_fastapi:app --host 0.0.0.0 --port 8000 --reload
```

---

## Security and governance considerations

This project is designed for government use, so security and governance are important. The repository includes patterns aligned to:

- authenticated access flows
- token-based security models
- access restrictions around sensitive project information
- structured API handling and request validation
- governance-focused deployment documentation

For real-world production deployment, additional hardening is recommended, including:

- role-based permission scoping per district/state/admin user
- secret management through secure vaults
- audit trails for sensitive access
- data encryption in transit and at rest
- request rate limiting and monitoring
- stricter logs for privileged operations

---

## Impact and value proposition

BhoomiSetu is designed to improve land acquisition governance by enabling faster, more informed administrative action. The expected value includes:

- lower risk of project delay
- faster decision cycles for district and state officers
- better compensation and execution monitoring
- improved legal and administrative preparedness
- stronger public transparency and accountability

---

## Project purpose summary

BhoomiSetu is more than a predictive model. It is a public-sector intelligence platform created to modernize how governments anticipate, track, and mitigate land acquisition delay risk. By combining explainable AI, governance dashboards, and operational monitoring, it makes complex land acquisition risks visible before they become crises.

---

## License and acknowledgment

This project is built for the Smart India Hackathon 2026 challenge and is intended to demonstrate how AI can improve government infrastructure governance, land acquisition transparency, and statutory execution planning.

---

## Related resources

- `ml/README.md` — machine learning subsystem and model documentation
- `hf_space/README.md` — deployment configuration and Gradio metadata
- `BhoomiSetu_Documentation.md` — extended project documentation
- `TROUBLESHOOTING_AND_ARCHITECTURE_GUIDE.md` — architecture and setup guidance
- `deploy_instructions.md` — deployment usage documentation

