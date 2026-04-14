import { useMemo } from 'react'
import { SYSTEM_MAP } from '../../data/systems'
import { STAGES } from '../../data/stages'
import { ZONES } from '../../data/zones'
import { getStageFromScore } from '../../lib/score'
import { getISOWeek, weekToKorean } from '../../hooks/useWeeklyData'
import type { ScoreSnapshot, SystemState, Member } from '../../types'

const C = {
  card: '#0e0e22',
  border: '#1a1a35',
  text: '#e0e0f0',
  muted: '#8a8aa5',
  dim: '#4a4a65',
  white: '#ffffff',
  blue: '#378add',
  green: '#4ade80',
  red: '#f87171',
} as const

type Props = {
  systemId: string
  snapshots: ScoreSnapshot[]
  states: Record<string, SystemState>
  members: Record<string, Member>
  onClose: () => void
}

export default function SystemDetailModal({ systemId, snapshots, states, members, onClose }: Props) {
  const sysMeta = SYSTEM_MAP[systemId]
  const state = states[systemId]
  if (!sysMeta || !state) return null

  const zoneName = ZONES.find(z => z.id === sysMeta.zoneId)?.name ?? ''
  const ownerIds = state.owner_id?.split(',') ?? sysMeta.initialOwnerIds ?? []
  const ownerNames = ownerIds.map(id => members[id.trim()]?.name ?? id.trim()).join(', ')
  const currentScore = state.score
  const stageLevel = getStageFromScore(currentScore)
  const stageLabel = `L${stageLevel} ${STAGES[stageLevel].name}`

  // Group snapshots by week for this system
  const weeklyHistory = useMemo(() => {
    const sysSnaps = snapshots.filter(s => s.system_id === systemId)
    const weekMap: Record<string, number> = {}
    for (const snap of sysSnaps) {
      const week = getISOWeek(snap.snapshot_at)
      weekMap[week] = snap.score // last wins
    }
    const weeks = Object.keys(weekMap).sort()
    return weeks.map((w, i) => {
      const score = weekMap[w]
      const prevScore = i > 0 ? weekMap[weeks[i - 1]] : null
      const delta = prevScore !== null ? score - prevScore : null
      const prevStage = prevScore !== null ? `L${getStageFromScore(prevScore)} ${STAGES[getStageFromScore(prevScore)].name}` : null
      const curStage = `L${getStageFromScore(score)} ${STAGES[getStageFromScore(score)].name}`
      const stageChanged = prevStage !== null && prevStage !== curStage
      return { week: w, score, prevScore, delta, curStage, prevStage, stageChanged }
    }).reverse()
  }, [snapshots, systemId])

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{
        background: C.card,
        border: '1px solid #252540',
        borderRadius: 18,
        width: '92%', maxWidth: 760, maxHeight: '82vh',
        overflowY: 'auto',
        padding: 32,
      }}>
        {/* Top */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.white }}>{sysMeta.name}</div>
            <div style={{ fontSize: 17, color: C.muted, marginTop: 10 }}>
              {zoneName} · {ownerNames} · {stageLabel}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#151528', border: '1px solid #252540',
              color: C.muted, width: 40, height: 40, borderRadius: 8, cursor: 'pointer', fontSize: 20,
            }}
          >✕</button>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: C.muted, marginBottom: 6 }}>
          <span>진행률</span>
          <span><strong style={{ color: C.white, fontSize: 20 }}>{currentScore}</strong> / 100</span>
        </div>
        <div style={{ height: 14, background: '#1a1a35', borderRadius: 7, overflow: 'hidden', marginBottom: 28 }}>
          <div style={{ height: '100%', borderRadius: 7, background: C.blue, width: `${currentScore}%` }} />
        </div>

        {/* Weekly Activity */}
        <div style={{ fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 20 }}>주차별 활동 내역</div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {weeklyHistory.length === 0 && (
            <li style={{ fontSize: 16, color: C.dim, padding: '20px 0' }}>아직 기록된 스냅샷이 없습니다.</li>
          )}
          {weeklyHistory.map(h => (
            <li key={h.week} style={{ display: 'flex', gap: 20, padding: '20px 0', borderBottom: `1px solid #151530` }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.blue, minWidth: 100, flexShrink: 0 }}>
                {weekToKorean(h.week)}
              </div>
              <div>
                <div style={{ fontSize: 17, color: C.text, lineHeight: '1.7' }}>
                  {h.prevScore !== null
                    ? `${h.prevScore}점 → ${h.score}점`
                    : `${h.score}점 (최초 기록)`}
                </div>
                {h.delta !== null && h.delta !== 0 && (
                  <div style={{ fontSize: 17, fontWeight: 800, marginTop: 8, color: h.delta > 0 ? C.green : C.red }}>
                    {h.prevScore}점 → {h.score}점 ({h.delta > 0 ? '+' : ''}{h.delta})
                    {h.stageChanged && ` · ${h.prevStage}→${h.curStage}`}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
