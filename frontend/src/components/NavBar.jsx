import { useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_ORIGIN } from '../api/client'

export default function NavBar() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inputRef = useRef(null)
  const { user } = useAuth()

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = searchParams.get('q') || ''
    }
  }, [searchParams])

  function handleSearchKey(e) {
    if (e.key === 'Enter') {
      const q = e.target.value.trim()
      if (q) navigate(`/?q=${encodeURIComponent(q)}`)
      else navigate('/')
    }
  }

  return (
    <header className="sticky top-0 z-50 flex justify-center px-4 pt-4 pb-2">
      <nav className="nav-pill flex items-center gap-6 w-full max-w-4xl">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="w-7 h-7 rounded-lg bg-text-primary flex items-center justify-center">
            <span className="text-base font-black leading-none text-base">A</span>
          </span>
          <span className="font-bold text-sm text-text-primary tracking-tight">
            ADF Marketplace
          </span>
        </Link>

        <div className="flex-1 min-w-0">
          <input
            ref={inputRef}
            type="search"
            placeholder="Search agents…"
            className="search-input"
            defaultValue={searchParams.get('q') || ''}
            onKeyDown={handleSearchKey}
          />
        </div>

        <div className="hidden sm:flex items-center gap-1 shrink-0">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive ? 'text-text-primary bg-surface' : 'text-text-muted hover:text-text-primary'
              }`
            }
          >
            Browse
          </NavLink>
          <NavLink
            to="/upload"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive ? 'text-text-primary bg-surface' : 'text-text-muted hover:text-text-primary'
              }`
            }
          >
            Upload
          </NavLink>
        </div>

        {user ? (
          <Link to={`/profile/${user.username}`} className="shrink-0" title={user.username}>
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-8 h-8 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-surface-hover border border-border flex items-center justify-center text-xs text-text-muted font-bold">
                {user.username[0].toUpperCase()}
              </div>
            )}
          </Link>
        ) : user === null ? (
          <a href={`${API_ORIGIN}/api/auth/github`} className="btn-primary shrink-0 !py-1.5 !px-4 text-xs">
            <GitHubIcon />
            Sign in
          </a>
        ) : (
          <div className="w-8 h-8 rounded-full bg-surface-hover border border-border animate-pulse shrink-0" />
        )}
      </nav>
    </header>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
    </svg>
  )
}
