-- ============================================================================
-- 🏛️ BhoomiSetu — Relational Database Schema (PostgreSQL / SQLite Compatible)
-- Smart India Hackathon 2026 | Problem Statement ID: SIH26016
-- Domain: Land Acquisition Early Warning System (RFCTLARR Act 2013 Compliance)
-- ============================================================================

-- Enable UUID extension if running on PostgreSQL
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Jurisdictions & Administrative Hierarchy
CREATE TABLE IF NOT EXISTS districts (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    state VARCHAR(64) NOT NULL,
    state_code VARCHAR(10) NOT NULL,
    total_corridors INT DEFAULT 0,
    monitored_projects INT DEFAULT 0,
    at_risk_projects INT DEFAULT 0,
    risk_rate DECIMAL(5, 2) DEFAULT 0.0,
    median_delay_months DECIMAL(4, 1) DEFAULT 0.0,
    slao_officer_name VARCHAR(128),
    slao_contact VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Infrastructure Projects Master Record
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    project_code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(64) NOT NULL, -- Highway, Railway, Metro, Industrial Corridor, Water/Irrigation
    state VARCHAR(64) NOT NULL,
    district_id VARCHAR(64) REFERENCES districts(id),
    implementing_agency VARCHAR(128) NOT NULL, -- NHAI, DMRC, MoRTH, DFCCIL, State PWD
    statutory_stage VARCHAR(64) NOT NULL, -- Pre-Notification, Section 11, Section 19, Section 23 Award, Compensation Disbursement, Possession
    
    -- Linear & Physical Scope
    length_km DECIMAL(8, 2) DEFAULT 0.0,
    land_required_hectares DECIMAL(10, 2) NOT NULL,
    land_acquired_hectares DECIMAL(10, 2) DEFAULT 0.0,
    land_pending_hectares DECIMAL(10, 2) DEFAULT 0.0,
    possession_pct DECIMAL(5, 2) DEFAULT 0.0,
    continuous_clear_row_km DECIMAL(8, 2) DEFAULT 0.0,
    
    -- Financial Outlay & Escrow Ledger (RFCTLARR Sec 77/80)
    total_cost_crores DECIMAL(12, 2) NOT NULL,
    sanctioned_compensation_crores DECIMAL(12, 2) NOT NULL,
    disbursed_compensation_crores DECIMAL(12, 2) DEFAULT 0.0,
    pending_compensation_crores DECIMAL(12, 2) DEFAULT 0.0,
    compensation_pending_pct DECIMAL(5, 2) DEFAULT 0.0,
    escrow_account_number VARCHAR(64),
    court_escrow_deposit_crores DECIMAL(12, 2) DEFAULT 0.0,
    
    -- Social & Legal Friction Indicators
    affected_families INT DEFAULT 0,
    displaced_families INT DEFAULT 0,
    court_case_count INT DEFAULT 0,
    high_court_stays INT DEFAULT 0,
    civil_court_petitions INT DEFAULT 0,
    public_objections_sec15 INT DEFAULT 0,
    
    -- Model Prediction & Early Warning Signals
    delay_probability DECIMAL(5, 4) DEFAULT 0.0,
    risk_level VARCHAR(32) DEFAULT 'Low', -- Low, Moderate, High, Critical
    predicted_delay_window VARCHAR(64), -- e.g., '6-9 months'
    days_in_current_stage INT DEFAULT 0,
    last_ml_evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Cadastral Land Parcels & Alignment Chokepoints
CREATE TABLE IF NOT EXISTS land_parcels (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    survey_number VARCHAR(64) NOT NULL,
    village VARCHAR(128) NOT NULL,
    taluka VARCHAR(128) NOT NULL,
    chainage_marker VARCHAR(64), -- e.g., 'Km 189.400'
    area_hectares DECIMAL(8, 4) NOT NULL,
    classification VARCHAR(64) NOT NULL, -- Private Agricultural, Government Waste, Forest, Gamtal
    
    -- Ownership & Co-Sharers (Group Land Module)
    total_co_owners INT DEFAULT 1,
    consented_co_owners INT DEFAULT 0,
    disputed_co_owners INT DEFAULT 0,
    consent_percentage DECIMAL(5, 2) DEFAULT 100.0,
    
    -- Legal Injunction & Physical Possession
    stay_order_active BOOLEAN DEFAULT FALSE,
    court_docket_ref VARCHAR(128),
    possession_status VARCHAR(32) DEFAULT 'Pending', -- Pending, Partial, Clear
    fast_track_eligible BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Compensation Dockets & Direct Benefit Transfers (DBT)
CREATE TABLE IF NOT EXISTS compensation_dockets (
    id VARCHAR(64) PRIMARY KEY,
    parcel_id VARCHAR(64) REFERENCES land_parcels(id),
    titleholder_name VARCHAR(128) NOT NULL,
    aadhaar_hash VARCHAR(64),
    bank_account_verified BOOLEAN DEFAULT FALSE,
    solatium_amount_inr DECIMAL(12, 2) NOT NULL,
    market_value_inr DECIMAL(12, 2) NOT NULL,
    total_entitlement_inr DECIMAL(12, 2) NOT NULL,
    dbt_status VARCHAR(32) DEFAULT 'Pending', -- Pending, Processing, Disbursed, Mismatched
    utr_transaction_ref VARCHAR(64),
    disbursed_at TIMESTAMP
);

-- 5. Early Warning Alerts & Task Force Escalations
CREATE TABLE IF NOT EXISTS early_warning_alerts (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    severity VARCHAR(32) NOT NULL, -- Critical, High, Moderate, Low
    category VARCHAR(64) NOT NULL, -- Statutory Lapse, Legal Stay, Compensation DBT, Social Friction
    primary_cause TEXT NOT NULL,
    recommended_intervention TEXT NOT NULL,
    statutory_citation VARCHAR(128), -- e.g., 'RFCTLARR Sec 19(1)'
    status VARCHAR(32) DEFAULT 'Open', -- Open, Assigned, Mitigated, Closed
    assigned_to VARCHAR(128),
    action_deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tamper-Evident Immutable Audit Log (CAG Protocol v4.2)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(64) NOT NULL,
    user_role VARCHAR(64) NOT NULL,
    action_type VARCHAR(64) NOT NULL, -- UPDATE_COMPENSATION, DISMISS_ALERT, DEPLOY_TASK_FORCE, OVERRIDE_RISK
    target_entity VARCHAR(64) NOT NULL, -- projects, parcels, compensation_dockets
    target_id VARCHAR(64) NOT NULL,
    previous_state_json TEXT,
    new_state_json TEXT,
    ip_address VARCHAR(45),
    cryptographic_sha256 VARCHAR(64) NOT NULL
);

-- Indexes for high-throughput GIS and ML query velocity
CREATE INDEX IF NOT EXISTS idx_projects_risk ON projects(risk_level, delay_probability);
CREATE INDEX IF NOT EXISTS idx_projects_district ON projects(district_id);
CREATE INDEX IF NOT EXISTS idx_parcels_project ON land_parcels(project_id);
CREATE INDEX IF NOT EXISTS idx_alerts_project ON early_warning_alerts(project_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_logs(target_entity, target_id);
