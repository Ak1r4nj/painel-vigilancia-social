const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function clearToken() {
  localStorage.removeItem('access_token');
}

export function setToken(token: string) {
  localStorage.setItem('access_token', token);
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.message ?? 'Erro na requisição'), { status: res.status, body });
  }

  return res.json() as Promise<T>;
}

// --- Auth ---
export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/token', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// --- Summary ---
export interface Summary {
  totalChildren: number;
  reviewed: number;
  pending: number;
  healthAlerts: number;
  educationAlerts: number;
  socialAlerts: number;
}

export async function getSummary(): Promise<Summary> {
  return apiFetch<Summary>('/summary');
}

// --- Children ---
export interface AlertCount {
  health: number | null;
  education: number | null;
  social: number | null;
}

export interface ChildSummary {
  id: string;
  fullName: string;
  birthDate: string;
  neighborhood: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  alertCount: AlertCount;
  hasAlerts: boolean;
}

export interface ChildListResponse {
  items: ChildSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ChildDetail {
  id: string;
  fullName: string;
  birthDate: string;
  neighborhood: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  health: {
    lastVisit: string | null;
    vaccinesUpToDate: boolean;
    alerts: string[];
  } | null;
  education: {
    school: string;
    attendanceRate: number;
    alerts: string[];
  } | null;
  social: {
    benefit: string;
    benefitStatus: string;
    alerts: string[];
  } | null;
}

export interface ChildListParams {
  neighborhood?: string;
  hasAlerts?: boolean;
  reviewed?: boolean;
  page?: number;
  pageSize?: number;
}

export async function getChildren(params: ChildListParams = {}): Promise<ChildListResponse> {
  const qs = new URLSearchParams();
  if (params.neighborhood) qs.set('neighborhood', params.neighborhood);
  if (params.hasAlerts !== undefined) qs.set('hasAlerts', String(params.hasAlerts));
  if (params.reviewed !== undefined) qs.set('reviewed', String(params.reviewed));
  if (params.page) qs.set('page', String(params.page));
  if (params.pageSize) qs.set('pageSize', String(params.pageSize));
  const query = qs.toString();
  return apiFetch<ChildListResponse>(`/children${query ? `?${query}` : ''}`);
}

export async function getChild(id: string): Promise<ChildDetail> {
  return apiFetch<ChildDetail>(`/children/${id}`);
}

export async function reviewChild(id: string): Promise<{ id: string; reviewedAt: string; reviewedBy: string }> {
  return apiFetch(`/children/${id}/review`, { method: 'PATCH' });
}
