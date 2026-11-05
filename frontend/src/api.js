const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
export async function api(path, options = {}) {
  const token = sessionStorage.getItem('hospital_token');
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}
