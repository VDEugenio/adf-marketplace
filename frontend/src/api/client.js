// VITE_API_URL: full backend origin, no trailing slash (e.g. https://adf-marketplace.onrender.com)
// Leave unset in dev — the Vite proxy forwards /api/* to localhost:8000
export const API_ORIGIN = import.meta.env.VITE_API_URL ?? ''

const BASE = API_ORIGIN + '/api'

async function get(path, params = {}) {
  const url = new URL(BASE + path, window.location.origin)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v))
    }
  })
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.detail || `API error ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

async function post(path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    credentials: 'include',
    headers: body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    body: body instanceof FormData ? body : JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const err = new Error(data.detail || `API error ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

export const api = {
  listAgents: (params) => get('/agents', params),
  searchAgents: (params) => get('/agents/search', params),
  getAgent: (id) => get(`/agents/${id}`),
  uploadAgent: (formData) => post('/agents', formData),
  toggleStar: (id) => post(`/agents/${id}/star`),
  getMe: () => get('/auth/me'),
  getUserProfile: (username) => get(`/users/${username}`),
}
