import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import { AgentCard, SkeletonCard } from './Browse'

export default function UserProfile() {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)   // { message, status }

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.getUserProfile(username)
      .then((data) => {
        setProfile(data)
        setLoading(false)
      })
      .catch((err) => {
        setError({ message: err.message, status: err.status })
        setLoading(false)
      })
  }, [username])

  if (loading) return <ProfileSkeleton username={username} />

  if (error) {
    const is404 = error.status === 404
    return (
      <main className="max-w-4xl mx-auto px-4 py-32 text-center">
        <p className="text-7xl font-black text-surface-hover mb-6">{is404 ? '404' : '!'}</p>
        <p className="text-text-muted mb-2">{is404 ? 'User not found' : 'Failed to load profile'}</p>
        {!is404 && <p className="text-text-dim text-xs font-mono mb-4">{error.message}</p>}
        <Link to="/" className="mt-4 inline-block text-accent text-sm hover:underline">
          ← Back to browse
        </Link>
      </main>
    )
  }

  const agentCount = profile.agents.length
  const displayName = profile.display_name || profile.username

  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="flex items-center gap-5 mb-12">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="w-20 h-20 rounded-full border border-border object-cover shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center text-2xl font-black text-text-muted shrink-0">
            {profile.username[0].toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-black text-text-primary mb-1">{displayName}</h1>
          <p className="text-text-dim text-sm">@{profile.username}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
            <span>{agentCount} {agentCount === 1 ? 'agent' : 'agents'}</span>
            <span>·</span>
            <span>{profile.total_downloads.toLocaleString()} total downloads</span>
          </div>
        </div>
      </div>

      {/* Agents */}
      <p className="eyebrow mb-4">Agents</p>
      {agentCount === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-muted mb-2">No agents yet</p>
          <p className="text-text-dim text-sm">
            {profile.username} hasn't uploaded any agents.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profile.agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </main>
  )
}

function ProfileSkeleton({ username }) {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <div className="flex items-center gap-5 mb-12 animate-pulse">
        <div className="w-20 h-20 rounded-full bg-surface border border-border shrink-0" />
        <div>
          <div className="h-7 w-40 bg-surface-hover rounded mb-2" />
          <div className="h-4 w-24 bg-surface-hover rounded mb-3" />
          <div className="h-4 w-48 bg-surface-hover rounded" />
        </div>
      </div>
      <div className="h-3 w-12 bg-surface-hover rounded mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </main>
  )
}
