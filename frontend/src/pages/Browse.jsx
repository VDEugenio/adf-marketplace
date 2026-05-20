import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'

const CATEGORIES = [
  'Coding', 'Research', 'Productivity', 'Customer Support',
  'Data Analysis', 'Creative', 'DevOps', 'Finance', 'Education', 'Other',
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'most_downloaded', label: 'Most Downloaded' },
  { value: 'most_starred', label: 'Most Starred' },
]

const PER_PAGE = 12

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q        = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const sort     = searchParams.get('sort') || 'newest'
  const page     = Math.max(1, parseInt(searchParams.get('page') || '1', 10))

  const [agents, setAgents]   = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const params = { sort, page, per_page: PER_PAGE }
    if (q) params.q = q
    if (category) params.category = category

    const fetch = (q || category) ? api.searchAgents(params) : api.listAgents(params)

    fetch
      .then((data) => {
        if (cancelled) return
        setAgents(data.agents)
        setTotal(data.total)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [q, category, sort, page])

  function setParam(key, value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.delete('page')
      return next
    })
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="mb-10">
        <p className="eyebrow mb-3">Discover</p>
        <h1 className="text-4xl font-black text-text-primary mb-3">
          Browse agents
        </h1>
        <p className="text-text-muted text-lg max-w-xl">
          Find and download portable AI agents built by the community.
        </p>
      </div>

      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim pointer-events-none" />
          <input
            type="search"
            placeholder="Search by name or description…"
            className="search-input pl-9"
            defaultValue={q}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setParam('q', e.target.value.trim())
            }}
            onChange={(e) => {
              if (!e.target.value) setParam('q', '')
            }}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-text-dim text-xs shrink-0">Sort by</span>
          <div className="flex gap-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setParam('sort', opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  sort === opt.value
                    ? 'bg-accent/10 border-accent/40 text-accent'
                    : 'border-border text-text-muted hover:border-text-muted hover:text-text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setParam('category', '')}
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
            !category
              ? 'bg-accent text-base border-accent font-semibold'
              : 'border-border text-text-muted hover:border-text-muted hover:text-text-primary'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setParam('category', category === cat ? '' : cat)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              category === cat
                ? 'bg-accent text-base border-accent font-semibold'
                : 'border-border text-text-muted hover:border-text-muted hover:text-text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && !error && (
        <p className="text-text-dim text-xs mb-5">
          {total === 0
            ? 'No agents found'
            : `${total} agent${total === 1 ? '' : 's'}${q ? ` for "${q}"` : ''}${category ? ` in ${category}` : ''}`}
        </p>
      )}

      {/* Error state */}
      {error && (
        <div className="card border-red-900/40 text-center py-12">
          <p className="text-text-muted text-sm mb-1">Failed to load agents</p>
          <p className="text-text-dim text-xs font-mono">{error}</p>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Agent grid */}
      {!loading && !error && agents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && agents.length === 0 && (
        <div className="text-center py-20">
          <p className="text-text-muted mb-2">No agents found</p>
          <p className="text-text-dim text-sm">
            Try a different search or{' '}
            <button onClick={() => setSearchParams({})} className="text-accent hover:underline">
              clear all filters
            </button>
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setParam('page', String(page - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg border border-border text-text-muted text-sm disabled:opacity-30 hover:border-text-muted transition-colors"
          >
            ← Prev
          </button>
          <span className="text-text-dim text-sm px-2">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setParam('page', String(page + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-border text-text-muted text-sm disabled:opacity-30 hover:border-text-muted transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </main>
  )
}

export function AgentCard({ agent }) {
  const raw     = agent.document_md || ''
  const excerpt = raw.replace(/[#*`[\]_~>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 150)
  const clipped = raw.length > 150

  return (
    <Link
      to={`/agents/${agent.id}`}
      className="card flex flex-col gap-3 no-underline group"
    >
      {/* Name + badge */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-text-primary leading-snug group-hover:text-accent transition-colors line-clamp-2">
          {agent.name}
        </h3>
        <span className="code-pill shrink-0">.adf</span>
      </div>

      {/* Category */}
      {agent.category && (
        <span className="eyebrow">{agent.category}</span>
      )}

      {/* Description excerpt */}
      <p className="text-text-muted text-sm leading-relaxed flex-1 line-clamp-3">
        {excerpt || 'No description provided.'}
        {clipped && excerpt ? '…' : ''}
      </p>

      {/* Tags */}
      {agent.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {agent.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs border border-border rounded-full px-2 py-0.5 text-text-dim"
            >
              {tag}
            </span>
          ))}
          {agent.tags.length > 4 && (
            <span className="text-xs text-text-dim self-center">
              +{agent.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer: author + stats */}
      <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
        <div className="flex items-center gap-2 min-w-0">
          {agent.uploader.avatar_url ? (
            <img
              src={agent.uploader.avatar_url}
              alt={agent.uploader.username}
              className="w-5 h-5 rounded-full border border-border shrink-0"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-surface-hover shrink-0" />
          )}
          <span className="text-text-dim text-xs truncate">
            {agent.uploader.username}
          </span>
        </div>
        <div className="flex items-center gap-3 text-text-dim text-xs shrink-0">
          <span title="Downloads">↓ {agent.download_count.toLocaleString()}</span>
          <span title="Stars">★ {agent.star_count.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  )
}

export function SkeletonCard() {
  return (
    <div className="card flex flex-col gap-3 animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <div className="h-4 w-36 bg-surface-hover rounded" />
        <span className="code-pill opacity-40">.adf</span>
      </div>
      <div className="h-3 w-20 bg-surface-hover rounded" />
      <div className="space-y-2 flex-1">
        <div className="h-3 w-full bg-surface-hover rounded" />
        <div className="h-3 w-5/6 bg-surface-hover rounded" />
        <div className="h-3 w-3/4 bg-surface-hover rounded" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-14 bg-surface-hover rounded-full" />
        <div className="h-5 w-16 bg-surface-hover rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-surface-hover" />
          <div className="h-3 w-16 bg-surface-hover rounded" />
        </div>
        <div className="flex gap-3">
          <div className="h-3 w-12 bg-surface-hover rounded" />
          <div className="h-3 w-10 bg-surface-hover rounded" />
        </div>
      </div>
    </div>
  )
}

function SearchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M14.5 14.5L18 18" strokeLinecap="round" />
    </svg>
  )
}
