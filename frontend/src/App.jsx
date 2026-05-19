import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import NavBar from './components/NavBar'
import Browse from './pages/Browse'
import AgentDetail from './pages/AgentDetail'
import Upload from './pages/Upload'
import UserProfile from './pages/UserProfile'

function NotFound() {
  return (
    <main className="max-w-xl mx-auto px-4 py-32 text-center">
      <p className="text-7xl font-black text-surface-hover mb-6">404</p>
      <p className="text-text-muted">Page not found.</p>
    </main>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-1">
          <Routes>
            <Route path="/"                   element={<Browse />} />
            <Route path="/agents/:id"         element={<AgentDetail />} />
            <Route path="/upload"             element={<Upload />} />
            <Route path="/profile/:username"  element={<UserProfile />} />
            <Route path="*"                   element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  )
}
