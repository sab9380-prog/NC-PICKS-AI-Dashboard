import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginGate from './components/auth/LoginGate'
import DashboardPage from './pages/DashboardPage'

function AuthenticatedApp() {
  const { isAuthenticated, login, selectMember } = useAuth()

  if (!isAuthenticated) {
    return <LoginGate onLogin={login} onSelectMember={selectMember} />
  }

  return <DashboardPage />
}

function SharePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">공유 링크</h1>
        <p className="text-slate-400 text-sm">읽기전용 공유 기능 — 준비중</p>
      </div>
    </div>
  )
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
