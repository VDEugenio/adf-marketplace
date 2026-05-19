export default function Browse() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-16">
      <p className="eyebrow mb-3">Discover</p>
      <h1 className="text-4xl font-black text-text-primary mb-4">
        Browse agents
      </h1>
      <p className="text-text-muted text-lg mb-12 max-w-xl">
        Find and download portable AI agents built by the community.
      </p>

      {/* Filter bar placeholder */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['All', 'Coding', 'Research', 'Productivity', 'Data Analysis', 'DevOps'].map((cat) => (
          <button
            key={cat}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              cat === 'All'
                ? 'bg-accent text-base border-accent font-semibold'
                : 'border-border text-text-muted hover:border-text-muted hover:text-text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Agent card grid placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="h-4 w-32 bg-surface-hover rounded animate-pulse" />
              <span className="code-pill">.adf</span>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-surface-hover rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-surface-hover rounded animate-pulse" />
            </div>
            <div className="flex gap-2 mt-1">
              <div className="h-5 w-16 bg-surface-hover rounded-full animate-pulse" />
              <div className="h-5 w-16 bg-surface-hover rounded-full animate-pulse" />
            </div>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-border text-text-dim text-xs">
              <span>↓ — downloads</span>
              <span>★ — stars</span>
            </div>
          </div>
        ))}
      </div>

      <PlaceholderBadge label="/ — Browse & Search" />
    </main>
  )
}

function PlaceholderBadge({ label }) {
  return (
    <div className="mt-16 flex justify-center">
      <div className="inline-flex items-center gap-2 border border-dashed border-border rounded-xl px-5 py-3 text-text-dim text-sm">
        <span className="w-2 h-2 rounded-full bg-accent/40 animate-pulse" />
        Placeholder — route
        <span className="font-mono text-accent">{label}</span>
      </div>
    </div>
  )
}
