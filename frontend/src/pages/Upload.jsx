import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

const CATEGORIES = [
  'Coding',
  'Research',
  'Productivity',
  'Customer Support',
  'Data Analysis',
  'Creative',
  'DevOps',
  'Finance',
  'Education',
  'Other',
]

const LLM_OPTIONS = [
  'GPT-4o',
  'GPT-4',
  'Claude Opus',
  'Claude Sonnet',
  'Gemini Pro',
  'Llama 3',
  'Mistral',
  'Other',
]

export default function Upload() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const [tags, setTags] = useState('')
  const [selectedLLMs, setSelectedLLMs] = useState([])
  const [category, setCategory] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user === null) navigate('/')
  }, [user, navigate])

  if (user === undefined || user === null) return null

  function validateAndSetFile(f) {
    setFileError('')
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.adf')) {
      setFileError('Only .adf files are accepted.')
      setFile(null)
      return
    }
    setFile(f)
  }

  function handleFileInputChange(e) {
    validateAndSetFile(e.target.files[0] ?? null)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    validateAndSetFile(e.dataTransfer.files[0] ?? null)
  }

  function handleDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function toggleLLM(llm) {
    setSelectedLLMs(prev =>
      prev.includes(llm) ? prev.filter(l => l !== llm) : [...prev, llm]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!file) { setError('Please select an .adf file to upload.'); return }
    if (!category) { setError('Please select a category.'); return }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('tags', tags)
    formData.append('compatible_llms', selectedLLMs.join(','))
    formData.append('category', category)

    setLoading(true)
    try {
      const agent = await api.uploadAgent(formData)
      navigate(`/agents/${agent.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <p className="eyebrow mb-3">Share</p>
      <h1 className="text-4xl font-black text-text-primary mb-4">Upload an agent</h1>
      <p className="text-text-muted text-lg mb-12 max-w-lg">
        Drop your <span className="code-pill">.adf</span> file and we'll extract
        the name, description, and tools automatically.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="card flex flex-col gap-8">

          {/* File drop zone */}
          <div>
            <label
              htmlFor="file-upload"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={() => setIsDragging(false)}
              className={`border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors select-none
                ${isDragging
                  ? 'border-accent bg-accent/5 text-accent'
                  : file
                    ? 'border-accent/50 bg-accent/5 text-text-primary'
                    : 'border-border text-text-muted hover:border-accent/40 hover:bg-surface-hover'
                }`}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileInputChange}
              />
              {file ? (
                <>
                  <span className="text-2xl text-accent">✓</span>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-text-muted">{(file.size / 1024).toFixed(1)} KB — click to replace</p>
                </>
              ) : (
                <>
                  <UploadIcon />
                  <p className="text-sm">
                    Drop your <span className="font-mono text-accent">.adf</span> file here, or click to browse
                  </p>
                  <p className="text-xs text-text-dim">Only valid ADF (SQLite) files accepted</p>
                </>
              )}
            </label>
            {fileError && <p className="mt-2 text-xs text-red-400">{fileError}</p>}
          </div>

          {/* Info */}
          <div className="flex items-start gap-3 bg-surface-hover border border-border rounded-xl px-4 py-3">
            <span className="text-accent mt-0.5 shrink-0"><InfoIcon /></span>
            <p className="text-xs text-text-muted leading-relaxed">
              Agent name, description, and tools list are extracted automatically from your file.
            </p>
          </div>

          {/* User-provided fields */}
          <fieldset className="space-y-5">
            <legend className="eyebrow mb-1">Fill in</legend>

            <div>
              <label htmlFor="tags" className="block text-xs text-text-muted mb-1.5">
                Tags <span className="text-text-dim">(comma-separated)</span>
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="e.g. writing, automation, research"
                className="search-input !rounded-lg"
              />
            </div>

            <div>
              <p className="text-xs text-text-muted mb-2">Compatible LLMs</p>
              <div className="flex flex-wrap gap-2">
                {LLM_OPTIONS.map(llm => {
                  const active = selectedLLMs.includes(llm)
                  return (
                    <button
                      key={llm}
                      type="button"
                      onClick={() => toggleLLM(llm)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                        ${active
                          ? 'bg-accent/15 border-accent/50 text-accent'
                          : 'bg-transparent border-border text-text-muted hover:border-text-muted hover:text-text-primary'
                        }`}
                    >
                      {llm}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-xs text-text-muted mb-1.5">
                Category <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  required
                  className="w-full appearance-none bg-surface border border-border rounded-lg px-3 py-2.5 text-sm
                    text-text-primary outline-none transition-colors cursor-pointer
                    focus:border-accent/50 focus:shadow-[0_0_0_3px_#3ecf8e10]
                    [&>option]:bg-surface [&>option]:text-text-primary"
                >
                  <option value="" disabled>Select a category…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">▾</span>
              </div>
            </div>
          </fieldset>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <span className="text-red-400 shrink-0 mt-0.5"><ErrorIcon /></span>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <><Spinner /> Uploading…</> : <><UploadIcon small /> Upload agent</>}
          </button>
        </div>
      </form>
    </main>
  )
}

function UploadIcon({ small }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={small ? 'w-4 h-4' : 'w-6 h-6'} aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
