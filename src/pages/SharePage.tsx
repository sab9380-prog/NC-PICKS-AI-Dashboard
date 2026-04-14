import { useParams } from 'react-router-dom'
import { useSystems } from '../hooks/useSystems'
import { useSnapshots } from '../hooks/useSnapshots'
import { STORAGE_KEYS, loadFromStorage } from '../lib/storage'
import AppShell from '../components/layout/AppShell'
import Header from '../components/layout/Header'
import type { ShareToken } from '../types'

function InvalidToken() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center space-y-3 px-6">
        <div className="text-4xl">ð</div>
        <h1 className="text-xl font-bold">ì í¨íì§ ìì ê³µì  ë§í¬</h1>
        <p className="text-slate-400 text-sm">
          ì´ ë§í¬ë ì¡´ì¬íì§ ìê±°ë ë¹íì±íëììµëë¤.
        </p>
      </div>
    </div>
  )
}

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const { states } = useSystems()
  const { latestSnapshots } = useSnapshots()

  // Validate token
  const tokens = loadFromStorage<ShareToken[]>(STORAGE_KEYS.tokens, [])
  const matchedToken = tokens.find(t => t.token === token && t.is_active)

  if (!matchedToken) {
    return <InvalidToken />
  }

  const placeholder = (
    <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
      ê³µì  íì´ì§ (ì½ê¸° ì ì©)
    </div>
  )

  return (
    <AppShell
      readOnly={true}
      onSettingsClick={() => {}}
      header={<Header states={states} snapshots={latestSnapshots} />}
      statusTab={placeholder}
      weeklyTab={placeholder}
      timelineTab={placeholder}
    />
  )
}
