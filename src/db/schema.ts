// src/db/schema.ts
import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  doublePrecision,
  boolean,
  varchar,
} from 'drizzle-orm/pg-core';

// 1. Users table (linked to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('CALA'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Districts table
export const districts = pgTable('districts', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 128 }).notNull(),
  state: varchar('state', { length: 64 }).notNull(),
  stateCode: varchar('state_code', { length: 10 }).notNull(),
  totalCorridors: integer('total_corridors').default(0),
  atRiskProjects: integer('at_risk_projects').default(0),
  riskRate: doublePrecision('risk_rate').default(0.0),
  medianDelayMonths: doublePrecision('median_delay_months').default(0.0),
  slaoOfficerName: varchar('slao_officer_name', { length: 128 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Projects table
export const projects = pgTable('projects', {
  id: varchar('id', { length: 64 }).primaryKey(),
  projectCode: varchar('project_code', { length: 32 }).unique().notNull(),
  name: text('name').notNull(),
  sector: varchar('sector', { length: 64 }).notNull(),
  state: varchar('state', { length: 64 }).notNull(),
  districtId: varchar('district_id', { length: 64 }).references(() => districts.id),
  implementingAgency: varchar('implementing_agency', { length: 128 }).notNull(),
  statutoryStage: varchar('statutory_stage', { length: 64 }).notNull(),
  lengthKm: doublePrecision('length_km').default(0.0),
  landRequiredHectares: doublePrecision('land_required_hectares').notNull(),
  landAcquiredHectares: doublePrecision('land_acquired_hectares').default(0.0),
  possessionPct: doublePrecision('possession_pct').default(0.0),
  totalCostCrores: doublePrecision('total_cost_crores').notNull(),
  sanctionedCompensationCrores: doublePrecision('sanctioned_compensation_crores').default(0.0),
  disbursedCompensationCrores: doublePrecision('disbursed_compensation_crores').default(0.0),
  compensationPendingPct: doublePrecision('compensation_pending_pct').default(0.0),
  courtCaseCount: integer('court_case_count').default(0),
  highCourtStays: integer('high_court_stays').default(0),
  publicObjectionsSec15: integer('public_objections_sec15').default(0),
  delayProbability: doublePrecision('delay_probability').default(0.0),
  riskLevel: varchar('risk_level', { length: 32 }).default('Low'),
  predictedDelayWindow: varchar('predicted_delay_window', { length: 64 }),
  daysInCurrentStage: integer('days_in_current_stage').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 4. Land Parcels table
export const landParcels = pgTable('land_parcels', {
  id: varchar('id', { length: 64 }).primaryKey(),
  projectId: varchar('project_id', { length: 64 }).references(() => projects.id),
  surveyNumber: varchar('survey_number', { length: 64 }).notNull(),
  village: varchar('village', { length: 128 }).notNull(),
  taluka: varchar('taluka', { length: 128 }).notNull(),
  chainageMarker: varchar('chainage_marker', { length: 64 }),
  areaHectares: doublePrecision('area_hectares').notNull(),
  classification: varchar('classification', { length: 64 }).notNull(),
  totalCoOwners: integer('total_co_owners').default(1),
  stayOrderActive: boolean('stay_order_active').default(false),
  possessionStatus: varchar('possession_status', { length: 32 }).default('Pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Early Warning Alerts table
export const earlyWarningAlerts = pgTable('early_warning_alerts', {
  id: varchar('id', { length: 64 }).primaryKey(),
  projectId: varchar('project_id', { length: 64 }).references(() => projects.id),
  severity: varchar('severity', { length: 32 }).notNull(),
  category: varchar('category', { length: 64 }).notNull(),
  primaryCause: text('primary_cause').notNull(),
  recommendedIntervention: text('recommended_intervention').notNull(),
  statutoryCitation: varchar('statutory_citation', { length: 128 }),
  status: varchar('status', { length: 32 }).default('Open'),
  assignedTo: varchar('assigned_to', { length: 128 }),
  actionDeadline: timestamp('action_deadline'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const projectsRelations = relations(projects, ({ one, many }) => ({
  district: one(districts, {
    fields: [projects.districtId],
    references: [districts.id],
  }),
  parcels: many(landParcels),
  alerts: many(earlyWarningAlerts),
}));

export const landParcelsRelations = relations(landParcels, ({ one }) => ({
  project: one(projects, {
    fields: [landParcels.projectId],
    references: [projects.id],
  }),
}));

export const earlyWarningAlertsRelations = relations(earlyWarningAlerts, ({ one }) => ({
  project: one(projects, {
    fields: [earlyWarningAlerts.projectId],
    references: [projects.id],
  }),
}));
