const API_BASE = '/api';
const TOKEN_KEY = 'madewayhomes_auth_token';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

// ── In-memory token (fast access, survives the session) ───────────────
let authToken: string | null = null;

// Restore from localStorage on module load
try {
  const stored = localStorage.getItem(TOKEN_KEY);
  if (stored) {
    authToken = stored;
  }
} catch (_) {
  // localStorage may be unavailable (SSR, privacy mode, etc.)
}

export function setAuthToken(token: string | null) {
  authToken = token;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (_) {
    // localStorage may be unavailable
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken;
  // Fall back to localStorage — handles page refresh
  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      authToken = stored;
      return stored;
    }
  } catch (_) {
    // localStorage may be unavailable
  }
  return null;
}

export async function apiFetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuth, ...fetchOpts } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOpts.headers as Record<string, string>),
  };

  if (!skipAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOpts,
    headers,
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    const error: any = new Error(data.error || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

// Auth API helpers
export const authApi = {
  register: (body: { email: string; password: string; name: string; role: string; phone?: string }) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body), skipAuth: true }),

  login: (body: { email: string; password: string }) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body), skipAuth: true }),

  logout: () => apiFetch('/auth/logout', { method: 'POST' }),

  me: () => apiFetch('/auth/me'),

  forgotPassword: (email: string) =>
    apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }), skipAuth: true }),

  resetPassword: (token: string, password: string) =>
    apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }), skipAuth: true }),
};

export const userApi = {
  getProfile: () => apiFetch('/users/profile'),
  updateProfile: (body: { name?: string; phone?: string }) =>
    apiFetch('/users/profile', { method: 'PUT', body: JSON.stringify(body) }),
  deleteAccount: () => apiFetch('/users/account', { method: 'DELETE' }),
};
