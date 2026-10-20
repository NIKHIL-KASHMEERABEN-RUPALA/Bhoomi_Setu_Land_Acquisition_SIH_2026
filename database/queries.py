"""
🏛️ BhoomiSetu — Common Database Query Helper
Pre-built SQL queries for statutory compliance, GIS corridor mapping, and executive triage.
"""

from typing import List, Dict, Any, Optional
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "bhoomisetu.db"


def get_connection():
    return sqlite3.connect(DB_PATH)


def fetch_critical_projects(limit: int = 10) -> List[Dict[str, Any]]:
    """Retrieves top projects ranked by delay probability and risk level."""
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id, name, sector, state, statutory_stage, total_cost_crores,
               possession_pct, compensation_pending_pct, delay_probability, risk_level
        FROM projects
        WHERE risk_level IN ('Critical', 'High')
        ORDER BY delay_probability DESC
        LIMIT ?
        """,
        (limit,),
    )
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


def fetch_district_risk_summary(state: Optional[str] = None) -> List[Dict[str, Any]]:
    """Calculates district-level risk aggregations and pending acquisition volume."""
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    query = """
        SELECT d.id, d.name AS district_name, d.state,
               COUNT(p.id) AS total_projects,
               AVG(p.delay_probability) AS avg_delay_risk,
               SUM(p.total_cost_crores) AS total_outlay_cr,
               AVG(p.possession_pct) AS avg_possession_pct
        FROM districts d
        LEFT JOIN projects p ON d.id = p.district_id
    """
    params = []
    if state:
        query += " WHERE d.state = ? "
        params.append(state)
        
    query += " GROUP BY d.id, d.name, d.state ORDER BY avg_delay_risk DESC"
    cursor.execute(query, params)
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows
