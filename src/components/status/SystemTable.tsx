import { useState } from 'react'
import { ZONES } from '../../data/zones'
import { SYSTEMS } from '../../data/systems'
import { STAGES } from '../../data/stages'
import { getSystemScore, getZoneScore } from '../../lib/score'
import type { SystemState, Member, ScoreSnapshot } from '../../types'
import type { FilterValue } from './StatusFilter'

type Props = {
  states: Record<string, SystemState>
  members: Member[]
  snapshots: Record<string, ScoreSnapshot>
  filter: FilterValue
  onUpdate: (systemId: string, updates: Partial<SystemState>) => void
  readOnly?: boolean
}

// ── Stage badge styles ────────────────────────────────────────────────────────
const STAGE_BADGE: { bg: string; text: string }[] = [
  { bg: '#1a1a2a', text: '#444460' },  // L0 미착수
  { bg: '#1e2a50', text: '#85b7eb' },  // L1 기획
  { bg: '#1a3070', text: '#7070d0' },  // L2 개발
  { bg: '#0a2a40', text: '#5080c0' },  // L3 도입
  { bg: '#2a1a00', text: '#f0c870' },  // L4 활용
  { bg: '#1a0a2a', text: '#c4b8f8' },  // L5 최적화
  { bg: '#0a2a14', text: '#5dcaa5' },  // L6 자동화
]

