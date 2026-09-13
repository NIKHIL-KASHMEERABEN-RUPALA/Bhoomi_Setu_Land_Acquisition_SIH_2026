/**
 * BhoomiSetu Unified API Client
 * Connects frontend views to the FastAPI ML-powered backend (/api/v1)
 * with automatic JWT session management and resilient fallback.
 */

const API_BASE = '/api/v1';

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in_seconds: number;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    district_id?: string | null;
    state_id?: string | null;
  };
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem('bhoomi_access_token');
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem('bhoomi_access_token', token);
  } catch {
    // Ignored
  }
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem('bhoomi_access_token');
  } catch {
    // Ignored
  }
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || errorData?.detail || `API request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

// Health Check
export async function checkBackendHealth(): Promise<{ status: string; components?: Record<string, string> }> {
  const res = await fetch('/health/ready');
  return res.json();
}

// Authentication
export async function login(email: string, password: string): Promise<TokenResponse> {
  const data = await apiFetch<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data?.access_token) {
    setStoredToken(data.access_token);
  }
  return data;
}

// Dashboard Overview
export async function fetchDashboardOverview(): Promise<any> {
  return apiFetch('/dashboard/overview');
}

// Projects
export async function fetchProjects(params?: Record<string, string | number>): Promise<any> {
  const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
  return apiFetch(`/projects${query}`);
}

export async function fetchProjectDetail(projectId: string): Promise<any> {
  return apiFetch(`/projects/${projectId}`);
}

export async function fetchProjectTimeline(projectId: string): Promise<any> {
  return apiFetch(`/projects/${projectId}/timeline`);
}

// ML Inference & What-If Simulation
export async function runProjectPrediction(projectId: string): Promise<any> {
  return apiFetch(`/projects/${projectId}/predict`, {
    method: 'POST',
  });
}

export async function runWhatIfSimulation(projectId: string, changes: Record<string, number>): Promise<any> {
  return apiFetch(`/projects/${projectId}/simulate`, {
    method: 'POST',
    body: JSON.stringify({ changes }),
  });
}

export async function fetchProjectRecommendations(projectId: string): Promise<any> {
  return apiFetch(`/projects/${projectId}/recommendations`);
}
