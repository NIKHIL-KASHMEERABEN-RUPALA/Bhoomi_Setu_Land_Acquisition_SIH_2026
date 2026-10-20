"""
🏛️ BhoomiSetu — Backend Server Entrypoint
Imports and launches the production FastAPI application microservice.
"""

import sys
from pathlib import Path
import uvicorn

# Ensure repository root is on sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from ml.main_fastapi import app

if __name__ == "__main__":
    print("[*] Starting BhoomiSetu Backend Server on http://0.0.0.0:8000")
    print("[*] Swagger API Documentation available at http://localhost:8000/docs")
    uvicorn.run("backend.server:app", host="0.0.0.0", port=8000, reload=True)
