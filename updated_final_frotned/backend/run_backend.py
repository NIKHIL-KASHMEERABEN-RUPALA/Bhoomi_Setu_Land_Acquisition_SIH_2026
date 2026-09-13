"""
BhoomiSetu Enterprise Backend Server Launcher
Runs FastAPI with Uvicorn, Supabase PostgreSQL, ML Model connection, and CORS.
"""

import sys
import os
import uvicorn

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from app.core.config import settings

import socket

def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0

def main():
    desired_port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")

    port = desired_port
    if is_port_in_use(port):
        print(f"[!] Warning: Port {port} is already active.")
        # If port 8000 is occupied, find next open port (e.g., 8001)
        port += 1
        while is_port_in_use(port):
            port += 1
        print(f"[*] Automatically binding to available port: {port}")

    print("\n" + "=" * 70)
    print("      BHOOMISETU — ENTERPRISE BACKEND REST API SERVER")
    print("      National Land Acquisition Early Warning & Decision Support")
    print("=" * 70)
    print(f"[*] API Documentation: http://localhost:{port}/api/docs")
    print(f"[*] OpenAPI Schema   : http://localhost:{port}/api/openapi.json")
    print(f"[*] Database Mode    : {'Supabase PostgreSQL' if settings.DATABASE_URL else 'Embedded SQLite'}")
    print("=" * 70 + "\n")

    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=False,
        log_level="info",
    )

if __name__ == "__main__":
    main()
