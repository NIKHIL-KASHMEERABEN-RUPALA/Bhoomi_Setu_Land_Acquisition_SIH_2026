# 🗄️ BhoomiSetu — PostgreSQL Database Layer (Cloud SQL & Drizzle ORM)

**Smart India Hackathon 2026 | Problem Statement ID: SIH26016**

The BhoomiSetu database layer runs on **Google Cloud SQL PostgreSQL** with **Drizzle ORM** for schema modeling, type-safe queries, and **Firebase Authentication** integration for role-based access.

---

## ⚡ Active Cloud SQL Instance Specifications

- **Engine:** PostgreSQL 16 (Developer Edition)
- **Instance Identifier:** `ai-studio-87e3abb9`
- **Region:** `asia-southeast1`
- **ORM & Migrations:** Drizzle ORM (`drizzle-orm`) & Drizzle Kit (`drizzle-kit`)
- **Connection Method:** Object Method connection pooling (`pg.Pool`) via local Cloud SQL proxy socket (`SQL_HOST`)

---

## 📐 Entity Relationship Model

```
+--------------------+        +---------------------+        +-----------------------+
|     districts      | 1    * |      projects       | 1    * |     land_parcels      |
|--------------------|<-------|---------------------|<-------|-----------------------|
| id (PK)            |        | id (PK)             |        | id (PK)               |
| name               |        | district_id (FK)    |        | project_id (FK)       |
| state              |        | sector              |        | survey_number         |
| risk_rate          |        | statutory_stage     |        | chainage_marker       |
| slao_officer_name  |        | delay_probability   |        | possession_status     |
+--------------------+        | possession_pct      |        | total_co_owners       |
                              +---------------------+        +-----------------------+
                                        | 1                              | 1
                                        |                                |
                                        | *                              | *
                              +---------------------+        +-----------------------+
                              | early_warning_alerts|        |         users         |
                              |---------------------|        |-----------------------|
                              | id (PK)             |        | id (PK, Serial)       |
                              | project_id (FK)     |        | uid (Firebase UID)    |
                              | severity            |        | email                 |
                              | statutory_citation  |        | role (CALA/DM/PD)     |
                              | action_deadline     |        | created_at            |
                              +---------------------+        +-----------------------+
```

---

## 📁 Key Files & Modules

| File | Purpose |
| :--- | :--- |
| **`src/db/schema.ts`** | Production Drizzle ORM PostgreSQL schema defining `users`, `projects`, `districts`, `landParcels`, and `earlyWarningAlerts`. |
| **`src/db/drizzle.config.ts`** | Drizzle Kit configuration using admin credentials (`SQL_ADMIN_USER`) for automated schema migrations. |
| **`src/db/index.ts`** | Object-based PostgreSQL connection pool (`pg.Pool`) with idle error handling and global caching across hot reloads. |
| **`src/db/users.ts`** | Atomic user synchronization helper (`onConflictDoUpdate`) linking Firebase Authentication UIDs to PostgreSQL. |
| **`src/db/projects.ts`** | Type-safe query helpers for executive project triage and district SLA diagnostics. |
| **`database/schema.sql`** | Raw SQL DDL schema file for standalone manual PostgreSQL and local testing. |
