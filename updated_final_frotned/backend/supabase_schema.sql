-- ==========================================================================
-- BhoomiSetu - Land Acquisition Early Warning & Spatial Intelligence Platform
-- Supabase PostgreSQL Production Database Schema
-- Target: PostgreSQL 15+ / Supabase with PostGIS (Optional)
-- ==========================================================================

-- Enable UUID and PostGIS extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- --------------------------------------------------------------------------
-- Table: audit_logs
-- --------------------------------------------------------------------------
CREATE TABLE audit_logs (
	actor_id VARCHAR(36), 
	actor_email VARCHAR(255) NOT NULL, 
	actor_role VARCHAR(100) NOT NULL, 
	action VARCHAR(100) NOT NULL, 
	resource_type VARCHAR(100) NOT NULL, 
	resource_id VARCHAR(100) NOT NULL, 
	request_id VARCHAR(100) NOT NULL, 
	ip_address VARCHAR(45), 
	user_agent VARCHAR(255), 
	status VARCHAR(20) NOT NULL, 
	detail TEXT NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_audit_logs PRIMARY KEY (id)
);

CREATE INDEX ix_audit_logs_request_id ON audit_logs (request_id);
CREATE INDEX ix_audit_logs_action ON audit_logs (action);
CREATE INDEX ix_audit_logs_id ON audit_logs (id);
CREATE INDEX ix_audit_logs_resource_id ON audit_logs (resource_id);
CREATE INDEX ix_audit_logs_actor_id ON audit_logs (actor_id);
CREATE INDEX ix_audit_logs_resource_type ON audit_logs (resource_type);

-- --------------------------------------------------------------------------
-- Table: model_versions
-- --------------------------------------------------------------------------
CREATE TABLE model_versions (
	version_tag VARCHAR(50) NOT NULL, 
	model_name VARCHAR(100) NOT NULL, 
	target_definition VARCHAR(100) NOT NULL, 
	feature_count INTEGER NOT NULL, 
	threshold FLOAT NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_model_versions PRIMARY KEY (id)
);

CREATE INDEX ix_model_versions_id ON model_versions (id);
CREATE UNIQUE INDEX ix_model_versions_version_tag ON model_versions (version_tag);

-- --------------------------------------------------------------------------
-- Table: project_corridors
-- --------------------------------------------------------------------------
CREATE TABLE project_corridors (
	name VARCHAR(255) NOT NULL, 
	code VARCHAR(50) NOT NULL, 
	route_description VARCHAR(255) NOT NULL, 
	risk_level VARCHAR(20) NOT NULL, 
	risk_score FLOAT NOT NULL, 
	projects_count INTEGER NOT NULL, 
	exposed_value_crores FLOAT NOT NULL, 
	lead_signal VARCHAR(255) NOT NULL, 
	nodes_json TEXT NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_project_corridors PRIMARY KEY (id), 
	CONSTRAINT uq_project_corridors_code UNIQUE (code)
);

CREATE INDEX ix_project_corridors_id ON project_corridors (id);

-- --------------------------------------------------------------------------
-- Table: states
-- --------------------------------------------------------------------------
CREATE TABLE states (
	name VARCHAR(100) NOT NULL, 
	code VARCHAR(10) NOT NULL, 
	boundary_geojson TEXT, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_states PRIMARY KEY (id), 
	CONSTRAINT uq_states_code UNIQUE (code)
);

CREATE UNIQUE INDEX ix_states_name ON states (name);
CREATE INDEX ix_states_id ON states (id);

-- --------------------------------------------------------------------------
-- Table: districts
-- --------------------------------------------------------------------------
CREATE TABLE districts (
	state_id VARCHAR(36) NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	headquarters VARCHAR(100), 
	map_x FLOAT NOT NULL, 
	map_y FLOAT NOT NULL, 
	boundary_geojson TEXT, 
	monitored_projects_count INTEGER NOT NULL, 
	at_risk_projects_count INTEGER NOT NULL, 
	average_delay_months FLOAT NOT NULL, 
	risk_rate_pct FLOAT NOT NULL, 
	compensation_pending_crores FLOAT NOT NULL, 
	legal_cases_count INTEGER NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_districts PRIMARY KEY (id), 
	CONSTRAINT fk_districts_state_id_states FOREIGN KEY(state_id) REFERENCES states (id) ON DELETE CASCADE
);

CREATE INDEX ix_districts_id ON districts (id);
CREATE INDEX ix_districts_state_id ON districts (state_id);
CREATE INDEX ix_districts_name ON districts (name);

