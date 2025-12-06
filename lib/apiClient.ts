// API Client for authenticated requests to /api/metrics
// Uses token from AuthContext stored in sessionStorage

const API_BASE = '/api';
const TOKEN_KEY = 'cortexa_token';

export interface ApiError {
  error: string;
  status: number;
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Not authenticated') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

// Get current token from sessionStorage
function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

// Clear auth and reload on token expiration
function handleAuthExpired(): never {
  sessionStorage.removeItem('cortexa_auth');
  sessionStorage.removeItem(TOKEN_KEY);
  window.location.reload();
  throw new AuthenticationError('Session expired');
}

// Generic fetch wrapper with auth
async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  if (!token) {
    throw new AuthenticationError();
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 401) {
    handleAuthExpired();
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiRequestError(errorData.error || 'Request failed', response.status);
  }

  return response.json();
}

// ============================================
// API Types
// ============================================

export interface ClinicianMetrics {
  revenue: number;
  sessions: number;
  clients: number;
}

export interface MonthlyMetrics {
  revenue: number;
  sessions: number;
  activeClients: number;
  newClients: number;
  churnedClients: number;
  clinicians: Record<string, ClinicianMetrics>;
}

export interface PracticeSettings {
  capacity: number;
  currentOpenings: number;
  attendance: {
    showRate: number;
    clientCancelled: number;
    lateCancelled: number;
    clinicianCancelled: number;
    rebookRate: number;
  };
  outstandingNotesPercent: number;
  churnWindowDays: number;
}

export interface MetricsResponse {
  month?: string;
  metrics: MonthlyMetrics | Record<string, MonthlyMetrics>;
  settings: PracticeSettings;
  availableMonths?: string[];
}

// ============================================
// API Functions
// ============================================

/**
 * Fetch metrics for a specific month
 * @param month - Format: "YYYY-MM" (e.g., "2025-11")
 */
export async function fetchMonthMetrics(month: string): Promise<MetricsResponse> {
  return fetchWithAuth<MetricsResponse>(`/metrics?month=${month}`);
}

/**
 * Fetch all available metrics data
 */
export async function fetchAllMetrics(): Promise<MetricsResponse> {
  return fetchWithAuth<MetricsResponse>('/metrics');
}

/**
 * Check if we have a valid token stored
 */
export function hasToken(): boolean {
  return getToken() !== null;
}
