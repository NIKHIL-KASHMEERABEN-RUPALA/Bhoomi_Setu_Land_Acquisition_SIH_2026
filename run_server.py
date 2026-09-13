"""
BhoomiSetu - Land Acquisition Early Warning System API Launcher
Runs local FastAPI server on http://localhost:8000
"""

import sys
import subprocess
from pathlib import Path
import uvicorn
import key_manager

def main():
    print("\n" + "=" * 70)
    print("      BHOOMISETU - LAND ACQUISITION EARLY WARNING SYSTEM")
    print("               ML MODEL HOSTING & API SERVER")
    print("=" * 70)

    # 1. Check model artifacts
    model_file = Path("models/bhoomi_xgb_pipeline.joblib")
    if not model_file.exists():
        print("[!] Model file not detected. Triggering automated training...")
        subprocess.run([sys.executable, "train_and_export.py"], check=True)
    else:
        print("[+] Model artifacts verified (models/bhoomi_xgb_pipeline.joblib).")

    import io
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    # 2. Ensure API Key exists
    api_key = key_manager.get_or_create_default_key()
    print("\n" + "-" * 70)
    print(f"[*] ACTIVE MASTER API KEY : {api_key}")
    print("-" * 70)
    print("Pass this key in HTTP requests:")
    print("  Header: 'X-API-Key: <key>' or 'Authorization: Bearer <key>'")
    print("  Query : '?api_key=<key>'")
    print("-" * 70)
    print("[+] WEB PLAYGROUND & PORTAL : http://localhost:8000")
    print("[+] INTERACTIVE SWAGGER DOCS: http://localhost:8000/docs")
    print("[+] HEALTH CHECK ENDPOINT   : http://localhost:8000/api/v1/health")
    print("=" * 70 + "\n")

    # 3. Start server
    uvicorn.run("app:app", host="0.0.0.0", port=8000, log_level="info")

if __name__ == "__main__":
    main()
