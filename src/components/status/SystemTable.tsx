import { useState } from 'react'
import { ZONES } from '../../data/zones'
import { SYSTEMS } from '../../data/systems'
import { STAGES, STAGE_POINTS } from '../../data/stages'
import { getZoneScore, getStageFromScore } from '../../lib/score'
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
  { bg: '#1a1a2a', text: '#7777a0' },  // L0 미착수
  { bg: '#1e2a50', text: '#85b7eb' },  // L1 기획
  { bg: '#1a3070', text: '#7070d0' },  // L2 개발
  { bg: '#0a2a40', text: '#5080c0' },  // L3 도입
  { bg: '#2a1a00', text: '#f0c870' },  // L4 활용
  { bg: '#1a0a2a', text: '#c4b8f8' },  // L5 최적화
  { bg: '#0a2a14', text: '#5dcaa5' },  // L6 자동화
]

// ── Score Ring SVG ────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 44, stroke = 3 }: { score: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color = score >= 70 ? '#5dcaa5' : score >= 40 ? '#f0c870' : score > 0 ? '#7070d0' : '#666680'

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1a1a35" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={circumference - progress}
        strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        fill="#e0e0f0" fontSize={size * 0.34} fontWeight="bold">{score}</text>
    </svg>
  )
}

function nextStatus(current: string): 'normal' | 'delay' | 'hold' {
  if (current === 'normal') return 'delay'
  if (current === 'delay') return 'hold'
  return 'normal'
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SystemTable({ states, members, snapshots: _snapshots, filter, onUpdate, readOnly = false }: Props) {
  const [editingOwner, setEditingOwner] = useState<string | null>(null)

  function handleStageClick(systemId: string, level: number) {
    if (readOnly) return
    onUpdate(systemId, { score: STAGE_POINTS[level] })
  }

  function handleStatusToggle(systemId: string, currentStatus: string) {
    if (readOnly) return
    const ns = nextStatus(currentStatus)
    onUpdate(systemId, { status: ns, status_reason: ns === 'normal' ? null : states[systemId]?.status_reason })
  }

  function handleOwnerChange(systemId: string, ownerId: string) {
    onUpdate(systemId, { owner_id: ownerId || null })
    setEditingOwner(null)
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
              className="flex items-center gap-3 px-4 py-2 rounded-t-lg"
              style={{ backgroundColor: '#0e0e22', border: '1px solid #1a1a35', borderLeft: `3px solid ${zone.color}` }}
            >
              <span className="text-sm font-semibold" style={{ color: '#e0e0f0' }}>{zone.name}</span>
              <span className="text-base font-bold tabular-nums" style={{ color: '#e0e0f0' }}>{zoneScore}점</span>
              <span className="text-xs" style={{ color: '#8888a0' }}>AI {zone.ai_pct}%</span>
              <span className="text-xs" style={{ color: '#8888a0' }}>{filtered.length}개</span>
            </div>

            {/* Column header */}
            <div
              className="grid gap-0 px-4 py-1.5 text-[10px] uppercase tracking-wider"
              style={{
                gridTemplateColumns: '56px 1fr 280px 70px 56px 64px', gap: '0 12px',
                backgroundColor: '#0a0a18',
                borderLeft: '1px solid #1a1a35',
                borderRight: '1px solid #1a1a35',
                color: '#666680',
              }}
            >
              <div></div>
              <div>시스템</div>
              <div className="text-center">단계 선택</div>
              <div className="text-center">현재 단계</div>
              <div className="text-center">상태</div>
              <div className="text-right">담당자</div>
            </div>

            {/* System rows */}
            <div className="rounded-b-lg overflow-hidden" style={{ border: '1px solid #1a1a35', borderTop: 'none' }}>
              {filtered.map((sys, idx) => {
                const state = states[sys.id]
                if (!state) return null
                const score = state.score
                const stageLevel = getStageFromScore(state.score)
                const stage = STAGES[stageLevel]
                const badge = STAGE_BADGE[stageLevel] ?? STAGE_BADGE[0]
                const ownerIds = state.owner_id?.split(',').filter(Boolean) ?? []
                const ownerNames = ownerIds.map(id => members.find(m => m.id === id)?.name ?? id).join(', ')
                const isLast = idx === filtered.length - 1

                return (
                  <div
                    key={sys.id}
                    className="grid items-center gap-0 px-4 py-2.5 transition-colors"
                    style={{
                      gridTemplateColumns: '56px 1fr 280px 70px 56px 64px', gap: '0 12px',
                      backgroundColor: '#0e0e22',
                      borderBottom: isLast ? 'none' : '1px solid #1a1a35',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#12122a')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0e0e22')}
                  >
                    {/* Score ring */}
                    <div><ScoreRing score={score} /></div>

                    {/* System name + desc */}
                    <div className="min-w-0 pr-3">
                      <div className="font-semibold text-sm truncate" style={{ color: '#e0e0f0' }}>{sys.name}</div>
                      <div className="text-[10px] truncate mt-0.5" style={{ color: '#8888a0' }}>{sys.desc}</div>
                      {/* Mini progress bar */}
                      <div className="h-1 rounded-full mt-1.5 overflow-hidden" style={{ backgroundColor: '#1a1a35' }}>
                        <div className="h-full rounded-full" style={{
                          width: `${score}%`,
                          backgroundColor: score >= 70 ? '#5dcaa5' : score >= 40 ? '#f0c870' : score > 0 ? '#7070d0' : '#666680',
                        }} />
                      </div>
                    </div>

                    {/* Inline stage selector — 7 buttons */}
                    <div className="flex gap-1 px-1">
                      {STAGES.map(s => {
                        const isCurrent = stageLevel === s.level
                        const isPast = s.level < stageLevel
                        const b = STAGE_BADGE[s.level]
                        return (
                          <button
                            key={s.level}
                            onClick={() => handleStageClick(sys.id, s.level)}
                            disabled={readOnly}
                            title={`${s.name} (${s.points}점)\n${s.criteria.join('\n')}`}
                            className="flex-1 py-1 rounded text-[10px] font-medium transition-all disabled:cursor-default"
                            style={
                              isCurrent
                                ? { border: '2px solid #378add', backgroundColor: b.bg, color: b.text }
                                : isPast
                                ? { border: '1px solid transparent', backgroundColor: b.bg + '80', color: b.text + '90' }
                                : { border: '1px solid #1a1a35', backgroundColor: '#0a0a18', color: '#666680' }
                            }
                          >
                            <div className="font-bold text-xs">{s.level}</div>
                            <div className="text-[8px] leading-tight mt-px">{s.name}</div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Current stage badge */}
                    <div className="text-center">
                      <span
                        className="inline-flex items-center text-[11px] font-semibold px-2 py-1 rounded"
                        style={{ backgroundColor: badge.bg, color: badge.text }}
                      >
                        L{stageLevel} {stage?.name}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="text-center">
                      <button
                        onClick={() => handleStatusToggle(sys.id, state.status)}
                        disabled={readOnly}
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors disabled:cursor-default"
                        style={
                          state.status === 'delay'
                            ? { backgroundColor: '#2a0a0a', color: '#f87171' }
                            : state.status === 'hold'
                            ? { backgroundColor: '#2a1a00', color: '#fbbf24' }
                            : { backgroundColor: '#1a1a2a', color: '#8888a0' }
                        }
                      >
                        {state.status === 'delay' ? '지연' : state.status === 'hold' ? '보류' : '정상'}
                      </button>
                    </div>

                    {/* Owner */}
                    <div className="text-right text-xs" onClick={e => e.stopPropagation()}>
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
                          {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      ) : (
                        <button
                          onClick={() => !readOnly && setEditingOwner(sys.id)}
                          disabled={readOnly}
                          className="hover:opacity-80 transition-opacity"
                          style={{ color: ownerNames ? '#e0e0f0' : '#8888a0' }}
                        >
                          {ownerNames || '미지정'}
                        </button>
                      )}
                    </div>
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
