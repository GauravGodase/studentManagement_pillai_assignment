// Thin API client wrapping fetch. Base URL comes from VITE_API_URL; when
// empty, relative URLs are used and the Vite dev proxy forwards them.
const BASE = import.meta.env.VITE_API_URL || '';

// Builds an absolute URL for a stored photo path returned by the API.
export const photoUrl = (path) => (path ? `${BASE}${path}` : null);

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, options);

  let body = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text };
    }
  }

  if (!res.ok) {
    const error = new Error(body?.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.fieldErrors = body?.errors || [];
    throw error;
  }
  return body;
}

export const api = {
  // students
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    ).toString();
    return request(`/students${qs ? `?${qs}` : ''}`);
  },
  get: (id) => request(`/students/${id}`),
  create: (formData) => request('/students', { method: 'POST', body: formData }),
  update: (id, formData) => request(`/students/${id}`, { method: 'PUT', body: formData }),
  remove: (id) => request(`/students/${id}`, { method: 'DELETE' }),

  // analytics
  analytics: () => request('/analytics'),
};
