import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api, API_ORIGIN } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function AgentDetail() {
  const { id } = useParams()
  const { user } = useAuth()

  const [agent, setAgent]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)   // { message, status }
  const [starred, setStarred]     = useState(false)
  const [starCount, setStarCount] = useState(0)
  const [starring, setStarring]   = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.getAgent(id)
      .then((data) => {
        setAgent(data)
        setStarred(data.user_has_starred)
        setStarCount(data.star_count)
        setLoading(false)
      })
      .catch((err) => {
        setError({ message: err.message, status: err.status })
        setLoading(false)
      })
  }, [id])

  function handleDownload() {
    const link = document.createElement('a')
    link.href = `${API_ORIGIN}/api/agents/${id}/download`
    link.click()
  }

  async function handleStar() {
    if (user === undefined) return // still loading auth
    if (!user) {
      setShowLoginPrompt(true)
      return
    }
    setStarring(true)
    try {
      const res = await api.toggleStar(id)
      setStarred(res.starred)
      setStarCount(res.star_count)
    } catch {
      // silently ignore — network errors etc.
    } finally {
      setStarring(false)
    }
  }

  if (loading) return <DetailSkeleton />

  if (error) {
    const is404 = error.status === 404
    return (
      <main className="max-w-4xl mx-auto px-4 py-32 text-center">
        <p className="text-7xl font-black text-surface-hover mb-6">{is404 ? '404' : '!'}</p>
        <p className="text-text-muted mb-2">{is404 ? 'Agent not found' : 'Failed to load agent'}</p>
        {!is404 && <p className="text-text-dim text-xs font-mono mb-4">{error.message}</p>}
        <Link to="/" className="mt-4 inline-block text-accent text-sm hover:underline">
          ← Back to browse
        </Link>
      </main>
    )
  }

  const uploadedDate = new Date(agent.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <Link to="/" className="text-text-dim text-xs hover:text-text-muted transition-colors mb-8 inline-flex items-center gap-1">
        ← Browse agents
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mt-4 mb-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {agent.category && (
              <span className="eyebrow">{agent.category}</span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-black text-text-primary leading-tight">
              {agent.name}
            </h1>
            <span className="code-pill">.adf</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleStar}
            disabled={starring || user === undefined}
            className={`btn-secondary !gap-2 !px-4 !py-2 transition-all ${
              starred ? 'border-accent/50 text-accent' : ''
            } disabled:opacity-50`}
          >
            <span>{starred ? '★' : '☆'}</span>
            <span>{starCount.toLocaleString()}</span>
          </button>
          <button onClick={handleDownload} className="btn-primary !gap-2 !px-4 !py-2">
            <DownloadIcon />
            Download
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatCard label="Downloads" value={agent.download_count.toLocaleString()} />
        <StatCard label="Stars" value={starCount.toLocaleString()} />
        <StatCard label="Uploaded" value={uploadedDate} small />
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* document_md */}
        <div className="lg:col-span-2 card min-h-48">
          <p className="eyebrow mb-5">document.md</p>
          {agent.document_md ? (
            <div className="prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {agent.document_md}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-text-dim text-sm italic">No description provided.</p>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Author */}
          <div className="card">
            <p className="eyebrow mb-3">Author</p>
            <Link
              to={`/profile/${agent.uploader.username}`}
              className="flex items-center gap-3 group"
            >
              {agent.uploader.avatar_url ? (
                <img
                  src={agent.uploader.avatar_url}
                  alt={agent.uploader.username}
                  className="w-9 h-9 rounded-full border border-border shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-surface-hover border border-border flex items-center justify-center text-sm font-bold text-text-muted shrink-0">
                  {agent.uploader.username[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-text-primary text-sm font-medium group-hover:text-accent transition-colors truncate">
                  {agent.uploader.display_name || agent.uploader.username}
                </p>
                <p className="text-text-dim text-xs truncate">@{agent.uploader.username}</p>
              </div>
            </Link>
          </div>

          {/* Tags */}
          {agent.tags.length > 0 && (
            <div className="card">
              <p className="eyebrow mb-3">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {agent.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/?category=&q=${encodeURIComponent(tag)}`}
                    className="text-xs border border-border rounded-full px-2.5 py-1 text-text-dim hover:border-text-muted hover:text-text-muted transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tools */}
          {agent.tools.length > 0 && (
            <div className="card">
              <p className="eyebrow mb-3">Tools</p>
              <div className="flex flex-wrap gap-1.5">
                {agent.tools.map((tool) => (
                  <span key={tool} className="code-pill">{tool}</span>
                ))}
              </div>
            </div>
          )}

          {/* Compatible LLMs */}
          {agent.compatible_llms.length > 0 && (
            <div className="card">
              <p className="eyebrow mb-3">Compatible LLMs</p>
              <div className="flex flex-wrap gap-1.5">
                {agent.compatible_llms.map((llm) => (
                  <span
                    key={llm}
                    className="px-2.5 py-1 text-xs rounded-full border border-border text-text-muted"
                  >
                    {llm}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Login prompt modal */}
      {showLoginPrompt && (
        <LoginPrompt onClose={() => setShowLoginPrompt(false)} />
      )}
    </main>
  )
}

function StatCard({ label, value, small }) {
  return (
    <div className="card text-center py-4">
      <p className={`font-bold text-text-primary ${small ? 'text-lg' : 'text-2xl'}`}>{value}</p>
      <p className="text-text-muted text-xs mt-1">{label}</p>
    </div>
  )
}

function LoginPrompt({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-base/80"
      style={{ backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="card max-w-sm w-full mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-accent text-lg">★</span>
        </div>
        <h3 className="text-text-primary font-bold mb-2">Sign in to star</h3>
        <p className="text-text-muted text-sm mb-6">
          Star agents to bookmark them for later. Sign in with GitHub to continue.
        </p>
        <div className="flex flex-col gap-2">
          <a href={`${API_ORIGIN}/api/auth/github`} className="btn-primary justify-center">
            <GitHubIcon />
            Sign in with GitHub
          </a>
          <button onClick={onClose} className="btn-secondary justify-center">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-3 w-24 bg-surface-hover rounded mb-8" />
      <div className="h-8 w-64 bg-surface-hover rounded mb-6" />
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card py-4">
            <div className="h-6 w-12 bg-surface-hover rounded mx-auto mb-2" />
            <div className="h-3 w-16 bg-surface-hover rounded mx-auto" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card min-h-64 space-y-3">
          {[90, 75, 60, 85, 50].map((w, i) => (
            <div key={i} className="h-3 bg-surface-hover rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="space-y-4">
          <div className="card h-20" />
          <div className="card h-16" />
        </div>
      </div>
    </main>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M10 2a.75.75 0 0 1 .75.75v8.69l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.22 2.22V2.75A.75.75 0 0 1 10 2zM5.273 14.5h9.454c.552 0 .998.447.998 1v.25a.75.75 0 0 1-.75.75H4.25a.75.75 0 0 1-.75-.75V15.5c0-.553.447-1 .773-1z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
    </svg>
  )
}
