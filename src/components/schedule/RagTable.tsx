import { useState } from 'react'
import { SYSTEMS } from '../../data/systems'
import { ZONE_MAP } from '../../data/zones'
import { STAGE_MAP } from '../../data/stages'
import { getStageFromScore, calcSPI, getSPIStatus, calcExpectedProgress } from '../../lib/score'
import { calcDelta } from '../../hooks/useSnapshots'
import type { SystemState, Member, ScoreSnapshot } from '../../types'

type Props = {
  states: Record<string, SystemState>
  members: Member[]
  snapshots: Record<string, ScoreSnapshot>
  now: string
}

function RagDot({ spi }: { spi: number }) {
  const color =
    spi < 0.7 ? 'bg-red-500' : spi < 0.9 ? 'bg-amber-400' : 'bg-emerald-400'
  return <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
}

function TrendArrow({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-slate-600">—</span>
  if (delta > 0) return <span className="text-emerald-400 font-bold">↗</span>
  if (delta < 0) return <span className="text-red-400 font-bold">↘</span>
  return <span className="text-slate-400">→</span>
}

function PlanVsActualBar({
  actualPct,
  expectedPct,
  spi,
}: {
  actualPct: number
  expectedPct: number
  spi: number
}) {
  const barColor =
    spi < 0.7 ? 'bg-red-500' : spi < 0.9 ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden w-24">
      <div
        className={`absolute left-0 top-0 h-full rounded-full ${barColor}`}
        style={{ width: `${Math.min(actualPct, 100)}%` }}
      />
      <div
        className="absolute top-0 w-px h-full bg-slate-400/70"
        style={{ left: `${Math.min(expectedPct, 100)}%` }}
      />
    </div>
  )
}

type RowData = {
  id: string
  name: string
  ownerName: string
  zoneName: string
  zoneColor: string
  stageName: string
  score: number
  expectedPct: number
  spi: number
  delta: number | null
  state: SystemState
}

