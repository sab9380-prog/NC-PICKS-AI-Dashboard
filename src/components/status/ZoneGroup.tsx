import { useState } from 'react'
import { SYSTEMS } from '../../data/systems'
import { getZoneScore } from '../../lib/score'
import SystemCard from './SystemCard'
import type { Zone, SystemState, Member, ScoreSnapshot } from '../../types'
import type { FilterValue } from './StatusFilter'

type Props = {
  zone: Zone
  states: Record<string, SystemState>
  members: Member[]
  snapshots: Record<string, ScoreSnapshot>
  filter: FilterValue
  onUpdate: (systemId: string, updates: Partial<SystemState>) => void
  readOnly?: boolean
}

function matchesFilter(state: SystemState | undefined, filter: FilterValue): boolean {
  if (filter === 'all') return true
  const status = state?.status ?? 'normal'
  return status === filter
}

export default function ZoneGroup({
  zone,
  states,
  members,
  snapshots,
  filter,
  onUpdate,
  readOnly = false,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)

  const zoneSystems = SYSTEMS.filter(s => s.zoneId === zone.id)
  const filteredSystems = zoneSystems.filter(s => matchesFilter(states[s.id], filter))

  // Don't render zone at all if filter hides everything
  if (filteredSystems.length === 0 && filter !== 'all') return null

  const zoneScore = getZoneScore(zone.id, states)

  return (
    <div className="mb-6">
      {/* Zone header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center gap-3 py-2 px-1 text-left hover:opacity-80 transition-opacity"
      >
        {/* Collapse indicator */}
        <span className="text-slate-500 text-xs">{collapsed ? '▶' : '▼'}</span>

        {/* Zone color badge */}
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: zone.color }}
        />

        {/* Zone name */}
        <span className="font-semibold text-white text-sm">{zone.name}</span>

        {/* Zone meta */}
        <span className="text-xs text-slate-500">AI {zone.ai_pct}%</span>
        <span className="text-xs text-slate-500">목표 {zone.target}</span>
        <span className="text-xs text-slate-600">{zoneSystems.length}개 시스템</span>

        {/* Zone score */}
        <span
          className={`ml-auto text-lg font-bold tabular-nums ${
            zoneScore >= 70
              ? 'text-emerald-400'
              : zoneScore >= 40
              ? 'text-amber-400'
              : 'text-red-400'
          }`}
        >
          {zoneScore}
        </span>
        <span className="text-xs text-slate-500">pt</span>
      </button>

      {/* System cards */}
      {!collapsed && (
        <div className="space-y-3 mt-2">
          {filteredSystems.map(sys => (
            <SystemCard
              key={sys.id}
              system={sys}
              state={states[sys.id] ?? {
                system_id: sys.id,
                stage: 0,
                status: 'normal',
                status_reason: null,
                owner_id: null,
                start_month: '2026-04',
                target_month: zone.defaultTargetMonth,
                note: null,
                updated_at: new Date().toISOString(),
                updated_by: null,
              }}
              zone={zone}
              members={members}
              snapshots={snapshots}
              onUpdate={onUpdate}
              readOnly={readOnly}
            />
          ))}
          {filteredSystems.length === 0 && (
            <div className="text-sm text-slate-600 px-2 py-4 text-center">
              해당 필터에 맞는 시스템이 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
