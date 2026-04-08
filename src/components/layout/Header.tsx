import { ZONES } from '../../data/zones'
import { SYSTEMS } from '../../data/systems'
import { STAGES } from '../../data/stages'
import { getTotalScore, getZoneScore, getStageFromScore } from '../../lib/score'
import type { SystemState, ScoreSnapshot } from '../../types'

type Props = {
  states: Record<string, SystemState>
  snapshots: Record<string, ScoreSnapshot>
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
  accent,
  label,
  children,
}: {
  accent: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div
      className="flex-1 min-w-0 rounded-lg px-4 py-3 flex flex-col gap-1"
      style={{
        backgroundColor: '#0e0e22',
        border: '1px solid #1a1a35',
        borderTop: `2px solid ${accent}`,
      }}
    >
      <div className="text-[11px] font-medium" style={{ color: '#8888a0' }}>
        {label}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

// ── Zone Card ─────────────────────────────────────────────────────────────────
function ZoneCard({
  zone,
  score,
  systemCount,
}: {
  zone: (typeof ZONES)[number]
  score: number
  systemCount: number
}) {
  const progress = Math.min(score / 100, 1)

  return (
    <div
      className="flex-1 min-w-0 rounded-lg px-3 py-2.5 flex flex-col gap-2"
      style={{
        backgroundColor: '#0e0e22',
        border: '1px solid #1a1a35',
      }}
    >
      {/* Zone name row */}
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: zone.color }}
        />
        <span className="text-[11px] font-semibold truncate" style={{ color: '#e0e0f0' }}>
          {zone.name}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums" style={{ color: '#e0e0f0' }}>
          {score}
        </span>
        <span className="text-[11px]" style={{ color: '#8888a0' }}>점</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1a1a35' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress * 100}%`, backgroundColor: zone.color }}
        />
      </div>

      {/* Bottom: system count + target month */}
      <div className="flex items-center justify-between">
        <span className="text-[10px]" style={{ color: '#8888a0' }}>
          {systemCount}개
        </span>
        <span className="text-[10px]" style={{ color: '#8888a0' }}>
          {zone.defaultTargetMonth}
        </span>
      </div>
    </div>
  )
}

// ── Main Header ───────────────────────────────────────────────────────────────
export default function Header({ states }: Props) {
  const totalScore = getTotalScore(states)

  // Stage distribution counts
  const stageCounts = new Array(7).fill(0) as number[]
  for (const sys of SYSTEMS) {
    const stage = getStageFromScore(states[sys.id]?.score ?? 0)
    stageCounts[stage] = (stageCounts[stage] ?? 0) + 1
  }

  // Stage names for distribution display
  const stageNames = STAGES.map(s => s.name)

  // Count systems at stage >= 3 (도입 이상)
  const deployedCount = SYSTEMS.filter(sys => getStageFromScore(states[sys.id]?.score ?? 0) >= 3).length

  // Value per deployed system (roughly 1억 each, simplified)
  const speedValue = `+약 ${deployedCount}억`

  return (
    <div className="space-y-3">
      {/* KPI Cards row */}
      <div className="flex gap-3">
        {/* 1. 전체 평균 점수 */}
        <KpiCard accent="#378add" label="전체 평균 점수">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums" style={{ color: '#e0e0f0' }}>
              {totalScore}
            </span>
            <span className="text-sm" style={{ color: '#8888a0' }}>/ 100</span>
          </div>
        </KpiCard>

        {/* 2. 단계 분포 */}
        <KpiCard accent="#7f77dd" label="단계 분포">
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
            {stageNames.map((name, i) => (
              <span key={i} className="text-xs tabular-nums" style={{ color: '#e0e0f0' }}>
                {name}{' '}
                <span className="font-bold">{stageCounts[i] ?? 0}</span>
              </span>
            ))}
          </div>
        </KpiCard>

        {/* 3. 속도 환산 가치 */}
        <KpiCard accent="#1d9e75" label="속도 환산 가치">
          <div className="text-2xl font-bold tabular-nums" style={{ color: '#1d9e75' }}>
            {speedValue}
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: '#8888a0' }}>
            도입 이상 시스템 {deployedCount}개 기준
          </div>
        </KpiCard>

        {/* 4. 목표 달성 시 */}
        <KpiCard accent="#d85a30" label="목표 달성 시">
          <div className="text-2xl font-bold" style={{ color: '#d85a30' }}>
            +120억
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: '#8888a0' }}>
            연간 운영 효율 목표
          </div>
        </KpiCard>
      </div>

      {/* Zone Cards row */}
      <div className="flex gap-3">
        {ZONES.map(zone => {
          const zoneScore = getZoneScore(zone.id, states)
          const systemCount = SYSTEMS.filter(s => s.zoneId === zone.id).length
          return (
            <ZoneCard
              key={zone.id}
              zone={zone}
              score={zoneScore}
              systemCount={systemCount}
            />
          )
        })}
      </div>
    </div>
  )
}
