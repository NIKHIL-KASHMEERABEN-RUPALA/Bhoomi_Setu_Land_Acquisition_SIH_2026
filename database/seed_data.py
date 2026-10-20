"""
🏛️ BhoomiSetu — Database Seeding & ETL Pipeline
Ingests master land acquisition dataset into relational SQLite / PostgreSQL tables.
Team: Quorum Intelligence | Problem Statement ID: SIH26016
"""

import os
import sys
import sqlite3
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DB_PATH = PROJECT_ROOT / "database" / "bhoomisetu.db"
SCHEMA_PATH = PROJECT_ROOT / "database" / "schema.sql"
CSV_PATH = PROJECT_ROOT / "land_acquisition_master.csv"


def init_db():
    print(f"[*] Initializing BhoomiSetu database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    if SCHEMA_PATH.exists():
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            schema_sql = f.read()
        cursor.executescript(schema_sql)
        conn.commit()
        print("[✓] Schema applied successfully.")
    else:
        print(f"[!] Warning: Schema file not found at {SCHEMA_PATH}")

    return conn


def seed_master_records(conn):
    if not CSV_PATH.exists():
        print(f"[!] Master CSV not found at {CSV_PATH}. Skipping CSV ingestion.")
        return

    print(f"[*] Ingesting records from: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH)
    cursor = conn.cursor()

    # Seed Districts
    districts = df[["state", "district"]].drop_duplicates()
    for _, row in districts.iterrows():
        dist_id = f"{row['state']}_{row['district']}".replace(" ", "_").lower()
        cursor.execute(
            """
            INSERT OR IGNORE INTO districts (id, name, state, state_code)
            VALUES (?, ?, ?, ?)
            """,
            (dist_id, str(row["district"]), str(row["state"]), str(row["state"])[:3].upper()),
        )

    # Seed Projects
    sample_records = df.head(100)
    for idx, row in sample_records.iterrows():
        prj_id = str(row.get("project_id", f"PRJ_{idx:04d}"))
        dist_id = f"{row.get('state', '')}_{row.get('district', '')}".replace(" ", "_").lower()
        cursor.execute(
            """
            INSERT OR IGNORE INTO projects (
                id, project_code, name, sector, state, district_id, implementing_agency,
                statutory_stage, total_cost_crores, land_required_hectares,
                possession_pct, compensation_pending_pct, delay_probability, risk_level
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                prj_id,
                f"CODE-{idx:04d}",
                f"{row.get('project_type', 'Infrastructure')} Corridor {idx:02d}",
                str(row.get("project_type", "Highway")),
                str(row.get("state", "Gujarat")),
                dist_id,
                "NHAI / State PWD",
                str(row.get("acquisition_stage", "Compensation Disbursement")),
                float(row.get("project_cost", 500.0)),
                float(row.get("land_required_hectares", 100.0)),
                float(row.get("possession_pct", 50.0)),
                float(row.get("compensation_pending_pct", 30.0)),
                0.45,
                "Moderate",
            ),
        )

    conn.commit()
    print(f"[✓] Successfully ingested projects and districts into database.")


if __name__ == "__main__":
    conn = init_db()
    seed_master_records(conn)
    conn.close()
    print("[✓] BhoomiSetu database initialization complete.")
