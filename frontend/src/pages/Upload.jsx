export default function Upload() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <p className="eyebrow mb-3">Share</p>
      <h1 className="text-4xl font-black text-text-primary mb-4">
        Upload an agent
      </h1>
      <p className="text-text-muted text-lg mb-12 max-w-lg">
        Drop your <span className="code-pill">.adf</span> file and we'll extract
        the name, description, and tools automatically.
      </p>

      <div className="card flex flex-col gap-6">
        {/* File drop zone */}
        <div className="border-2 border-dashed border-border rounded-xl h-40 flex flex-col items-center justify-center gap-3 text-text-muted hover:border-accent/50 transition-colors cursor-pointer">
          <span className="text-3xl">⬆</span>
          <p className="text-sm">Drop your <span className="font-mono text-accent">.adf</span> file here, or click to browse</p>
          <p className="text-xs text-text-dim">Only valid ADF (SQLite) files accepted</p>
        </div>

        {/* Auto-extracted fields (read-only previews) */}
        <fieldset disabled className="space-y-3 opacity-50">
          <legend className="eyebrow mb-3">Auto-extracted from file</legend>
          {['Agent name', 'Description (document.md)', 'Tools list'].map((f) => (
            <div key={f}>
              <label className="block text-xs text-text-muted mb-1">{f}</label>
              <div className="bg-surface border border-border rounded-lg px-3 py-2 text-text-dim text-sm h-9" />
            </div>
          ))}
        </fieldset>

        {/* User-provided fields */}
        <fieldset className="space-y-3">
          <legend className="eyebrow mb-3">You fill in</legend>
          {['Tags (comma-separated)', 'Compatible LLMs'].map((f) => (
            <div key={f}>
              <label className="block text-xs text-text-muted mb-1">{f}</label>
              <div className="bg-surface border border-border rounded-lg px-3 py-2 text-text-dim text-sm h-9" />
            </div>
          ))}
          <div>
            <label className="block text-xs text-text-muted mb-1">Category</label>
            <div className="bg-surface border border-border rounded-lg px-3 py-2 text-text-dim text-sm h-9 flex items-center justify-between">
              <span>Select a category…</span>
              <span>▾</span>
            </div>
          </div>
        </fieldset>

        <button className="btn-primary w-full justify-center" onClick={() => alert('Upload — coming in Session 7')}>
          Upload agent
        </button>
      </div>

      <PlaceholderBadge label="/upload" />
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
