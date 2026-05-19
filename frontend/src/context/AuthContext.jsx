import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined = still loading, null = not authenticated, object = logged in user
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    api.getMe()
      .then(setUser)
      .catch(() => setUser(null))
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