-- --------------------------------------------------------------------------
-- Table: projects
-- --------------------------------------------------------------------------
CREATE TABLE projects (
	name VARCHAR(255) NOT NULL, 
	project_code VARCHAR(50) NOT NULL, 
	state_id VARCHAR(36) NOT NULL, 
	district_id VARCHAR(36) NOT NULL, 
	project_type VARCHAR(50) NOT NULL, 
	phase VARCHAR(100) NOT NULL, 
	budget_crores FLOAT NOT NULL, 
	expenditure_crores FLOAT NOT NULL, 
	target_completion_date DATE, 
	current_risk_level VARCHAR(20) NOT NULL, 
	current_risk_score FLOAT NOT NULL, 
	delay_probability FLOAT NOT NULL, 
	predicted_delay_window VARCHAR(50) NOT NULL, 
	model_confidence FLOAT NOT NULL, 
	land_acquired_pct FLOAT NOT NULL, 
	land_pending_pct FLOAT NOT NULL, 
	row_available_pct FLOAT NOT NULL, 
	possession_pct FLOAT NOT NULL, 
	affected_families_count INTEGER NOT NULL, 
	families_relocated_count INTEGER NOT NULL, 
	corridor_alignment_geojson TEXT, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_projects PRIMARY KEY (id), 
	CONSTRAINT ck_projects_ck_project_budget_non_negative CHECK (budget_crores >= 0), 
	CONSTRAINT ck_projects_ck_land_acquired_range CHECK (land_acquired_pct >= 0 AND land_acquired_pct <= 100), 
	CONSTRAINT ck_projects_ck_land_pending_range CHECK (land_pending_pct >= 0 AND land_pending_pct <= 100), 
	CONSTRAINT ck_projects_ck_risk_score_range CHECK (current_risk_score >= 0 AND current_risk_score <= 100), 
	CONSTRAINT ck_projects_ck_delay_prob_range CHECK (delay_probability >= 0.0 AND delay_probability <= 1.0), 
	CONSTRAINT fk_projects_state_id_states FOREIGN KEY(state_id) REFERENCES states (id) ON DELETE RESTRICT, 
	CONSTRAINT fk_projects_district_id_districts FOREIGN KEY(district_id) REFERENCES districts (id) ON DELETE RESTRICT
);

CREATE INDEX ix_projects_current_risk_level ON projects (current_risk_level);
CREATE UNIQUE INDEX ix_projects_project_code ON projects (project_code);
CREATE INDEX ix_projects_id ON projects (id);
CREATE INDEX ix_projects_district_id ON projects (district_id);
CREATE INDEX ix_projects_state_id ON projects (state_id);
CREATE INDEX ix_projects_name ON projects (name);

-- --------------------------------------------------------------------------
-- Table: talukas
-- --------------------------------------------------------------------------
CREATE TABLE talukas (
	district_id VARCHAR(36) NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_talukas PRIMARY KEY (id), 
	CONSTRAINT fk_talukas_district_id_districts FOREIGN KEY(district_id) REFERENCES districts (id) ON DELETE CASCADE
);

CREATE INDEX ix_talukas_id ON talukas (id);
CREATE INDEX ix_talukas_name ON talukas (name);
CREATE INDEX ix_talukas_district_id ON talukas (district_id);

-- --------------------------------------------------------------------------
-- Table: users
-- --------------------------------------------------------------------------
CREATE TABLE users (
	email VARCHAR(255) NOT NULL, 
	hashed_password VARCHAR(255) NOT NULL, 
	full_name VARCHAR(255) NOT NULL, 
	role VARCHAR(50) NOT NULL, 
	state_id VARCHAR(36), 
	district_id VARCHAR(36), 
	is_active BOOLEAN NOT NULL, 
	failed_login_attempts INTEGER NOT NULL, 
	locked_until TIMESTAMP WITH TIME ZONE, 
	last_login TIMESTAMP WITH TIME ZONE, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_users PRIMARY KEY (id), 
	CONSTRAINT fk_users_state_id_states FOREIGN KEY(state_id) REFERENCES states (id) ON DELETE SET NULL, 
	CONSTRAINT fk_users_district_id_districts FOREIGN KEY(district_id) REFERENCES districts (id) ON DELETE SET NULL
);

CREATE INDEX ix_users_id ON users (id);
CREATE UNIQUE INDEX ix_users_email ON users (email);
CREATE INDEX ix_users_role ON users (role);