// ── Score Ring SVG ────────────────────────────────────────────────────────────
function ScoreRing({
  score,
  size = 40,
  stroke = 3,
}: {
  score: number
  size?: number
  stroke?: number
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color =
    score >= 70
      ? '#5dcaa5'
      : score >= 40
      ? '#f0c870'
      : score > 0
      ? '#7070d0'
      : '#333350'

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#1a1a35"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#e0e0f0"
        fontSize={size * 0.28}
        fontWeight="bold"
      >
        {score}
      </text>
    </svg>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function nextStatus(current: string): 'normal' | 'delay' | 'hold' {
  if (current === 'normal') return 'delay'
  if (current === 'delay') return 'hold'
  return 'normal'
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SystemTable({
  states,
  members,
  snapshots: _snapshots,
  filter,
  onUpdate,
  readOnly = false,
}: Props) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [editingOwner, setEditingOwner] = useState<string | null>(null)
  const [editingMemo, setEditingMemo] = useState<string | null>(null)
  const [memoInput, setMemoInput] = useState('')

  function handleStageClick(systemId: string, level: number) {
    if (readOnly) return
    onUpdate(systemId, { stage: level })
  }

  function handleStatusToggle(systemId: string, currentStatus: string) {
    if (readOnly) return
    const ns = nextStatus(currentStatus)
    onUpdate(systemId, {
      status: ns,
      status_reason: ns === 'normal' ? null : states[systemId]?.status_reason,
    })
  }

  function handleOwnerChange(systemId: string, ownerId: string) {
    onUpdate(systemId, { owner_id: ownerId || null })
    setEditingOwner(null)
  }

  function handleMemoSave(systemId: string) {
    onUpdate(systemId, { note: memoInput || null })
    setEditingMemo(null)
  }

  return (
    <div className="space-y-4">
      {ZONES.map(zone => {
        const zoneSystems = SYSTEMS.filter(s => s.zoneId === zone.id)
        const filtered = zoneSystems.filter(s => {
          if (filter === 'all') return true
          return (states[s.id]?.status ?? 'normal') === filter
        })
        if (filtered.length === 0) return null

        const zoneScore = getZoneScore(zone.id, states)

        return (
          <div key={zone.id}>
            {/* Zone section header */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 mb-1 rounded-t-lg"
              style={{
                backgroundColor: '#0e0e22',
                border: '1px solid #1a1a35',
                borderLeft: `3px solid ${zone.color}`,
              }}
            >
              <span className="text-sm font-semibold" style={{ color: '#e0e0f0' }}>
                {zone.name}
              </span>
              <span className="text-xs" style={{ color: '#555570' }}>
                AI {zone.ai_pct}%
              </span>
              <span className="ml-auto text-base font-bold tabular-nums" style={{ color: '#e0e0f0' }}>
                {zoneScore}pt
              </span>
            </div>

            {/* System rows */}
            <div
              className="rounded-b-lg overflow-hidden"
              style={{ border: '1px solid #1a1a35', borderTop: 'none' }}
            >
              {filtered.map((sys, idx) => {
                const state = states[sys.id]
                if (!state) return null
                const score = getSystemScore(state.stage)
                const stage = STAGES[state.stage]
                const badge = STAGE_BADGE[state.stage] ?? STAGE_BADGE[0]
                const owner = members.find(m => m.id === state.owner_id)
                const isExpanded = expandedRow === sys.id
                const isLast = idx === filtered.length - 1

                return (
                  <div
                    key={sys.id}
                    style={{
                      borderBottom: isLast ? 'none' : '1px solid #1a1a35',
                    }}
                  >
                    {/* Main clickable row */}
                    <div
                      className="flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors"
                      style={{
                        backgroundColor: isExpanded ? '#12122a' : '#0e0e22',
                      }}
                      onMouseEnter={e => {
                        if (!isExpanded) (e.currentTarget as HTMLElement).style.backgroundColor = '#12122a'
                      }}
                      onMouseLeave={e => {
                        if (!isExpanded) (e.currentTarget as HTMLElement).style.backgroundColor = '#0e0e22'
                      }}
                      onClick={() => setExpandedRow(isExpanded ? null : sys.id)}
                    >
                      {/* Score ring */}
                      <ScoreRing score={score} />

                      {/* Name + description */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-semibold text-sm truncate"
                          style={{ color: '#e0e0f0' }}
                        >
                          {sys.name}
                        </div>
                        <div className="text-[11px] truncate mt-0.5" style={{ color: '#555570' }}>
                          {sys.desc}
                        </div>

                        {/* Mini progress bar */}
                        <div
                          className="h-1 rounded-full mt-1.5 overflow-hidden"
                          style={{ backgroundColor: '#1a1a35', maxWidth: '160px' }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${score}%`,
                              backgroundColor:
                                score >= 70 ? '#5dcaa5' : score >= 40 ? '#f0c870' : score > 0 ? '#7070d0' : '#333350',
                            }}
                          />
                        </div>
                      </div>

                      {/* Stage badge */}
                      <div className="shrink-0">
                        <span
                          className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded"
                          style={{ backgroundColor: badge.bg, color: badge.text }}
                        >
                          L{state.stage} {stage?.name}
                        </span>
                      </div>

                      {/* Status badge (delay/hold) */}
                      {state.status !== 'normal' && (
                        <button
                          className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={
                            state.status === 'delay'
                              ? { backgroundColor: '#2a0a0a', color: '#f87171' }
                              : { backgroundColor: '#2a1a00', color: '#fbbf24' }
                          }
                          onClick={e => {
                            e.stopPropagation()
                            handleStatusToggle(sys.id, state.status)
                          }}
                          disabled={readOnly}
                        >
                          {state.status === 'delay' ? '지연' : '보류'}
                        </button>
                      )}

                      {/* Owner */}
                      <div
                        className="shrink-0 w-16 text-xs truncate text-right"
                        style={{ color: '#555570' }}
                        onClick={e => e.stopPropagation()}
                      >
                        {editingOwner === sys.id ? (
                          <select
                            autoFocus
                            value={state.owner_id ?? ''}
                            onChange={e => handleOwnerChange(sys.id, e.target.value)}
                            onBlur={() => setEditingOwner(null)}
                            className="w-full rounded px-1 py-0.5 text-xs focus:outline-none"
                            style={{ backgroundColor: '#1a1a35', color: '#e0e0f0', border: '1px solid #333360' }}
                          >
                            <option value="">미지정</option>
                            {members.map(m => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <button
                            onClick={() => !readOnly && setEditingOwner(sys.id)}
                            className="hover:opacity-80 transition-opacity"
                            disabled={readOnly}
                            style={{ color: owner ? '#e0e0f0' : '#555570' }}
                          >
                            {owner?.name ?? '미지정'}
                          </button>
                        )}
                      </div>

                      {/* Expand indicator */}
                      <div className="shrink-0 text-[10px]" style={{ color: '#555570' }}>
                        {isExpanded ? '▲' : '▼'}
                      </div>
                    </div>

                    {/* Expanded panel */}
                    {isExpanded && (
                      <div
                        className="px-4 py-3"
                        style={{
                          backgroundColor: '#080812',
                          borderTop: '1px solid #1a1a35',
                        }}
                      >
                        <div className="flex items-start gap-6 flex-wrap">
                          {/* Stage selector buttons */}
                          <div className="flex gap-1.5 flex-wrap">
                            {STAGES.map(s => {
                              const isCurrent = state.stage === s.level
                              const isPast = s.level < state.stage
                              return (
                                <button
                                  key={s.level}
                                  onClick={() => handleStageClick(sys.id, s.level)}
                                  disabled={readOnly}
                                  title={`${s.name} (${s.points}pt)\n${s.criteria.join(' · ')}`}
                                  className="w-16 py-1.5 rounded text-xs font-medium transition-all disabled:cursor-default"
                                  style={
                                    isCurrent
                                      ? {
                                          border: '2px solid #378add',
                                          backgroundColor: '#1a2a50',
                                          color: '#85b7eb',
                                        }
                                      : isPast
                                      ? {
                                          border: '1px solid #1a1a35',
                                          backgroundColor: '#0e0e22',
                                          color: '#333350',
                                        }
                                      : {
                                          border: '1px solid #1a1a35',
                                          backgroundColor: '#12122a',
                                          color: '#555570',
                                        }
                                  }
                                >
                                  <div className="font-bold">{s.level}</div>
                                  <div className="text-[9px] mt-0.5">{s.name}</div>
                                </button>
                              )
                            })}
                          </div>

                          {/* Next stage criteria */}
                          {state.stage < 6 && (
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] mb-1" style={{ color: '#555570' }}>
                                다음: L{state.stage + 1} {STAGES[state.stage + 1]?.name}
                              </div>
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                {STAGES[state.stage + 1]?.criteria.map((c, i) => (
                                  <span key={i} className="text-[10px]" style={{ color: '#555570' }}>
                                    ○ {c}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Status toggle */}
                          <div className="shrink-0 flex items-center gap-2">
                            <button
                              onClick={() => handleStatusToggle(sys.id, state.status)}
                              disabled={readOnly}
                              className="text-xs px-3 py-1 rounded font-medium transition-colors disabled:cursor-default"
                              style={
                                state.status === 'normal'
                                  ? { backgroundColor: '#1a1a35', color: '#e0e0f0' }
                                  : state.status === 'delay'
                                  ? { backgroundColor: '#2a0a0a', color: '#f87171' }
                                  : { backgroundColor: '#2a1a00', color: '#fbbf24' }
                              }
                            >
                              {state.status === 'normal'
                                ? '정상'
                                : state.status === 'delay'
                                ? '지연'
                                : '보류'}
                            </button>

                            {/* Memo button */}
                            <div onClick={e => e.stopPropagation()}>
                              {editingMemo === sys.id ? (
                                <input
                                  autoFocus
                                  value={memoInput}
                                  onChange={e => setMemoInput(e.target.value)}
                                  onBlur={() => handleMemoSave(sys.id)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleMemoSave(sys.id)
                                    if (e.key === 'Escape') setEditingMemo(null)
                                  }}
                                  className="rounded px-2 py-0.5 text-xs focus:outline-none"
                                  style={{
                                    backgroundColor: '#1a1a35',
                                    border: '1px solid #333360',
                                    color: '#e0e0f0',
                                    width: '160px',
                                  }}
                                  placeholder="메모 입력..."
                                />
                              ) : (
                                <button
                                  onClick={() => {
                                    if (!readOnly) {
                                      setMemoInput(state.note ?? '')
                                      setEditingMemo(sys.id)
                                    }
                                  }}
                                  disabled={readOnly}
                                  className="text-xs px-3 py-1 rounded transition-colors disabled:cursor-default"
                                  style={{ backgroundColor: '#1a1a35', color: '#555570' }}
                                >
                                  {state.note ? state.note : '메모 추가'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
