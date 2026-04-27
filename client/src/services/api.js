const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const TOKEN_STORAGE_KEY = 'cv-builder-token';

let authToken = null;

export function setAuthToken(token) {
  authToken = token || null;
}

async function request(path, options = {}) {
  const hasBody = options.body !== undefined;
  const headers = {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  register(payload) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  login(payload) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  me() {
    return request('/auth/me');
  },
  deleteAccount() {
    return request('/auth/account', { method: 'DELETE' });
  },
};

export const cvApi = {
  get() {
    return request('/cv');
  },
  save(payload) {
    return request('/cv', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};

export const cvsApi = {
  list() {
    return request('/cvs');
  },
  create(name) {
    return request('/cvs', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },
  save(id, data) {
    return request(`/cvs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  rename(id, name) {
    return request(`/cvs/${id}/name`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  },
  remove(id) {
    return request(`/cvs/${id}`, { method: 'DELETE' });
  },
};