export default function RagTable({ states, members, snapshots, now }: Props) {
  const [showNormal, setShowNormal] = useState(false)

  const rows: RowData[] = SYSTEMS.map(sys => {
    const state = states[sys.id] ?? {
      system_id: sys.id,
      score: 0,
      status: 'normal' as const,
      status_reason: null,
      owner_id: null,
      start_month: '2026-04',
      target_month: '2027-12',
      note: null,
      updated_at: new Date().toISOString(),
      updated_by: null,
    }
    const zone = ZONE_MAP[sys.zoneId]
    const score = state.score
    const spi = calcSPI(state, now)
    const expected = calcExpectedProgress(state.start_month, state.target_month, now)
    const expectedPct = Math.round(expected * 100)
    const delta = calcDelta(sys.id, score, snapshots)
    const owner = members.find(m => m.id === state.owner_id)
    const stageDef = STAGE_MAP[getStageFromScore(state.score)]

    return {
      id: sys.id,
      name: sys.name,
      ownerName: owner?.name ?? '—',
      zoneName: zone?.name ?? '',
      zoneColor: zone?.color ?? '#888',
      stageName: stageDef?.name ?? '미착수',
      score,
      expectedPct,
      spi,
      delta,
      state,
    }
  }).sort((a, b) => a.spi - b.spi)

  const atRisk = rows.filter(r => r.spi < 0.9)
  const normal = rows.filter(r => r.spi >= 0.9)

  function renderRow(row: RowData, tinted: boolean) {
    const spiStatus = getSPIStatus(row.spi)
    const rowBg = tinted
      ? spiStatus === 'danger'
        ? 'bg-red-950/20'
        : 'bg-amber-950/20'
      : ''

    return (
      <tr key={row.id} className={`border-b border-slate-800 hover:bg-slate-800/30 transition-colors ${rowBg}`}>
        {/* RAG dot */}
        <td className="px-3 py-2.5 w-8">
          <RagDot spi={row.spi} />
        </td>

        {/* Zone badge */}
        <td className="px-2 py-2.5 w-20">
          <span
            className="text-xs px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap"
            style={{
              backgroundColor: row.zoneColor + '25',
              color: row.zoneColor,
              border: `1px solid ${row.zoneColor}50`,
            }}
          >
            {row.zoneName}
          </span>
        </td>

        {/* System name + owner */}
        <td className="px-2 py-2.5 min-w-[120px]">
          <div className="text-sm font-medium text-white leading-tight">{row.name}</div>
          <div className="text-xs text-slate-500">{row.ownerName}</div>
        </td>

        {/* Stage */}
        <td className="px-2 py-2.5 w-16 text-xs text-slate-300">{row.stageName}</td>

        {/* Score */}
        <td className="px-2 py-2.5 w-16 text-right">
          <span
            className={`text-sm font-bold tabular-nums ${
              row.score >= 70
                ? 'text-emerald-400'
                : row.score >= 40
                ? 'text-amber-400'
                : 'text-red-400'
            }`}
          >
            {row.score}
          </span>
          <span className="text-xs text-slate-600">점</span>
        </td>

        {/* Plan vs Actual bar (hidden on tablet <1024px) */}
        <td className="px-2 py-2.5 w-32 hidden lg:table-cell">
          <div className="flex flex-col gap-0.5">
            <PlanVsActualBar
              actualPct={row.score}
              expectedPct={row.expectedPct}
              spi={row.spi}
            />
            <div className="text-xs text-slate-600">
              {row.score}% / 계획 {row.expectedPct}%
            </div>
          </div>
        </td>

        {/* SPI */}
        <td className="px-2 py-2.5 w-16 text-right">
          <span
            className={`text-sm font-bold tabular-nums ${
              row.spi < 0.7
                ? 'text-red-400'
                : row.spi < 0.9
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {row.spi.toFixed(2)}
          </span>
        </td>

        {/* Trend */}
        <td className="px-3 py-2.5 w-10 text-center">
          <TrendArrow delta={row.delta} />
        </td>
      </tr>
    )
  }

  return (
    <div className="px-4 pb-4">
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/50">
              <th className="px-3 py-2 text-xs text-slate-500 font-medium w-8">RAG</th>
              <th className="px-2 py-2 text-xs text-slate-500 font-medium w-20">존</th>
              <th className="px-2 py-2 text-xs text-slate-500 font-medium min-w-[120px]">시스템</th>
              <th className="px-2 py-2 text-xs text-slate-500 font-medium w-16">단계</th>
              <th className="px-2 py-2 text-xs text-slate-500 font-medium w-16 text-right">점수</th>
              <th className="px-2 py-2 text-xs text-slate-500 font-medium w-32 hidden lg:table-cell">계획 vs 실제</th>
              <th className="px-2 py-2 text-xs text-slate-500 font-medium w-16 text-right">SPI</th>
              <th className="px-3 py-2 text-xs text-slate-500 font-medium w-10 text-center">추세</th>
            </tr>
          </thead>
          <tbody>
            {/* At-risk rows (always shown) */}
            {atRisk.map(row => renderRow(row, true))}

            {/* Normal section toggle */}
            {normal.length > 0 && (
              <tr className="border-b border-slate-800">
                <td colSpan={8}>
                  <button
                    onClick={() => setShowNormal(s => !s)}
                    className="w-full py-2 px-3 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-colors flex items-center gap-2"
                  >
                    <span className="flex-1 border-t border-slate-700" />
                    <span className="shrink-0">
                      {showNormal ? '▲' : '▼'} 정상 ({normal.length}개 시스템)
                    </span>
                    <span className="flex-1 border-t border-slate-700" />
                  </button>
                </td>
              </tr>
            )}

            {/* Normal rows (collapsible) */}
            {showNormal && normal.map(row => renderRow(row, false))}
          </tbody>
        </table>

        {atRisk.length === 0 && (
          <div className="py-8 text-center text-sm text-slate-500">
            모든 시스템이 계획 대비 정상 진행 중입니다
          </div>
        )}
      </div>
    </div>
  )
}
