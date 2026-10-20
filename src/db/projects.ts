// src/db/projects.ts
import { db } from './index.ts';
import { projects, districts, earlyWarningAlerts } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getProjects() {
  try {
    return await db.select().from(projects).orderBy(desc(projects.delayProbability));
  } catch (error) {
    console.error('Database query failed in getProjects:', error);
    throw new Error('Failed to retrieve projects.', { cause: error });
  }
}

export async function getDistricts() {
  try {
    return await db.select().from(districts).orderBy(desc(districts.riskRate));
  } catch (error) {
    console.error('Database query failed in getDistricts:', error);
    throw new Error('Failed to retrieve districts.', { cause: error });
  }
}

export async function getEarlyWarningAlerts() {
  try {
    return await db.select().from(earlyWarningAlerts).where(eq(earlyWarningAlerts.status, 'Open'));
  } catch (error) {
    console.error('Database query failed in getEarlyWarningAlerts:', error);
    throw new Error('Failed to retrieve alerts.', { cause: error });
  }
}
