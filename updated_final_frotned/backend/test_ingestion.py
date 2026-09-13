import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from httpx import AsyncClient, ASGITransport
from app.main import app


async def run_test():
    print("[-] Starting Ingestion Pipeline Automated Test...")

    sample_payload = {
        "timestamp": "2026-09-13T02:10:00Z",
        "source": "frontend-realtime-test",
        "districts": [
            {
                "id": "d-01",
                "name": "Kutch",
                "monitoredProjects": 14,
                "atRiskProjects": 7,
                "averageDelay": 6.4,
                "riskRate": 50.0,
                "compensationPending": 22.8,
                "legalCases": 31,
                "trend": [31, 34, 38, 43, 48, 50],
                "mapPosition": {"x": 19.0, "y": 39.0}
            },
            {
                "id": "d-02",
                "name": "Bharuch",
                "monitoredProjects": 12,
                "atRiskProjects": 5,
                "averageDelay": 4.6,
                "riskRate": 41.7,
                "compensationPending": 16.2,
                "legalCases": 24,
                "trend": [27, 30, 33, 35, 39, 42],
                "mapPosition": {"x": 47.0, "y": 69.0}
            },
            {
                "id": "d-04",
                "name": "Ahmedabad",
                "monitoredProjects": 18,
                "atRiskProjects": 4,
                "averageDelay": 3.2,
                "riskRate": 22.2,
                "compensationPending": 14.5,
                "legalCases": 12,
                "trend": [25, 24, 23, 23, 22, 22],
                "mapPosition": {"x": 44.0, "y": 52.0}
            }
        ],
        "projects": [
            {
                "id": "p-001",
                "name": "Dholera–Ahmedabad Connector",
                "projectCode": "DAC/GJ/14",
                "district": "Ahmedabad",
                "phase": "Possession & handover",
                "riskLevel": "Low",
                "riskScore": 24.0,
                "delayProbability": 18.0,
                "predictedDelayWindow": "On track",
                "confidence": 89.0,
                "budget": 890.0,
                "affectedFamilies": 430,
                "contributors": [{"label": "Residual cases", "value": 34.0}],
                "lifecycleStages": []
            },
            {
                "id": "p-004",
                "name": "Western Dedicated Freight Corridor · Package 8",
                "projectCode": "WDFC/GJ/08",
                "district": "Bharuch",
                "phase": "Award & compensation",
                "riskLevel": "Critical",
                "riskScore": 84.0,
                "delayProbability": 79.0,
                "predictedDelayWindow": "8–12 months",
                "confidence": 92.0,
                "budget": 488.0,
                "affectedFamilies": 1180,
                "contributors": [{"label": "Title disputes", "value": 38.0}],
                "lifecycleStages": []
            }
        ],
        "alerts": [
            {
                "id": "alt-001",
                "projectId": "p-004",
                "projectName": "Western Dedicated Freight Corridor · Package 8",
                "district": "Bharuch",
                "category": "Legal",
                "severity": "Critical",
                "predictedDelay": "8–12 months",
                "confidence": 92.0,
                "primaryCause": "High Court writ challenging land valuation in 3 talukas",
                "recommendedIntervention": "Approve revised valuation table & file expedited counter-affidavit",
                "status": "Open"
            }
        ],
        "interventions": [
            {
                "id": "int-001",
                "projectId": "p-004",
                "title": "Expedite High Court valuation affidavit",
                "owner": "Legal Cell – Bharuch Collectorate",
                "status": "Open",
                "due": "18 Jun 2025"
            }
        ]
    }

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/v1/ingest", json=sample_payload)
        print(f"[+] HTTP Status: {res.status_code}")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()
        print(f"[+] Ingestion Response: {json.dumps(data, indent=2)}")

        # Verify physical files
        for fpath in data["generated_dataset_files"]:
            assert os.path.exists(fpath), f"File {fpath} does not exist!"
            fsize = os.path.getsize(fpath)
            print(f"[+] Generated Dataset File Verified: {fpath} ({fsize} bytes)")

    print("[SUCCESS] All Ingestion Pipeline Tests Passed Successfully!")


if __name__ == "__main__":
    asyncio.run(run_test())
