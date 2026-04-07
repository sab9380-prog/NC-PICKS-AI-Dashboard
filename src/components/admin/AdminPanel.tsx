import { useState } from 'react'
import { useMembers } from '../../hooks/useMembers'
import { useSnapshots } from '../../hooks/useSnapshots'
import { useSystems } from '../../hooks/useSystems'
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '../../lib/storage'
import type { ShareToken } from '../../types'

type Props = {
  onClose: () => void
}

export default function AdminPanel({ onClose }: Props) {
  const { members, addMember, updateMember } = useMembers()
  const { takeSnapshot } = useSnapshots()
  const { states, resetAll } = useSystems()

  // Member management
  const [newMemberName, setNewMemberName] = useState('')

  // Password management
  const [newPassword, setNewPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')

  // Share token management
  const [tokens, setTokens] = useState<ShareToken[]>(() =>
    loadFromStorage(STORAGE_KEYS.tokens, [])
  )
  const [copyMsg, setCopyMsg] = useState<string | null>(null)

  function handleAddMember() {
    const name = newMemberName.trim()
    if (!name) return
    addMember(name)
    setNewMemberName('')
  }

  function handleChangePassword() {
    const pw = newPassword.trim()
    if (!pw) return
    saveToStorage(STORAGE_KEYS.password, pw)
    setNewPassword('')
    setPasswordMsg('비밀번호가 변경되었습니다.')
    setTimeout(() => setPasswordMsg(''), 2500)
  }

  function handleCreateToken() {
    const newToken: ShareToken = {
      token: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      created_by: null,
      is_active: true,
    }
    const next = [...tokens, newToken]
    setTokens(next)
    saveToStorage(STORAGE_KEYS.tokens, next)
  }

  function handleToggleToken(token: string) {
    const next = tokens.map(t =>
      t.token === token ? { ...t, is_active: !t.is_active } : t
    )
    setTokens(next)
    saveToStorage(STORAGE_KEYS.tokens, next)
  }

  function handleCopyLink(token: string) {
    const url = `${window.location.origin}/share/${token}`
    navigator.clipboard.writeText(url).then(() => {
      setCopyMsg(token)
      setTimeout(() => setCopyMsg(null), 2000)
    })
  }

  function handleSnapshot() {
    takeSnapshot(states)
    alert('스냅샷이 저장되었습니다.')
  }

  function handleResetAll() {
    if (window.confirm('모든 시스템 상태를 초기값으로 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      resetAll()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-slate-900 rounded-xl border border-slate-700 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-5 py-4 flex items-center justify-between rounded-t-xl z-10">
          <h2 className="text-base font-bold text-white">관리자 설정</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="닫기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-6">
          {/* ── PM 멤버 관리 ── */}
          <section>
            <h3 className="text-sm font-semibold text-slate-200 mb-3">PM 멤버 관리</h3>
            <div className="space-y-2">
              {members.length === 0 && (
                <p className="text-xs text-slate-500">등록된 멤버가 없습니다.</p>
              )}
              {members.map(m => (
                <div
                  key={m.id}
                  className="flex items-center justify-between bg-slate-800 rounded px-3 py-2"
                >
                  <div>
                    <span className="text-sm text-white font-medium">{m.name}</span>
                    <span className={`ml-2 text-xs ${m.is_active ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {m.is_active ? '활성' : '비활성'}
                    </span>
                  </div>
                  <button
                    onClick={() => updateMember(m.id, { is_active: !m.is_active })}
                    className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                      m.is_active
                        ? 'border-slate-600 text-slate-400 hover:bg-slate-700'
                        : 'border-emerald-800 text-emerald-500 hover:bg-emerald-900/30'
                    }`}
                  >
                    {m.is_active ? '비활성화' : '활성화'}
                  </button>
                </div>
              ))}

              {/* Add new member */}
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddMember()}
                  placeholder="새 멤버 이름"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
                />
                <button
                  onClick={handleAddMember}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
                >
                  추가
                </button>
              </div>
            </div>
          </section>

          <hr className="border-slate-700" />

          {/* ── 비밀번호 변경 ── */}
          <section>
            <h3 className="text-sm font-semibold text-slate-200 mb-3">비밀번호 변경</h3>
            <div className="flex gap-2">
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
                placeholder="새 비밀번호"
                className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
              />
              <button
                onClick={handleChangePassword}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
              >
                변경
              </button>
            </div>
            {passwordMsg && (
              <p className="mt-2 text-xs text-emerald-400">{passwordMsg}</p>
            )}
          </section>

          <hr className="border-slate-700" />

          {/* ── 공유 링크 관리 ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-200">공유 링크 관리</h3>
              <button
                onClick={handleCreateToken}
                className="text-xs px-3 py-1.5 bg-blue-900/50 hover:bg-blue-900/80 text-blue-300 border border-blue-800 rounded transition-colors"
              >
                + 새 링크 생성
              </button>
            </div>
            {tokens.length === 0 ? (
              <p className="text-xs text-slate-500">생성된 공유 링크가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {tokens.map(t => (
                  <div
                    key={t.token}
                    className="bg-slate-800 rounded px-3 py-2 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-mono truncate flex-1 ${t.is_active ? 'text-slate-300' : 'text-slate-600 line-through'}`}>
                        {t.token.slice(0, 18)}…
                      </span>
                      <span className={`text-xs shrink-0 ${t.is_active ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {t.is_active ? '활성' : '비활성'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      {new Date(t.created_at).toLocaleDateString('ko-KR')}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyLink(t.token)}
                        className="text-xs px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                      >
                        {copyMsg === t.token ? '복사됨!' : '링크 복사'}
                      </button>
                      <button
                        onClick={() => handleToggleToken(t.token)}
                        className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                          t.is_active
                            ? 'border-slate-600 text-slate-400 hover:bg-slate-700'
                            : 'border-emerald-800 text-emerald-500 hover:bg-emerald-900/30'
                        }`}
                      >
                        {t.is_active ? '비활성화' : '활성화'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <hr className="border-slate-700" />

          {/* ── 주간 스냅샷 ── */}
          <section>
            <h3 className="text-sm font-semibold text-slate-200 mb-2">주간 스냅샷</h3>
            <p className="text-xs text-slate-500 mb-3">
              현재 모든 시스템의 점수를 기록합니다. 주간 진척 변화를 추적하는 데 사용됩니다.
            </p>
            <button
              onClick={handleSnapshot}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded transition-colors border border-slate-700"
            >
              현재 점수 스냅샷 저장
            </button>
          </section>

          <hr className="border-slate-700" />

          {/* ── 데이터 초기화 (Danger Zone) ── */}
          <section>
            <h3 className="text-sm font-semibold text-red-400 mb-2">데이터 초기화</h3>
            <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 space-y-2">
              <p className="text-xs text-red-400/80">
                모든 시스템 상태가 초기값으로 돌아갑니다. 이 작업은 되돌릴 수 없습니다.
              </p>
              <button
                onClick={handleResetAll}
                className="w-full py-2 bg-red-900/40 hover:bg-red-900/70 text-red-400 text-sm rounded transition-colors border border-red-800/50"
              >
                전체 초기화
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
