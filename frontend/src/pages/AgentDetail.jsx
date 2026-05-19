import { useParams } from 'react-router-dom'

export default function AgentDetail() {
  const { id } = useParams()

  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex-1">
          <p className="eyebrow mb-2">Agent</p>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-black text-text-primary">
              agent-name-here
            </h1>
            <span className="code-pill">.adf</span>
          </div>
          <p className="text-text-muted">
            Agent description extracted from <span className="font-mono text-xs text-accent">document.md</span> will appear here.
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button className="btn-primary">↓ Download</button>
          <button className="btn-secondary">★ Star</button>
        </div>
      </div>

      {/* Meta cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Downloads', value: '—' },
          { label: 'Stars', value: '—' },
          { label: 'Uploaded', value: '—' },
        ].map(({ label, value }) => (
          <div key={label} className="card text-center">
            <p className="text-2xl font-bold text-text-primary">{value}</p>
            <p className="text-text-muted text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readme area */}
        <div className="lg:col-span-2 card min-h-64">
          <p className="eyebrow mb-4">document.md</p>
          <div className="space-y-3">
            {[60, 90, 75, 50].map((w, i) => (
              <div key={i} className="h-3 bg-surface-hover rounded animate-pulse" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="card">
            <p className="eyebrow mb-3">Tools</p>
            <div className="flex flex-wrap gap-2">
              {['web_search', 'code_exec', 'file_read'].map((t) => (
                <span key={t} className="code-pill">{t}</span>
              ))}
            </div>
          </div>
          <div className="card">
            <p className="eyebrow mb-3">Compatible LLMs</p>
            <div className="flex flex-wrap gap-2">
              {['GPT-4', 'Claude', 'Gemini'].map((m) => (
                <span key={m} className="px-2.5 py-1 text-xs rounded-full border border-border text-text-muted">{m}</span>
              ))}
            </div>
          </div>
          <div className="card">
            <p className="eyebrow mb-2">Author</p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-surface-hover animate-pulse" />
              <span className="text-text-muted text-sm">@username</span>
            </div>
          </div>
        </div>
      </div>

      <PlaceholderBadge label={`/agents/${id}`} />
    </main>
  )
}

function PlaceholderBadge({ label }) {
  return (
    <div className="mt-12 flex justify-center">
      <div className="inline-flex items-center gap-2 border border-dashed border-border rounded-xl px-5 py-3 text-text-dim text-sm">
        <span className="w-2 h-2 rounded-full bg-accent/40 animate-pulse" />
        Placeholder — route
        <span className="font-mono text-accent">{label}</span>
      </div>
    </div>
  )
}
