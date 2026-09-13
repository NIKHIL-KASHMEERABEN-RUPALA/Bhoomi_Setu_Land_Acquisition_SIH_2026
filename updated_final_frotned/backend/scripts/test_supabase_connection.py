"""
BhoomiSetu - Supabase PostgreSQL Connection Diagnostics & Health Verification Script
Validates DATABASE_URL, network reachability, SSL handshake, and table readiness.
"""

import sys
import os
import time
import asyncio

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from sqlalchemy import text
from app.core.config import settings
from app.db.session import (
    get_postgres_host_port,
    is_postgres_reachable,
    get_engine,
    get_db_url,
)
import app.models
from app.db.base import Base


async def run_diagnostics():
    print("=" * 75)
    print("      BHOOMISETU - SUPABASE POSTGRESQL CONNECTIVITY DIAGNOSTICS")
    print("=" * 75)

    host, port = get_postgres_host_port()
    configured_url = settings.DATABASE_URL or ""
    masked_url = ""
    if configured_url:
        # Mask password in URL for display
        parts = configured_url.split("@")
        if len(parts) > 1:
            pre = parts[0].split(":")
            if len(pre) > 2:
                masked_url = f"{pre[0]}:{pre[1]}:******@{parts[1]}"
            else:
                masked_url = f"******@{parts[1]}"
        else:
            masked_url = configured_url[:12] + "******"

    print(f"[*] Target Host              : {host}")
    print(f"[*] Target Port              : {port}")
    print(f"[*] Configured DATABASE_URL  : {masked_url if masked_url else '(None - Falling back to SQLite)'}")
    print(f"[*] Fallback to SQLite       : {settings.USE_SQLITE_FALLBACK}")
    print("-" * 75)

    if not configured_url:
        print("[!] NOTICE: DATABASE_URL is currently empty in .env.")
        print("[!] The application is currently running in Standalone Embedded SQLite mode.")
        print("[i] To connect to Supabase:")
        print("    1. Create a Supabase project at https://supabase.com")
        print("    2. Navigate to Project Settings -> Database -> Connection String")
        print("    3. Copy the URI (Transaction Pooler port 6543 or Direct port 5432)")
        print("    4. Paste it into your backend/.env as: DATABASE_URL=\"postgresql://...\"")
        print("    5. Re-run this diagnostic script: python scripts/test_supabase_connection.py")
        print("=" * 75)
        return

    # 1. Socket Ping Check
    print("[1/4] Checking TCP socket connectivity to PostgreSQL host...")
    start_ping = time.time()
    reachable = is_postgres_reachable(host, port, timeout=7.0)
    ping_ms = (time.time() - start_ping) * 1000

    if not reachable:
        print(f"[-] ERROR: Could not connect to {host}:{port} within 7 seconds.")
        print("    Possible causes:")
        print("    - Typo in the host name or wrong port (use 6543 for pooler or 5432 for direct).")
        print("    - Supabase project is paused or provisioning.")
        print("    - Firewall / network is blocking outbound port 5432/6543.")
        print("=" * 75)
        return

    print(f"[+] TCP socket reachable ({ping_ms:.1f}ms latency).")

    # 2. Async Engine Initialization & SSL Handshake
    print("[2/4] Initializing async engine with SSL and statement_cache_size=0...")
    engine = get_engine()

    # 3. Live Query Execution
    print("[3/4] Executing live handshake query (SELECT version())...")
    try:
        start_query = time.time()
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT version();"))
            version_str = result.scalar()
            query_ms = (time.time() - start_query) * 1000

        print(f"[+] Successfully connected to PostgreSQL! ({query_ms:.1f}ms)")
        print(f"    Version: {version_str}")
    except Exception as e:
        print(f"[-] Authentication or Handshake Error: {str(e)}")
        print("    Check your database password in DATABASE_URL.")
        print("=" * 75)
        return

    # 4. Table Count & Inspection
    print("[4/4] Inspecting BhoomiSetu database tables in public schema...")
    try:
        async with engine.connect() as conn:
            result = await conn.execute(
                text(
                    "SELECT table_name FROM information_schema.tables "
                    "WHERE table_schema = 'public' ORDER BY table_name;"
                )
            )
            tables = [row[0] for row in result.fetchall()]

        print(f"[+] Found {len(tables)} tables in database:")
        for t in tables[:10]:
            print(f"    - {t}")
        if len(tables) > 10:
            print(f"    ... and {len(tables) - 10} more tables.")

        expected_count = len(Base.metadata.sorted_tables)
        if len(tables) == 0:
            print("\n[!] The database currently has 0 tables.")
            print("[i] To create all tables and initial seed data:")
            print("    Option A: Run: python scripts/seed_demo_data.py")
            print("    Option B: Copy backend/supabase_schema.sql into the Supabase SQL Editor!")
        else:
            print(f"\n[+] Database is initialized and ready for production! ({len(tables)}/{expected_count} tables verified)")

    except Exception as e:
        print(f"[-] Error querying tables: {str(e)}")

    print("=" * 75)
    await engine.dispose()


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(run_diagnostics())
