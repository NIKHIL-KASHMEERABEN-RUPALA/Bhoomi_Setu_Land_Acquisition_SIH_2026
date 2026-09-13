from fastapi import APIRouter
from app.api.v1.alerts import router as alerts_router
from app.api.v1.audit import router as audit_router
from app.api.v1.auth import router as auth_router
from app.api.v1.compensation import router as compensation_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.ingest import router as ingest_router
from app.api.v1.legal import router as legal_router
from app.api.v1.map import router as map_router
from app.api.v1.predictions import router as predictions_router
from app.api.v1.projects import router as projects_router
from app.api.v1.recommendations import router as recommendations_router
from app.api.v1.row import router as row_router
from app.api.v1.rr import router as rr_router
from app.api.v1.simulation import router as simulation_router
from app.api.v1.stakeholders import router as stakeholders_router

api_v1_router = APIRouter()

# Register domain sub-routers
api_v1_router.include_router(auth_router)
api_v1_router.include_router(ingest_router)
api_v1_router.include_router(projects_router)
api_v1_router.include_router(dashboard_router)
api_v1_router.include_router(predictions_router)
api_v1_router.include_router(simulation_router)
api_v1_router.include_router(recommendations_router)
api_v1_router.include_router(compensation_router)
api_v1_router.include_router(legal_router)
api_v1_router.include_router(rr_router)
api_v1_router.include_router(row_router)
api_v1_router.include_router(stakeholders_router)
api_v1_router.include_router(map_router)
api_v1_router.include_router(alerts_router)
api_v1_router.include_router(audit_router)
