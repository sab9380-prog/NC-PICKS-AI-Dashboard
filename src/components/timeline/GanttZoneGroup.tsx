import { SYSTEMS } from '../../data/systems'
import { STAGE_MAP } from '../../data/stages'
import { getSystemScore } from '../../lib/score'
import { getGanttBar, TIMELINE_MONTHS } from '../../lib/timeline'
import type { Zone, SystemState, Member } from '../../types'

type Props = {
  zone: Zone
  states: Record<string, SystemState>
  members: Member[]
  now: string
  onEditDates?: (systemId: string) => void
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

export default function GanttZoneGroup({
  zone,
  states,
  members,
  now: _now,
  onEditDates,
  readOnly = false,
}: Props) {
  const zoneSystems = SYSTEMS.filter(s => s.zoneId === zone.id)

  return (
    <div>
      {/* Zone header row */}
      <div className="flex min-h-[32px] border-b border-slate-800">
        {/* Left sticky label */}
        <div
          className="sticky left-0 z-10 bg-slate-950 w-[220px] lg:w-[220px] shrink-0 flex items-center gap-2 px-3 py-1 border-r border-slate-800"
        >
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: zone.color }}
          />
          <span className="text-xs font-semibold text-white">{zone.name}</span>
          <span className="text-xs text-slate-500">({zoneSystems.length})</span>
        </div>
        {/* Right grid area - just bg */}
        <div className="flex-1 bg-slate-800/20" />
      </div>

      {/* System rows */}
      {zoneSystems.map(sys => {
        const state = states[sys.id] ?? {
          system_id: sys.id,
          stage: 0,
          status: 'normal' as const,
          status_reason: null,
          owner_id: null,
          start_month: '2026-04',
          target_month: zone.defaultTargetMonth,
          note: null,
          updated_at: new Date().toISOString(),
          updated_by: null,
        }

        const score = getSystemScore(state.stage)
        const stageDef = STAGE_MAP[state.stage]
        const owner = members.find(m => m.id === state.owner_id)
        const bar = getGanttBar(state.start_month, state.target_month, score)
        const canEdit = !readOnly && !!onEditDates

        // Calculate month-based grid lines - we need per-month widths for the grid
        // Each month = 100/24 % of total width
        const monthWidth = 100 / TIMELINE_MONTHS

        return (
          <div key={sys.id} className="flex min-h-[52px] border-b border-slate-800/50 hover:bg-slate-800/10 transition-colors group">
            {/* Left sticky label */}
            <div
              className="sticky left-0 z-10 bg-slate-950 w-[220px] lg:w-[220px] shrink-0 flex flex-col justify-center px-3 py-2 border-r border-slate-800 group-hover:bg-slate-900/80"
            >
              <button
                disabled={!canEdit}
                onClick={() => canEdit && onEditDates!(sys.id)}
                className={`text-left w-full ${canEdit ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                title={canEdit ? '클릭하여 날짜 수정' : undefined}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-medium text-white leading-tight truncate">
                    {sys.name}
                  </span>
                  {canEdit && (
                    <span className="text-xs text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">✎</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">{stageDef?.name ?? '미착수'}</span>
                  <span className={`text-xs font-bold tabular-nums ${scoreColorClass(score)}`}>
                    {score}pt
                  </span>
                  <span
                    className={`text-xs px-1 py-px rounded border font-medium leading-none ${statusBadgeClass(state.status)}`}
                  >
                    {statusLabel(state.status)}
                  </span>
                </div>
                {owner && (
                  <div className="text-xs text-slate-600 mt-0.5 truncate">{owner.name}</div>
                )}
              </button>
            </div>

            {/* Right: Gantt bar area */}
            <div className="flex-1 relative flex items-center">
              {/* Month grid lines */}
              {Array.from({ length: TIMELINE_MONTHS - 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 w-px bg-slate-800/50"
                  style={{ left: `${(i + 1) * monthWidth}%` }}
                />
              ))}

              {/* Plan range background */}
              <div
                className="absolute top-3 bottom-3 rounded"
                style={{
                  left: `${bar.leftPct}%`,
                  width: `${bar.widthPct}%`,
                  backgroundColor: zone.color + '22',
                  border: `1px solid ${zone.color}44`,
                }}
              />

              {/* Progress fill */}
              <div
                className="absolute top-3 bottom-3 rounded"
                style={{
                  left: `${bar.leftPct}%`,
                  width: `${bar.fillPct}%`,
                  backgroundColor: zone.color + '99',
                }}
              />

              {/* Score label inside bar (only if bar is wide enough) */}
              {bar.widthPct > 8 && (
                <div
                  className="absolute top-0 bottom-0 flex items-center px-1"
                  style={{ left: `${bar.leftPct}%`, width: `${bar.widthPct}%` }}
                >
                  <span
                    className="text-xs font-bold text-white/80 truncate"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                  >
                    {score}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
