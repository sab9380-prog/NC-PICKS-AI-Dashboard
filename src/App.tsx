import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginGate from './components/auth/LoginGate'
import DashboardPage from './pages/DashboardPage'
import SharePage from './pages/SharePage'

function AuthenticatedApp() {
  const { isAuthenticated, login, selectMember } = useAuth()

  if (!isAuthenticated) {
    return <LoginGate onLogin={login} onSelectMember={selectMember} />
  }

  return <DashboardPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/share/:token" element={<SharePage />} />
        <Route path="*" element={<AuthenticatedApp />} />
      </Routes>
    </BrowserRouter>
  )
}
