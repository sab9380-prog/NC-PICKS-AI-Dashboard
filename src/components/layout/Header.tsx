import { ZONES } from '../../data/zones'
import { SYSTEMS } from '../../data/systems'
import { STAGES } from '../../data/stages'
import { getTotalScore, getSystemScore, getZoneScore } from '../../lib/score'
import { calcDelta } from '../../hooks/useSnapshots'
import type { SystemState, ScoreSnapshot } from '../../types'

type Props = {
  states: Record<string, SystemState>
  snapshots: Record<string, ScoreSnapshot>
}

// Stage colors matching spec: slate-600, blue-900, blue-800, cyan-800, emerald-800, lime-800, green-700
const STAGE_COLORS = [
  'bg-slate-600',
  'bg-blue-900',
  'bg-blue-800',
  'bg-cyan-800',
  'bg-emerald-800',
  'bg-lime-800',
  'bg-green-700',
]

function scoreColorClass(score: number): string {
  if (score >= 70) return 'text-emerald-400'
  if (score >= 40) return 'text-amber-400'
  return 'text-red-400'
}

function deltaDisplay(delta: number | null): string {
  if (delta === null) return ''
  if (delta > 0) return `+${delta}`
  return String(delta)
}

function deltaColorClass(delta: number | null): string {
  if (delta === null) return 'text-slate-500'
  if (delta > 0) return 'text-emerald-400'
  if (delta < 0) return 'text-red-400'
  return 'text-slate-400'
}

export default function Header({ states, snapshots }: Props) {
  const totalScore = getTotalScore(states)

  // Calc total delta from snapshots
  const totalDelta: number | null = (() => {
    let hasAny = false
    let sum = 0
    for (const sys of SYSTEMS) {
      const score = getSystemScore(states[sys.id]?.stage ?? 0)
      const d = calcDelta(sys.id, score, snapshots)
      if (d !== null) {
        hasAny = true
        sum += d
      }
    }
    if (!hasAny) return null
    return Math.round(sum / SYSTEMS.length)
  })()

  // Summary counts
  const counts = SYSTEMS.reduce(
    (acc, sys) => {
      const state = states[sys.id]
      const stage = state?.stage ?? 0
      const status = state?.status ?? 'normal'
      if (stage === 6) acc.done++
      else if (status === 'delay') acc.delay++
      else if (stage === 0) acc.notStarted++
      else acc.inProgress++
      return acc
    },
    { done: 0, inProgress: 0, notStarted: 0, delay: 0 },
  )

  // Stage distribution (count systems per stage 0-6)
  const stageCounts = new Array(7).fill(0)
  for (const sys of SYSTEMS) {
    const stage = states[sys.id]?.stage ?? 0
    stageCounts[stage] = (stageCounts[stage] ?? 0) + 1
  }
  const totalSystems = SYSTEMS.length

  return (
    <div className="space-y-2">
      {/* Top row: total score + summary counts */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Total score */}
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold tabular-nums ${scoreColorClass(totalScore)}`}>
            {totalScore}
          </span>
          <span className="text-slate-500 text-sm">/ 100</span>
          {totalDelta !== null && (
            <span className={`text-sm font-medium ${deltaColorClass(totalDelta)}`}>
              {deltaDisplay(totalDelta)}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-700" />

        {/* 4 summary counts */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            <span className="text-slate-400">운영완료</span>
            <span className="font-bold text-white ml-1">{counts.done}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            <span className="text-slate-400">진행중</span>
            <span className="font-bold text-white ml-1">{counts.inProgress}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
            <span className="text-slate-400">미착수</span>
            <span className="font-bold text-white ml-1">{counts.notStarted}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            <span className="text-slate-400">지연</span>
            <span className="font-bold text-white ml-1">{counts.delay}</span>
          </div>
        </div>
      </div>

      {/* Stage distribution bar */}
      <div>
        <div className="flex h-3 rounded overflow-hidden gap-px">
          {STAGES.map((stage, i) => {
            const count = stageCounts[i] ?? 0
            if (count === 0) return null
            const pct = (count / totalSystems) * 100
            return (
              <div
                key={stage.level}
                className={`${STAGE_COLORS[i]} flex items-center justify-center`}
                style={{ width: `${pct}%` }}
                title={`${stage.name}: ${count}개`}
              />
            )
          })}
        </div>
        <div className="flex gap-3 mt-1 flex-wrap">
          {STAGES.map((stage, i) => (
            <div key={stage.level} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-sm ${STAGE_COLORS[i]} inline-block`} />
              <span className="text-xs text-slate-500">
                {stage.name} {stageCounts[i] ?? 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Zone cards: 6-col grid → 3-col at md */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {ZONES.map(zone => {
          const zoneScore = getZoneScore(zone.id, states)
          const zoneSystems = SYSTEMS.filter(s => s.zoneId === zone.id)

          // Zone delta
          const zoneDelta: number | null = (() => {
            let hasAny = false
            let sum = 0
            for (const sys of zoneSystems) {
              const score = getSystemScore(states[sys.id]?.stage ?? 0)
              const d = calcDelta(sys.id, score, snapshots)
              if (d !== null) { hasAny = true; sum += d }
            }
            if (!hasAny) return null
            return Math.round(sum / zoneSystems.length)
          })()

          // Mini stage distribution for this zone
          const zoneStages = new Array(7).fill(0)
          for (const sys of zoneSystems) {
            const stage = states[sys.id]?.stage ?? 0
            zoneStages[stage] = (zoneStages[stage] ?? 0) + 1
          }

          return (
            <div
              key={zone.id}
              className="bg-slate-800/60 rounded-lg overflow-hidden border border-slate-700/50"
              style={{ borderTopColor: zone.color, borderTopWidth: 2 }}
            >
              <div className="px-2 pt-2 pb-2">
                <div className="text-xs text-slate-400 truncate font-medium">{zone.name}</div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={`text-lg font-bold tabular-nums ${scoreColorClass(zoneScore)}`}>
                    {zoneScore}
                  </span>
                  {zoneDelta !== null && (
                    <span className={`text-xs ${deltaColorClass(zoneDelta)}`}>
                      {deltaDisplay(zoneDelta)}
                    </span>
                  )}
                </div>

                {/* Mini distribution bar */}
                <div className="flex h-1.5 rounded overflow-hidden gap-px mt-1">
                  {STAGES.map((stage, i) => {
                    const cnt = zoneStages[i] ?? 0
                    if (cnt === 0) return null
                    const pct = (cnt / zoneSystems.length) * 100
                    return (
                      <div
                        key={stage.level}
                        className={`${STAGE_COLORS[i]}`}
                        style={{ width: `${pct}%` }}
                        title={`${stage.name}: ${cnt}`}
                      />
                    )
                  })}
                </div>

                <div className="flex justify-between mt-1 text-xs text-slate-500">
                  <span>{zoneSystems.length}개</span>
                  <span>{zone.defaultTargetMonth.slice(0, 7)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
