import { createContext, useContext, useEffect, useState } from 'react'
import { api, setToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined = still loading, null = not authenticated, object = logged in user
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    // Grab token from URL after OAuth redirect, store it, clean the URL
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')
    if (urlToken) {
      setToken(urlToken)
      window.history.replaceState({}, '', window.location.pathname)
    }

    api.getMe()
      .then(setUser)
      .catch(() => setUser(null))
  }, [])

  function logout() {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
