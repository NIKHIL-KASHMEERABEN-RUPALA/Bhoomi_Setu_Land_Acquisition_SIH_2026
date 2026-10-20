# ⚙️ BhoomiSetu — Backend Microservice & REST API

**Smart India Hackathon 2026 | Problem Statement ID: SIH26016**

The BhoomiSetu backend is built on **FastAPI**, providing asynchronous, high-throughput REST APIs for machine learning inference, TreeSHAP feature attributions, and administrative counterfactual simulations.

---

## 🛠️ Backend Architecture

```
Client Requests (Web / Mobile / Vercel Edge)
                   │
                   ▼
       FastAPI Application Router
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
/api/v1/predict  /api/v1/simulate  /api/v1/health
    │              │              │
    ▼              ▼              ▼
XGBoost Engine   What-If Engine  Telemetry Probe
(500-Tree hist) (Intervention Δ) (Ready / Degraded)
    │
    ▼
TreeSHAP Explainer (shap.TreeExplainer)
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | **`/docs`** | Interactive OpenAPI / Swagger documentation UI. |
| `GET` | **`/api/v1/health`** | Readiness and health probe for Kubernetes / cloud hosts. |
| `GET` | **`/api/v1/model-metadata`** | Model validation scores (ROC-AUC 0.9738), hyperparameters, and feature schemas. |
| `POST` | **`/api/v1/predict`** | Real-time XGBoost inference returning 90-day delay probability, risk band, and TreeSHAP waterfall. |
| `POST` | **`/api/v1/simulate`** | Counterfactual what-if simulation comparing baseline vs. policy intervention. |

---

## 🚀 Running the Backend

### Local Development:
```bash
python -m backend.server
# or
uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload
```

### Vercel Serverless Integration:
When deployed to Vercel, `api/index.py` automatically bridges serverless HTTP invocations into the FastAPI application.
