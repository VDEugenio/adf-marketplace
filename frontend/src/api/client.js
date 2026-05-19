const BASE = '/api'

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
    throw new Error(body.detail || `API error ${res.status}`)
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
    throw new Error(data.detail || `API error ${res.status}`)
  }
  return res.json()
}

export const api = {
  listAgents: (params) => get('/agents', params),
  searchAgents: (params) => get('/agents/search', params),
  getAgent: (id) => get(`/agents/${id}`),
  toggleStar: (id) => post(`/agents/${id}/star`),
  getMe: () => get('/auth/me'),
}
