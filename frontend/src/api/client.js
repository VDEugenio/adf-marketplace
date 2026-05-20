// VITE_API_URL: full backend origin, no trailing slash (e.g. https://adf-marketplace.onrender.com)
// Leave unset in dev — the Vite proxy forwards /api/* to localhost:8000
export const API_ORIGIN = import.meta.env.VITE_API_URL ?? ''

const BASE = API_ORIGIN + '/api'
const TOKEN_KEY = 'auth_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

function authHeaders(extra = {}) {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}`, ...extra } : extra
}

async function get(path, params = {}) {
  const url = new URL(BASE + path, window.location.origin)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v))
    }
  })
  const res = await fetch(url, { headers: authHeaders() })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.detail || `API error ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

async function post(path, body) {
  const isFormData = body instanceof FormData
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: authHeaders(isFormData ? {} : { 'Content-Type': 'application/json' }),
    body: isFormData ? body : JSON.stringify(body),
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
