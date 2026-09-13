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

// Group Land & Co-Ownership
export async function fetchGroupParcels(): Promise<any> {
  return apiFetch('/group-land/parcels');
}

export async function fetchGroupParcelDetail(parcelId: string): Promise<any> {
  return apiFetch(`/group-land/parcels/${parcelId}`);
}

export async function createGroupParcel(data: any): Promise<any> {
  return apiFetch('/group-land/parcels', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function submitSellShareRequest(
  parcelId: string,
  data: { co_owner_id: string; share_percentage: number; asking_price: number; reason?: string; notes?: string }
): Promise<any> {
  return apiFetch(`/group-land/parcels/${parcelId}/sell-request`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchAvailableSharesMarketplace(): Promise<any> {
  return apiFetch('/group-land/marketplace');
}

export async function submitBuyerInquiry(
  saleRequestId: string,
  data: { buyer_name: string; buyer_email?: string; buyer_phone?: string; offered_price: number; message?: string }
): Promise<any> {
  return apiFetch(`/group-land/sell-requests/${saleRequestId}/inquire`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function completeShareSale(
  saleRequestId: string,
  data: { buyer_name: string; buyer_email?: string; buyer_phone?: string; final_price?: number; notes?: string }
): Promise<any> {
  return apiFetch(`/group-land/sell-requests/${saleRequestId}/complete-sale`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchParcelAuditTrail(parcelId: string): Promise<any> {
  return apiFetch(`/group-land/parcels/${parcelId}/audit-trail`);
}

export interface NearestParcel {
  id: string;
  survey_number: string;
  village: string;
  taluka?: string;
  district: string;
  chainage?: string;
  corridor?: string;
  latitude: number;
  longitude: number;
  map_x?: number;
  map_y?: number;
  area_hectares: number;
  classification: string;
  habitation_status: 'none' | 'sparse' | 'dense';
  affected_families_count: number;
  structures_count: number;
  estimated_acquisition_days: number;
  is_anchor_target?: boolean;
  status_note?: string;
  distance_km: number;
  priority_tier: 'HIGH' | 'MODERATE' | 'LOW';
  priority_badge: string;
  priority_rank: number;
  priority_rank_score: number;
  rr_friction_level: string;
  rr_friction_code: 'zero' | 'sparse' | 'dense';
  cost_advantage: string;
  time_savings_days: number;
  fast_track_eligible: boolean;
  recommended_action: string;
}

export interface NearestParcelsResponse {
  success: boolean;
  anchor_parcel: NearestParcel;
  search_parameters: {
    radius_km: number;
    filter_priority: string;
    corridor: string;
  };
  metrics: {
    total_candidates_found: number;
    zero_habitation_count: number;
    inhabited_count: number;
    recommended_top_choice_id: string | null;
  };
  nearest_parcels: NearestParcel[];
}

export async function fetchNearestParcels(params?: {
  parcel_id?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
  filter_priority?: string;
  corridor?: string;
}): Promise<NearestParcelsResponse> {
  const query = new URLSearchParams();
  if (params?.parcel_id) query.set('parcel_id', params.parcel_id);
  if (params?.lat !== undefined) query.set('lat', String(params.lat));
  if (params?.lng !== undefined) query.set('lng', String(params.lng));
  if (params?.radius_km !== undefined) query.set('radius_km', String(params.radius_km));
  if (params?.filter_priority) query.set('filter_priority', params.filter_priority);
  if (params?.corridor) query.set('corridor', params.corridor);

  const qs = query.toString();
  return apiFetch(`/map/nearest-parcels${qs ? `?${qs}` : ''}`);
}

export async function fetchCorridorParcels(corridor?: string): Promise<{ parcels: NearestParcel[]; count: number }> {
  return apiFetch(`/map/parcels${corridor ? `?corridor=${corridor}` : ''}`);
}
