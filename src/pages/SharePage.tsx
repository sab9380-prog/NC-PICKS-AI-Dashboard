import { useParams } from 'react-router-dom'
import { useSystems } from '../hooks/useSystems'
import { useMembers } from '../hooks/useMembers'
import { useSnapshots } from '../hooks/useSnapshots'
import { STORAGE_KEYS, loadFromStorage } from '../lib/storage'
import AppShell from '../components/layout/AppShell'
import Header from '../components/layout/Header'
import AlertPanel from '../components/schedule/AlertPanel'
import RagTable from '../components/schedule/RagTable'
import type { ShareToken } from '../types'

const NOW = '2026-04'

function InvalidToken() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center space-y-3 px-6">
        <div className="text-4xl">🔒</div>
        <h1 className="text-xl font-bold">유효하지 않은 공유 링크</h1>
        <p className="text-slate-400 text-sm">
          이 링크는 존재하지 않거나 비활성화되었습니다.
        </p>
      </div>
    </div>
  )
}

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const { states } = useSystems()
  const { activeMembers } = useMembers()
  const { latestSnapshots } = useSnapshots()

  // Validate token
  const tokens = loadFromStorage<ShareToken[]>(STORAGE_KEYS.tokens, [])
  const matchedToken = tokens.find(t => t.token === token && t.is_active)

  if (!matchedToken) {
    return <InvalidToken />
  }

  const scheduleTab = (
    <div className="space-y-0">
      <AlertPanel states={states} members={activeMembers} now={NOW} />
      <RagTable states={states} members={activeMembers} snapshots={latestSnapshots} now={NOW} />
    </div>
  )

  return (
    <AppShell
      readOnly={true}
      onSettingsClick={() => {}}
      header={<Header states={states} snapshots={latestSnapshots} />}
      statusTab={scheduleTab}
      scheduleTab={scheduleTab}
      timelineTab={scheduleTab}
    />
  )
}
