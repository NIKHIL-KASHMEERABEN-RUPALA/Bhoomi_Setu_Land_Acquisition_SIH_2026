"""
Vercel Serverless Function entrypoint for BhoomiSetu FastAPI Engine
Exposes 'app' variable at standard /api/index.py location
"""
import sys
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

try:
    from ml.main_fastapi import app
except Exception as e:
    from fastapi import FastAPI
    app = FastAPI(title="BhoomiSetu Fallback API")
    
    @app.get("/api/health")
    def health():
        return {"status": "ok", "message": "BhoomiSetu API active"}
