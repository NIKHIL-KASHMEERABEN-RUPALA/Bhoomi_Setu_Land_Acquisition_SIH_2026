# BhoomiSetu Intelligence Platform - Backend API

> **AI-Powered Land Acquisition Early Warning & Decision Intelligence Platform**  
> *Gujarat State Corridor & Infrastructure Monitoring Use Case*

---

## 🏛️ Executive Summary

The **BhoomiSetu Backend** is a high-performance, production-grade modular monolith built using **Python 3.13** and **FastAPI**. It delivers decision intelligence and early warning signals for mega-infrastructure land acquisitions across Gujarat (e.g., Bullet Train, Western DFC, Expressways, and Metro projects).

The platform serves **ML inference only** from exported Kaggle models, strictly enforcing non-causal statistical interpretations, fine-grained Role-Based Access Control (RBAC), and geographic data boundaries to protect against Broken Object-Level Authorization (BOLA/IDOR).

---

## 🏗️ Architecture & Technology Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) with asynchronous ASGI lifespan architecture.
- **Python Runtime**: Python 3.13.
- **ORM & Data Layer**: [SQLAlchemy 2.0 (Async)](https://docs.sqlalchemy.org/) + `asyncpg` + [GeoAlchemy2](https://geoalchemy-2.readthedocs.io/).
- **Dual-Engine Resilient Database Architecture**:
  - **Primary**: PostgreSQL 16 + PostGIS 3.4 (for production geospatial corridor calculations).
  - **Zero-Config Fallback**: Embedded `aiosqlite` SQLite database automatically engaged when external PostgreSQL is not detected, enabling instant zero-dependency execution.
- **Security & Cryptography**:
  - [Argon2id](https://pypi.org/project/argon2-cffi/) (time cost 3, 64 MB memory cost, 4 threads) password hashing.
  - JWT Access Tokens (15 min) with SHA-256 hashed Refresh Token rotation (7 days).
  - Brute-force lockout protection (5 consecutive failed attempts locks account for 15 minutes).
  - Geographic Scoping: District Officers can only view/mutate data within their assigned district.
- **ML Inference Engine**:
  - Thread-safe Singleton `ModelProvider` executing serialized `.joblib` pipelines.
  - 18-feature vectorized schema validation (`feature_schema.json`).
  - Non-causal factor attribution (SHAP-style deviation weights).
  - Zero-side-effect **What-If Counterfactual Simulation** engine.
- **Rule-Based Decision Intelligence**:
  - Transparent administrative recommendation generator for District Collectors and SLAOs.
- **Caching & Tasks**:
  - Redis 7 cache with graceful fallback to in-memory pass-through when Redis is offline.
- **Observability**:
  - Structured JSON logging with unique Request ID correlation, client IP, and latency in milliseconds.
  - RFC 7807 compliant error envelopes (`error.code`, `error.message`, `error.request_id`).
  - SlowAPI Rate Limiting (120 req/min general, 10 req/min on authentication).

---

## 📁 Repository Structure

```
backend/
├── app/
│   ├── api/v1/                     # REST API Endpoints
│   │   ├── alerts.py               # Early warning signals & acknowledgment
│   │   ├── audit.py                # Statutory audit trail logs
│   │   ├── auth.py                 # Login, refresh, logout, profile
│   │   ├── compensation.py         # Financial aging, pendency, tranches
│   │   ├── dashboard.py            # Executive KPIs, portfolio distributions
│   │   ├── legal.py                # High Court/District litigation cases
│   │   ├── map.py                  # GeoJSON alignments & district polygons
│   │   ├── predictions.py          # ML predict, risk history, explainability
│   │   ├── projects.py             # Project 360 dossiers, milestones, stages
│   │   ├── recommendations.py      # Rule-based decision actions
│   │   ├── router.py               # Aggregated v1 API router
│   │   ├── row.py                  # Right-of-Way handover telemetry
│   │   ├── rr.py                   # Rehabilitation & Resettlement tracking
│   │   ├── simulation.py           # What-If counterfactual scenario engine
│   │   └── stakeholders.py         # Public grievances & stakeholder feedback
│   ├── core/
│   │   ├── config.py               # Pydantic Settings with env validation
│   │   ├── dependencies.py         # Auth, RBAC, and Geographic scoping guards
│   │   ├── exceptions.py           # Domain exceptions & RFC 7807 handler
│   │   ├── logging.py              # Structured JSON logger
│   │   └── security.py             # Argon2id hasher & JWT token manager
│   ├── db/
│   │   ├── base.py                 # DeclarativeBase, UUIDPrimaryKey, Timestamp
│   │   └── session.py              # Async engine & reachability auto-fallback
│   ├── inference/
│   │   ├── feature_adapter.py      # Feature vectorizer & bound checks
│   │   ├── model_provider.py       # Thread-safe model loader singleton
│   │   └── predictor.py            # Inference execution & factor attribution
│   ├── models/                     # Normalized SQLAlchemy Entities
│   │   ├── audit.py                # AuditLog
│   │   ├── compensation.py         # CompensationRecord, CompensationDispute
│   │   ├── decisions.py            # Alert, Recommendation, Intervention
│   │   ├── geography.py            # State, District, Taluka, Village, LandParcel
│   │   ├── legal.py                # LegalCase (judicial stays & hearings)
│   │   ├── predictions.py          # ModelVersion, Prediction, PredictionFactor
│   │   ├── projects.py             # Project, ProjectCorridor, Milestone
│   │   ├── social.py               # RehabilitationResettlement, Grievance
│   │   └── users.py                # User, RefreshToken
│   ├── recommendations/
│   │   └── engine.py               # Rule-based administrative action engine
│   ├── repositories/
│   │   └── project_repo.py         # Multi-criteria filtering repository
│   ├── schemas/                    # Pydantic DTOs & Request/Response models
│   │   ├── auth.py                 # Login, TokenResponse, UserSummary
│   │   └── projects.py             # ProjectSummary, ProjectDetail, Stages
│   ├── services/
│   │   ├── auth_service.py         # Auth workflows, lockout, token rotation
│   │   ├── prediction_service.py   # Model inference & history orchestration
│   │   └── project_service.py      # Project 360 domain logic
│   ├── tasks/
│   │   └── redis_client.py         # Resilient Redis cache client
│   ├── tests/                      # Pytest Test Suite (18 tests)
│   │   ├── conftest.py             # Async client & token fixtures
│   │   ├── test_auth.py            # Login, refresh, health checks
│   │   ├── test_inference.py       # Model loading, predict, explanation
│   │   ├── test_projects_api.py    # Projects list, detail, timeline, dashboard
│   │   ├── test_security_authorization.py # RBAC, BOLA/IDOR, lockout
│   │   └── test_simulation.py      # What-If counterfactual simulation
│   └── main.py                     # FastAPI application entrypoint & lifespan
├── migrations/                     # Alembic Async Migrations
│   ├── env.py                      # Dynamic database migration engine
│   └── versions/                   # Migration revision scripts
├── model/                          # Exported Kaggle Model Artifacts
│   ├── feature_schema.json         # 18-feature specification with min/max bounds
│   ├── model_metadata.json         # Version, accuracy metrics, target definitions
│   └── model.joblib                # Serialized scikit-learn / XGBoost pipeline
├── scripts/
│   ├── generate_reference_model.py # Reference pipeline generator
│   └── seed_demo_data.py           # Gujarat infrastructure synthetic dataset
├── alembic.ini                     # Alembic configuration
├── docker-compose.yml              # Multi-container stack (PostGIS + Redis + API)
├── Dockerfile                      # Production multi-stage Docker build
├── pytest.ini                      # Test runner configuration
└── requirements.txt                # Pinned production dependencies
```

---

## 👥 Seeded Administrative Accounts

The database is pre-seeded with Gujarat administrative officers across different jurisdictions and roles. Password for all seeded accounts is: **`Admin@Bhoomi2025!`** (or specific district passwords below):

| Email | Role | Administrative Jurisdiction | Password |
|---|---|---|---|
| `admin@bhoomi.gov.in` | `central_admin` | All India / State-wide | `Admin@Bhoomi2025!` |
| `state.gujarat@bhoomi.gov.in` | `state_admin` | Gujarat State | `Gujarat@Admin2025!` |
| `collector.ahmedabad@bhoomi.gov.in` | `district_officer` | Ahmedabad District (`d-04`) | `Ahmedabad@Collector2025!` |
| `collector.kutch@bhoomi.gov.in` | `district_officer` | Kutch District (`d-01`) | `Kutch@Collector2025!` |
| `collector.anand@bhoomi.gov.in` | `district_officer` | Anand District (`d-07`) | `Anand@Collector2025!` |
| `analyst@bhoomi.gov.in` | `analyst` | Read-only analytics | `Analyst@Bhoomi2025!` |
| `viewer@bhoomi.gov.in` | `viewer` | Public information desk | `Viewer@Bhoomi2025!` |

---

## 🚀 Quickstart: Running Locally

### Prerequisites
- Python 3.13 installed.
- Optional: `uv` package manager (recommended for speed) or standard `python -m venv`.

### 1. Setup Virtual Environment & Install Dependencies
Using `uv`:
```bash
cd backend
uv venv .venv
uv pip install -r requirements.txt
```
Using standard pip:
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # On Windows
pip install -r requirements.txt
```

### 2. Seed Database
Execute the synthetic data seeder (automatically uses SQLite if PostgreSQL is not running):
```bash
# Using uv:
uv run python scripts/seed_demo_data.py

# Using active virtualenv:
python scripts/seed_demo_data.py
```

### 3. Run Automated Pytest Suite
```bash
# Using uv:
uv run pytest app/tests/ -v

# Using active virtualenv:
pytest app/tests/ -v
```

### 4. Start Development Server
```bash
# Using uv:
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Using active virtualenv:
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive Swagger Documentation: **`http://127.0.0.1:8000/docs`**  
ReDoc Documentation: **`http://127.0.0.1:8000/redoc`**

---

## 🐳 Docker Deployment

To launch the complete production stack with PostgreSQL + PostGIS 3.4, Redis 7, and FastAPI:

```bash
cd backend
docker compose up --build -d
```

Check service health:
```bash
docker compose ps
curl http://localhost:8000/health/ready
```

To run Alembic migrations inside the container:
```bash
docker compose exec backend alembic upgrade head
```

---

## 🔄 Replacing the ML Model Artifact (From Kaggle)

The backend is strictly decoupled from model training. When you train a new model iteration in Kaggle:

1. Export your calibrated model as **`model.joblib`**.
2. Export your feature metadata as **`model_metadata.json`** with version string (e.g. `2.0.0`).
3. If new features are used, update **`feature_schema.json`**.
4. Drop these 3 files into the `backend/model/` directory:
   - `backend/model/model.joblib`
   - `backend/model/feature_schema.json`
   - `backend/model/model_metadata.json`
5. Restart the server or trigger the health probe. The singleton `ModelProvider` will automatically validate the schema and reload the pipeline with zero downtime.

---

## 📡 API Endpoint Testing (cURL Examples)

### 1. Health Probe
```bash
curl -X GET http://127.0.0.1:8000/health/ready
```

### 2. Authenticate & Obtain JWT Token
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@bhoomi.gov.in", "password": "Admin@Bhoomi2025!"}'
```

### 3. Executive Dashboard Overview
```bash
curl -X GET http://127.0.0.1:8000/api/v1/dashboard/overview \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

### 4. Execute ML Inference on a Project
```bash
curl -X POST http://127.0.0.1:8000/api/v1/projects/p-002/predict \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

### 5. Run What-If Counterfactual Simulation
```bash
curl -X POST http://127.0.0.1:8000/api/v1/projects/p-002/simulate \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "changes": {
      "compensation_pending_pct": 5.0,
      "row_available_pct": 95.0,
      "interim_stays_active": 0.0
    }
  }'
```

### 6. Retrieve Rule-Based Administrative Recommendations
```bash
curl -X GET http://127.0.0.1:8000/api/v1/projects/p-002/recommendations \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

---

## 🔒 Security & Compliance Safeguards

1. **Argon2id Password Storage**: Compliant with OWASP cryptographic storage standards.
2. **Broken Object-Level Authorization (BOLA/IDOR) Prevention**: Every project query verifies the user's geographic assignment (`verify_geographic_scope`). A District Officer assigned to Ahmedabad (`d-04`) cannot query or modify projects in Kutch (`d-01`) or Surat (`d-03`).
3. **Statutory Non-Causal Disclaimers**: All factor attribution responses explicitly include non-causal government disclaimers preventing misinterpretation of machine learning correlation as legal causality.
4. **Zero Persistent Mutation on Simulation**: Counterfactual What-If analyses run strictly in memory without altering the persistent database state.
5. **Auditing**: Sensitive project updates and state changes are written to an append-only `AuditLog` table with user identity, client IP, and before/after diffs.
