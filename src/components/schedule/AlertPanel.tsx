import { SYSTEMS } from '../../data/systems'
import { ZONE_MAP } from '../../data/zones'
import { STAGE_MAP } from '../../data/stages'
import { getSystemScore, calcSPI, getSPIStatus, calcDelayDays, calcExpectedProgress } from '../../lib/score'
import type { SystemState, Member } from '../../types'

type Props = {
  states: Record<string, SystemState>
  members: Member[]
  now: string
}

function spiColorClass(spi: number): string {
  if (spi < 0.7) return 'text-red-400'
  if (spi < 0.9) return 'text-amber-400'
  return 'text-emerald-400'
}

function spiBarColor(spi: number): string {
  if (spi < 0.7) return 'bg-red-500'
  if (spi < 0.9) return 'bg-amber-500'
  return 'bg-emerald-500'
}

function spiBgTint(spi: number): string {
  if (spi < 0.7) return 'from-red-950/50 to-slate-900 border-red-900/50'
  return 'from-amber-950/40 to-slate-900 border-amber-900/50'
}

export default function AlertPanel({ states, members, now }: Props) {
  // Collect at-risk systems
  const atRisk = SYSTEMS.filter(sys => {
    const state = states[sys.id]
    if (!state) return false
    const spi = calcSPI(state, now)
    return spi < 0.9
  }).map(sys => {
    const state = states[sys.id]!
    const spi = calcSPI(state, now)
    return { sys, state, spi }
  }).sort((a, b) => a.spi - b.spi)

  if (atRisk.length === 0) return null

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-sm font-semibold text-red-400 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-red-400 animate-pulse" />
        즉시 주의 필요 ({atRisk.length}개 시스템)
      </h2>

      {atRisk.map(({ sys, state, spi }) => {
        const zone = ZONE_MAP[sys.zoneId]
        const score = getSystemScore(state.stage)
        const expected = calcExpectedProgress(state.start_month, state.target_month, now)
        const expectedPct = Math.round(expected * 100)
        const actualPct = score
        const gap = expectedPct - actualPct
        const delayDays = calcDelayDays(state, now)
        const stageDef = STAGE_MAP[state.stage]
        const owner = members.find(m => m.id === state.owner_id)
        const status = getSPIStatus(spi)

        return (
          <div
            key={sys.id}
            className={`bg-gradient-to-r ${spiBgTint(spi)} border rounded-xl p-4 space-y-3`}
          >
            {/* Header row */}
            <div className="flex items-start gap-3">
              {/* SPI value */}
              <div className="shrink-0 text-center">
                <div className={`text-2xl font-bold tabular-nums leading-none ${spiColorClass(spi)}`}>
                  {spi.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">SPI</div>
              </div>

              {/* Zone badge + name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: zone?.color + '33', color: zone?.color, border: `1px solid ${zone?.color}66` }}
                  >
                    {zone?.name}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${
                    status === 'danger'
                      ? 'bg-red-900/60 text-red-400 border-red-800'
                      : 'bg-amber-900/60 text-amber-400 border-amber-800'
                  }`}>
                    {status === 'danger' ? '위험' : '주의'}
                  </span>
                </div>
                <div className="font-semibold text-white">{sys.name}</div>
                {owner && (
                  <div className="text-xs text-slate-400">{owner.name}</div>
                )}
              </div>

              {/* Delay days */}
              {delayDays > 0 && (
                <div className="shrink-0 text-center">
                  <div className="text-2xl font-bold tabular-nums text-red-400 leading-none">
                    {delayDays}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">일 지연</div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="text-xs text-slate-400">
              현재 {stageDef?.name ?? '미착수'}({score}pt) · 목표{' '}
              <span className="text-white font-medium">{state.target_month}</span>까지 자동화 도달 필요
            </div>

            {/* Plan vs Actual bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>진척 현황</span>
                <span>
                  실제 {actualPct}% / {gap > 0 ? `${gap}%p 뒤처짐` : '계획 달성'}
                </span>
              </div>
              <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                {/* Actual fill */}
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all ${spiBarColor(spi)}`}
                  style={{ width: `${Math.min(actualPct, 100)}%` }}
                />
                {/* Expected marker (gray line) */}
                <div
                  className="absolute top-0 w-0.5 h-full bg-slate-400/70"
                  style={{ left: `${Math.min(expectedPct, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>{state.start_month}</span>
                <span className="text-slate-500">계획 {expectedPct}%</span>
                <span>{state.target_month}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
