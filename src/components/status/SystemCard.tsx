import { useState } from 'react'
import { STAGES } from '../../data/stages'
import { getSystemScore } from '../../lib/score'
import { calcDelta } from '../../hooks/useSnapshots'
import type { SystemMeta, SystemState, Zone, Member, ScoreSnapshot } from '../../types'

type Props = {
  system: SystemMeta
  state: SystemState
  zone: Zone
  members: Member[]
  snapshots: Record<string, ScoreSnapshot>
  onUpdate: (systemId: string, updates: Partial<SystemState>) => void
  readOnly?: boolean
}

function scoreColorClass(score: number): string {
  if (score >= 70) return 'text-emerald-400'
  if (score >= 40) return 'text-amber-400'
  return 'text-red-400'
}

function statusBadgeClass(status: string): string {
  if (status === 'delay') return 'bg-red-900/60 text-red-400 border-red-800'
  if (status === 'hold') return 'bg-amber-900/60 text-amber-400 border-amber-800'
  return 'bg-emerald-900/60 text-emerald-400 border-emerald-800'
}

function statusLabel(status: string): string {
  if (status === 'delay') return '지연'
  if (status === 'hold') return '보류'
  return '정상'
}

function nextStatus(current: string): 'normal' | 'delay' | 'hold' {
  if (current === 'normal') return 'delay'
  if (current === 'delay') return 'hold'
  return 'normal'
}

function isStale(updatedAt: string): boolean {
  const diff = Date.now() - new Date(updatedAt).getTime()
  return diff > 7 * 24 * 60 * 60 * 1000
}

export default function SystemCard({
  system,
  state,
  zone,
  members,
  snapshots,
  onUpdate,
  readOnly = false,
}: Props) {
  const [reasonInput, setReasonInput] = useState(state.status_reason ?? '')
  const [editingMemo, setEditingMemo] = useState(false)
  const [memoInput, setMemoInput] = useState(state.note ?? '')

  const score = getSystemScore(state.stage)
  const delta = calcDelta(system.id, score, snapshots)
  const stale = isStale(state.updated_at)
  const nextStage = STAGES[state.stage + 1] ?? null

  function handleStatusToggle() {
    if (readOnly) return
    const ns = nextStatus(state.status)
    onUpdate(system.id, {
      status: ns,
      status_reason: ns === 'normal' ? null : state.status_reason,
    })
  }

  function handleStageClick(level: number) {
    if (readOnly) return
    onUpdate(system.id, { stage: level })
  }

  function handleOwnerChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (readOnly) return
    onUpdate(system.id, { owner_id: e.target.value || null })
  }

  function handleReasonBlur() {
    if (readOnly) return
    onUpdate(system.id, { status_reason: reasonInput || null })
  }

  function handleMemoSave() {
    if (readOnly) return
    onUpdate(system.id, { note: memoInput || null })
    setEditingMemo(false)
  }

  const owner = members.find(m => m.id === state.owner_id)

  return (
    <div
      className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex gap-4 hover:border-slate-700 transition-colors"
      style={{ borderLeftColor: zone.color, borderLeftWidth: 3 }}
    >
      {/* Left column: meta info */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Name + stale warning */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white truncate">{system.name}</div>
            <div className="text-xs text-slate-500 truncate">{system.desc}</div>
          </div>
          {stale && (
            <span className="shrink-0 text-xs px-1.5 py-0.5 rounded bg-orange-900/40 text-orange-400 border border-orange-800/50">
              7일 미업데이트
            </span>
          )}
        </div>

        {/* Owner dropdown */}
        <select
          value={state.owner_id ?? ''}
          onChange={handleOwnerChange}
          disabled={readOnly}
          className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white disabled:opacity-60 focus:outline-none focus:border-blue-500"
        >
          <option value="">담당자 미지정</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        {/* Status badge (click to toggle) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleStatusToggle}
            disabled={readOnly}
            className={`text-xs px-2 py-0.5 rounded border font-medium transition-colors disabled:cursor-default ${statusBadgeClass(state.status)}`}
          >
            {statusLabel(state.status)}
          </button>
          {state.status !== 'normal' && (
            <input
              type="text"
              value={reasonInput}
              onChange={e => setReasonInput(e.target.value)}
              onBlur={handleReasonBlur}
              disabled={readOnly}
              placeholder="사유 입력..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 disabled:opacity-60"
            />
          )}
        </div>

        {/* Memo */}
        <div>
          {editingMemo ? (
            <div className="flex gap-1">
              <input
                type="text"
                value={memoInput}
                onChange={e => setMemoInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleMemoSave()
                  if (e.key === 'Escape') setEditingMemo(false)
                }}
                autoFocus
                className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleMemoSave}
                className="text-xs px-2 py-0.5 rounded bg-blue-700 hover:bg-blue-600 text-white"
              >
                저장
              </button>
            </div>
          ) : (
            <button
              onClick={() => !readOnly && setEditingMemo(true)}
              disabled={readOnly}
              className="w-full text-left text-xs text-slate-500 hover:text-slate-400 disabled:hover:text-slate-500 disabled:cursor-default truncate"
            >
              {state.note ? state.note : '메모 추가...'}
            </button>
          )}
        </div>

        {/* Last updated */}
        <div className="text-xs text-slate-600">
          최종 업데이트:{' '}
          {new Date(state.updated_at).toLocaleDateString('ko-KR')}
          {owner && ` · ${owner.name}`}
        </div>
      </div>

      {/* Center column: stage selector */}
      <div className="w-56 shrink-0 space-y-2">
        <div className="flex gap-1">
          {STAGES.map(stage => {
            const isCurrent = state.stage === stage.level
            const isPast = stage.level < state.stage
            return (
              <button
                key={stage.level}
                onClick={() => handleStageClick(stage.level)}
                disabled={readOnly}
                title={`L${stage.level} ${stage.name} (${stage.points}pt)`}
                className={`flex-1 py-2 rounded text-xs font-medium transition-all disabled:cursor-default ${
                  isCurrent
                    ? 'border-2 border-blue-500 bg-blue-900/40 text-blue-300'
                    : isPast
                    ? 'bg-slate-800/40 text-slate-600 hover:bg-slate-800 hover:text-slate-400'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {stage.level}
              </button>
            )
          })}
        </div>
        <div className="text-xs text-slate-400 font-medium">
          L{state.stage} {STAGES[state.stage]?.name}
        </div>

        {/* Next stage criteria */}
        {nextStage && nextStage.criteria.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-slate-500">
              다음: L{nextStage.level} {nextStage.name}
            </div>
            {nextStage.criteria.map((c, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-slate-500">
                <span className="shrink-0 text-slate-700 mt-0.5">○</span>
                <span>{c}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right column: score */}
      <div className="w-20 shrink-0 flex flex-col items-end justify-start pt-1">
        <div className={`text-3xl font-bold tabular-nums ${scoreColorClass(score)}`}>
          {score}
        </div>
        <div className="text-xs text-slate-500">pt</div>
        {delta !== null && (
          <div
            className={`text-sm font-medium mt-1 ${
              delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-red-400' : 'text-slate-400'
            }`}
          >
            {delta > 0 ? `+${delta}` : delta}
          </div>
        )}
      </div>
    </div>
  )
}