-- --------------------------------------------------------------------------
-- Table: acquisition_stages
-- --------------------------------------------------------------------------
CREATE TABLE acquisition_stages (
	project_id VARCHAR(36) NOT NULL, 
	stage_name VARCHAR(100) NOT NULL, 
	stage_order INTEGER NOT NULL, 
	status VARCHAR(20) NOT NULL, 
	duration VARCHAR(30) NOT NULL, 
	expected_duration VARCHAR(30) NOT NULL, 
	delay_days INTEGER NOT NULL, 
	responsible_authority VARCHAR(100) NOT NULL, 
	primary_blocker VARCHAR(255), 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_acquisition_stages PRIMARY KEY (id), 
	CONSTRAINT fk_acquisition_stages_project_id_projects FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE INDEX ix_acquisition_stages_id ON acquisition_stages (id);
CREATE INDEX ix_acquisition_stages_project_id ON acquisition_stages (project_id);

-- --------------------------------------------------------------------------
-- Table: alerts
-- --------------------------------------------------------------------------
CREATE TABLE alerts (
	project_id VARCHAR(36) NOT NULL, 
	category VARCHAR(30) NOT NULL, 
	severity VARCHAR(20) NOT NULL, 
	primary_cause VARCHAR(255) NOT NULL, 
	predicted_delay VARCHAR(50) NOT NULL, 
	confidence FLOAT NOT NULL, 
	recommended_intervention TEXT NOT NULL, 
	status VARCHAR(30) NOT NULL, 
	acknowledged_by VARCHAR(100), 
	acknowledged_at TIMESTAMP WITH TIME ZONE, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_alerts PRIMARY KEY (id), 
	CONSTRAINT fk_alerts_project_id_projects FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE INDEX ix_alerts_id ON alerts (id);
CREATE INDEX ix_alerts_project_id ON alerts (project_id);

-- --------------------------------------------------------------------------
-- Table: compensation_records
-- --------------------------------------------------------------------------
CREATE TABLE compensation_records (
	project_id VARCHAR(36) NOT NULL, 
	sanctioned_amount_crores FLOAT NOT NULL, 
	released_amount_crores FLOAT NOT NULL, 
	utilized_amount_crores FLOAT NOT NULL, 
	pending_amount_crores FLOAT NOT NULL, 
	disputed_amount_crores FLOAT NOT NULL, 
	awards_total INTEGER NOT NULL, 
	awards_disbursed INTEGER NOT NULL, 
	awards_pending INTEGER NOT NULL, 
	aging_0_30_days FLOAT NOT NULL, 
	aging_31_60_days FLOAT NOT NULL, 
	aging_61_90_days FLOAT NOT NULL, 
	aging_gt_90_days FLOAT NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_compensation_records PRIMARY KEY (id), 
	CONSTRAINT ck_compensation_records_ck_comp_sanctioned_non_neg CHECK (sanctioned_amount_crores >= 0), 
	CONSTRAINT ck_compensation_records_ck_comp_released_non_neg CHECK (released_amount_crores >= 0), 
	CONSTRAINT ck_compensation_records_ck_comp_utilized_non_neg CHECK (utilized_amount_crores >= 0), 
	CONSTRAINT ck_compensation_records_ck_comp_pending_non_neg CHECK (pending_amount_crores >= 0), 
	CONSTRAINT fk_compensation_records_project_id_projects FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE INDEX ix_compensation_records_id ON compensation_records (id);
CREATE UNIQUE INDEX ix_compensation_records_project_id ON compensation_records (project_id);

-- --------------------------------------------------------------------------
-- Table: grievances
-- --------------------------------------------------------------------------
CREATE TABLE grievances (
	project_id VARCHAR(36) NOT NULL, 
	category VARCHAR(100) NOT NULL, 
	claimant_name VARCHAR(255) NOT NULL, 
	description TEXT NOT NULL, 
	status VARCHAR(50) NOT NULL, 
	filed_date DATE NOT NULL, 
	resolution_date DATE, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_grievances PRIMARY KEY (id), 
	CONSTRAINT fk_grievances_project_id_projects FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE INDEX ix_grievances_status ON grievances (status);
CREATE INDEX ix_grievances_id ON grievances (id);
CREATE INDEX ix_grievances_project_id ON grievances (project_id);

-- --------------------------------------------------------------------------
-- Table: interventions
-- --------------------------------------------------------------------------
CREATE TABLE interventions (
	project_id VARCHAR(36) NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	owner VARCHAR(150) NOT NULL, 
	status VARCHAR(30) NOT NULL, 
	due_date DATE NOT NULL, 
	assigned_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_interventions PRIMARY KEY (id), 
	CONSTRAINT fk_interventions_project_id_projects FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE INDEX ix_interventions_project_id ON interventions (project_id);
CREATE INDEX ix_interventions_id ON interventions (id);

-- --------------------------------------------------------------------------
-- Table: legal_cases
-- --------------------------------------------------------------------------
CREATE TABLE legal_cases (
	project_id VARCHAR(36) NOT NULL, 
	case_number VARCHAR(100) NOT NULL, 
	court_name VARCHAR(255) NOT NULL, 
	case_type VARCHAR(100) NOT NULL, 
	has_interim_stay BOOLEAN NOT NULL, 
	filing_date DATE NOT NULL, 
	last_hearing_date DATE, 
	next_hearing_date DATE, 
	status VARCHAR(50) NOT NULL, 
	summary TEXT, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_legal_cases PRIMARY KEY (id), 
	CONSTRAINT fk_legal_cases_project_id_projects FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE INDEX ix_legal_cases_project_id ON legal_cases (project_id);
CREATE INDEX ix_legal_cases_case_number ON legal_cases (case_number);
CREATE INDEX ix_legal_cases_status ON legal_cases (status);
CREATE INDEX ix_legal_cases_has_interim_stay ON legal_cases (has_interim_stay);
CREATE INDEX ix_legal_cases_id ON legal_cases (id);

-- --------------------------------------------------------------------------
-- Table: milestones
-- --------------------------------------------------------------------------
CREATE TABLE milestones (
	project_id VARCHAR(36) NOT NULL, 
	statutory_section VARCHAR(50) NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	target_date DATE NOT NULL, 
	achieved_date DATE, 
	is_statutory_sla_breached BOOLEAN NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_milestones PRIMARY KEY (id), 
	CONSTRAINT fk_milestones_project_id_projects FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE INDEX ix_milestones_id ON milestones (id);
CREATE INDEX ix_milestones_project_id ON milestones (project_id);

-- --------------------------------------------------------------------------
-- Table: predictions
-- --------------------------------------------------------------------------
CREATE TABLE predictions (
	project_id VARCHAR(36) NOT NULL, 
	model_version_tag VARCHAR(50) NOT NULL, 
	delay_probability FLOAT NOT NULL, 
	risk_level VARCHAR(20) NOT NULL, 
	is_simulated BOOLEAN NOT NULL, 
	prediction_date TIMESTAMP WITH TIME ZONE NOT NULL, 
	input_features_json TEXT, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_predictions PRIMARY KEY (id), 
	CONSTRAINT ck_predictions_ck_pred_prob_range CHECK (delay_probability >= 0.0 AND delay_probability <= 1.0), 
	CONSTRAINT fk_predictions_project_id_projects FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE INDEX ix_predictions_prediction_date ON predictions (prediction_date);
CREATE INDEX ix_predictions_id ON predictions (id);
CREATE INDEX ix_predictions_project_id ON predictions (project_id);

-- --------------------------------------------------------------------------
-- Table: recommendations
-- --------------------------------------------------------------------------
CREATE TABLE recommendations (
	project_id VARCHAR(36) NOT NULL, 
	category VARCHAR(30) NOT NULL, 
	priority VARCHAR(20) NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	reason TEXT NOT NULL, 
	recommended_action TEXT NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_recommendations PRIMARY KEY (id), 
	CONSTRAINT fk_recommendations_project_id_projects FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE INDEX ix_recommendations_project_id ON recommendations (project_id);
CREATE INDEX ix_recommendations_id ON recommendations (id);

-- --------------------------------------------------------------------------
-- Table: refresh_tokens
-- --------------------------------------------------------------------------
CREATE TABLE refresh_tokens (
	user_id VARCHAR(36) NOT NULL, 
	token_hash VARCHAR(64) NOT NULL, 
	expires_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	is_revoked BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	CONSTRAINT pk_refresh_tokens PRIMARY KEY (id), 
	CONSTRAINT fk_refresh_tokens_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_refresh_tokens_id ON refresh_tokens (id);
CREATE INDEX ix_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX ix_refresh_tokens_token_hash ON refresh_tokens (token_hash);

-- --------------------------------------------------------------------------
-- Table: rehabilitation_resettlement
-- --------------------------------------------------------------------------
CREATE TABLE rehabilitation_resettlement (
	project_id VARCHAR(36) NOT NULL, 
	affected_families_count INTEGER NOT NULL, 
	relocated_families_count INTEGER NOT NULL, 
	sites_ready_pct FLOAT NOT NULL, 
	infrastructure_ready BOOLEAN NOT NULL, 
	pending_amenities_count INTEGER NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_rehabilitation_resettlement PRIMARY KEY (id), 
	CONSTRAINT ck_rehabilitation_resettlement_ck_rr_sites_range CHECK (sites_ready_pct >= 0 AND sites_ready_pct <= 100), 
	CONSTRAINT ck_rehabilitation_resettlement_ck_rr_affected_non_neg CHECK (affected_families_count >= 0), 
	CONSTRAINT ck_rehabilitation_resettlement_ck_rr_relocated_non_neg CHECK (relocated_families_count >= 0), 
	CONSTRAINT fk_rehabilitation_resettlement_project_id_projects FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX ix_rehabilitation_resettlement_project_id ON rehabilitation_resettlement (project_id);
CREATE INDEX ix_rehabilitation_resettlement_id ON rehabilitation_resettlement (id);

-- --------------------------------------------------------------------------
-- Table: villages
-- --------------------------------------------------------------------------
CREATE TABLE villages (
	taluka_id VARCHAR(36) NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	census_code VARCHAR(50), 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_villages PRIMARY KEY (id), 
	CONSTRAINT fk_villages_taluka_id_talukas FOREIGN KEY(taluka_id) REFERENCES talukas (id) ON DELETE CASCADE
);

CREATE INDEX ix_villages_taluka_id ON villages (taluka_id);
CREATE INDEX ix_villages_id ON villages (id);
CREATE INDEX ix_villages_name ON villages (name);

-- --------------------------------------------------------------------------
-- Table: compensation_disputes
-- --------------------------------------------------------------------------
CREATE TABLE compensation_disputes (
	compensation_record_id VARCHAR(36) NOT NULL, 
	claimant_name VARCHAR(255) NOT NULL, 
	survey_number VARCHAR(50) NOT NULL, 
	disputed_amount_lakhs FLOAT NOT NULL, 
	reason VARCHAR(255) NOT NULL, 
	status VARCHAR(50) NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_compensation_disputes PRIMARY KEY (id), 
	CONSTRAINT fk_compensation_disputes_compensation_record_id_compens_ea78 FOREIGN KEY(compensation_record_id) REFERENCES compensation_records (id) ON DELETE CASCADE
);

CREATE INDEX ix_compensation_disputes_compensation_record_id ON compensation_disputes (compensation_record_id);
CREATE INDEX ix_compensation_disputes_id ON compensation_disputes (id);

-- --------------------------------------------------------------------------
-- Table: land_parcels
-- --------------------------------------------------------------------------
CREATE TABLE land_parcels (
	village_id VARCHAR(36) NOT NULL, 
	survey_number VARCHAR(50) NOT NULL, 
	sub_division VARCHAR(20), 
	khata_number VARCHAR(50), 
	owner_name VARCHAR(255), 
	classification VARCHAR(100) NOT NULL, 
	area_hectares FLOAT NOT NULL, 
	boundary_geojson TEXT, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_land_parcels PRIMARY KEY (id), 
	CONSTRAINT ck_land_parcels_ck_parcel_area_non_negative CHECK (area_hectares >= 0), 
	CONSTRAINT fk_land_parcels_village_id_villages FOREIGN KEY(village_id) REFERENCES villages (id) ON DELETE CASCADE
);

CREATE INDEX ix_land_parcels_village_id ON land_parcels (village_id);
CREATE INDEX ix_land_parcels_survey_number ON land_parcels (survey_number);
CREATE INDEX ix_land_parcels_id ON land_parcels (id);

-- --------------------------------------------------------------------------
-- Table: prediction_factors
-- --------------------------------------------------------------------------
CREATE TABLE prediction_factors (
	prediction_id VARCHAR(36) NOT NULL, 
	feature_name VARCHAR(100) NOT NULL, 
	impact_value FLOAT NOT NULL, 
	direction VARCHAR(30) NOT NULL, 
	feature_value FLOAT, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_prediction_factors PRIMARY KEY (id), 
	CONSTRAINT fk_prediction_factors_prediction_id_predictions FOREIGN KEY(prediction_id) REFERENCES predictions (id) ON DELETE CASCADE
);

CREATE INDEX ix_prediction_factors_id ON prediction_factors (id);
CREATE INDEX ix_prediction_factors_prediction_id ON prediction_factors (prediction_id);

