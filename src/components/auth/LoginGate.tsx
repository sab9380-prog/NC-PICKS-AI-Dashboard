import { useState } from 'react'
import { STORAGE_KEYS, loadFromStorage } from '../../lib/storage'
import type { Member } from '../../types'

type Props = {
  onLogin: (password: string) => Promise<boolean>
  onSelectMember: (member: Member) => void
}

export default function LoginGate({ onLogin, onSelectMember }: Props) {
  const [step, setStep] = useState<'password' | 'member'>('password')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const members: Member[] = loadFromStorage(STORAGE_KEYS.members, [])
  const activeMembers = members.filter(m => m.is_active)

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const ok = await onLogin(password)
    if (ok) {
      setStep('member')
    } else {
      setError('비밀번호가 일치하지 않습니다')
    }
  }

  if (step === 'password') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <form onSubmit={handlePasswordSubmit} className="bg-slate-900 rounded-xl p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold mb-1">Picks AI Pipeline Tracker</h1>
          <p className="text-slate-400 text-sm mb-6">접속 비밀번호를 입력하세요</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 mb-3"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-medium transition-colors">
            확인
          </button>
          <p className="text-slate-600 text-xs mt-4 text-center">기본 비밀번호: picks2026</p>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="bg-slate-900 rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-1">이름을 선택하세요</h1>
        <p className="text-slate-400 text-sm mb-6">수정 내역에 이름이 기록됩니다</p>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {activeMembers.map(m => (
            <button
              key={m.id}
              onClick={() => onSelectMember(m)}
              className="w-full text-left bg-slate-800 hover:bg-slate-700 rounded-lg px-4 py-3 text-white transition-colors"
            >
              {m.name}
            </button>
          ))}
          {activeMembers.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">
              등록된 멤버가 없습니다.<br/>설정에서 추가하거나, 바로 시작하려면 아래 버튼을 누르세요.
            </p>
          )}
        </div>
        <button
          onClick={() => onSelectMember({ id: 'guest', name: '게스트', is_active: true, created_at: new Date().toISOString() })}
          className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg py-2 text-sm transition-colors"
        >
          게스트로 시작
        </button>
      </div>
    </div>
  )
}
