import {
  alerts,
  districts,
  financials,
  interventions,
  projects,
  corridors,
} from './mockData';

export interface IngestSyncResult {
  success: boolean;
  message: string;
  counts?: {
    projects: number;
    districts: number;
    alerts: number;
    financials: number;
    corridors: number;
    interventions: number;
  };
  generated_dataset_files?: string[];
  timestamp?: string;
  error?: string;
}

export async function syncRealtimeDataToBackend(apiBaseUrl?: string): Promise<IngestSyncResult> {
  const payload = {
    timestamp: new Date().toISOString(),
    source: 'frontend-realtime-telemetry',
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      projectCode: p.projectCode,
      district: p.district,
      phase: p.phase,
      riskLevel: p.riskLevel,
      riskScore: p.riskScore,
      delayProbability: p.delayProbability,
      predictedDelayWindow: p.predictedDelayWindow,
      confidence: p.confidence,
      lastUpdated: p.lastUpdated,
      budget: p.budget,
      affectedFamilies: p.affectedFamilies,
      contributors: p.contributors || [],
      lifecycleStages: p.lifecycleStages || [],
    })),
    districts: districts.map((d) => ({
      id: d.id,
      name: d.name,
      monitoredProjects: d.monitoredProjects,
      atRiskProjects: d.atRiskProjects,
      averageDelay: d.averageDelay,
      riskRate: d.riskRate,
      compensationPending: d.compensationPending,
      legalCases: d.legalCases,
      trend: d.trend,
      mapPosition: d.mapPosition,
    })),
    alerts: alerts.map((a) => ({
      id: a.id,
      projectId: a.projectId,
      projectName: a.projectName,
      district: a.district,
      category: a.category,
      severity: a.severity,
      predictedDelay: a.predictedDelay,
      confidence: a.confidence,
      primaryCause: a.primaryCause,
      timestamp: a.timestamp,
      recommendedIntervention: a.recommendedIntervention,
      status: a.status,
    })),
    financials: financials.map((f) => ({
      district: f.district,
      sanctioned: f.sanctioned,
      released: f.released,
      utilized: f.utilized,
      pendingCompensation: f.pendingCompensation,
      agingBuckets: f.agingBuckets,
    })),
    corridors: corridors.map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      route: c.route,
      riskLevel: c.riskLevel,
      riskScore: c.riskScore,
      projects: c.projects,
      exposedValue: c.exposedValue,
      leadSignal: c.leadSignal,
      nodes: c.nodes,
    })),
    interventions: interventions.map((i) => ({
      id: i.id,
      title: i.title,
      owner: i.owner,
      status: i.status,
      dueDate: i.dueDate || (i as any).due,
      assignedAt: i.assignedAt,
      projectId: i.projectId,
    })),
  };

  try {
    const url = apiBaseUrl && apiBaseUrl.trim() !== ''
      ? `${apiBaseUrl.replace(/\/$/, '')}/api/v1/ingest`
      : '/api/v1/ingest';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Ingestion failed with status ${response.status}`,
        error: errorText,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message,
      counts: data.counts,
      generated_dataset_files: data.generated_dataset_files,
      timestamp: data.timestamp,
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Failed to connect to backend ingestion endpoint',
      error: err?.message || String(err),
    };
  }
}
