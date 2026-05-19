import { useParams } from 'react-router-dom'

export default function UserProfile() {
  const { username } = useParams()

  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <div className="flex items-center gap-5 mb-12">
        <div className="w-20 h-20 rounded-full bg-surface border border-border animate-pulse" />
        <div>
          <h1 className="text-3xl font-black text-text-primary mb-1">@{username}</h1>
          <p className="text-text-muted text-sm">GitHub profile · 0 agents uploaded</p>
        </div>
      </div>

      <p className="eyebrow mb-4">Agents</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card flex flex-col gap-3 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="h-4 w-32 bg-surface-hover rounded" />
              <span className="code-pill opacity-40">.adf</span>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-surface-hover rounded" />
              <div className="h-3 w-2/3 bg-surface-hover rounded" />
            </div>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-border text-text-dim text-xs">
              <span>↓ — downloads</span>
              <span>★ — stars</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
