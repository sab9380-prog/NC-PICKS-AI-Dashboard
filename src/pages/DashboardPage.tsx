import { useState } from 'react'
import { useSystems } from '../hooks/useSystems'
import { useMembers } from '../hooks/useMembers'
import { useSnapshots } from '../hooks/useSnapshots'
import { useAuth } from '../hooks/useAuth'
import { ZONES } from '../data/zones'
import { SYSTEMS } from '../data/systems'
import AppShell from '../components/layout/AppShell'
import Header from '../components/layout/Header'
import StageLegend from '../components/status/StageLegend'
import StatusFilter, { type FilterValue } from '../components/status/StatusFilter'
import ZoneGroup from '../components/status/ZoneGroup'

function StatusTab({
  states,
  members,
  snapshots,
  filter,
  setFilter,
  onUpdate,
  readOnly,
}: {
  states: ReturnType<typeof useSystems>['states']
  members: ReturnType<typeof useMembers>['members']
  snapshots: ReturnType<typeof useSnapshots>['latestSnapshots']
  filter: FilterValue
  setFilter: (v: FilterValue) => void
  onUpdate: ReturnType<typeof useSystems>['updateSystem']
  readOnly: boolean
}) {
  // Calculate filter counts
  const counts = SYSTEMS.reduce(
    (acc, sys) => {
      const status = states[sys.id]?.status ?? 'normal'
      acc.all++
      if (status === 'normal') acc.normal++
      else if (status === 'delay') acc.delay++
      else if (status === 'hold') acc.hold++
      return acc
    },
    { all: 0, normal: 0, delay: 0, hold: 0 },
  )

  return (
    <div className="p-4 space-y-4">
      {/* Stage legend */}
      <StageLegend />

      {/* Filter */}
      <StatusFilter value={filter} onChange={setFilter} counts={counts} />

      {/* Zone groups */}
      <div>
        {ZONES.map(zone => (
          <ZoneGroup
            key={zone.id}
            zone={zone}
            states={states}
            members={members}
            snapshots={snapshots}
            filter={filter}
            onUpdate={onUpdate}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  )
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-slate-600 text-sm">
      {label} — 준비중
    </div>
  )
}

export default function DashboardPage() {
  const { states, updateSystem, resetAll } = useSystems()
  const { activeMembers } = useMembers()
  const { latestSnapshots } = useSnapshots()
  const { currentMember, logout } = useAuth()
  const [filter, setFilter] = useState<FilterValue>('all')
  const [showAdmin, setShowAdmin] = useState(false)

  const readOnly = !currentMember || currentMember.id === 'guest'

  function handleSettingsClick() {
    setShowAdmin(s => !s)
  }

  return (
    <>
      <AppShell
        readOnly={readOnly}
        onSettingsClick={handleSettingsClick}
        header={
          <Header states={states} snapshots={latestSnapshots} />
        }
        statusTab={
          <StatusTab
            states={states}
            members={activeMembers}
            snapshots={latestSnapshots}
            filter={filter}
            setFilter={setFilter}
            onUpdate={updateSystem}
            readOnly={readOnly}
          />
        }
        scheduleTab={<PlaceholderTab label="일정 현황" />}
        timelineTab={<PlaceholderTab label="타임라인" />}
      />

      {/* Admin panel overlay (placeholder) */}
      {showAdmin && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAdmin(false)}
          />
          <div className="relative bg-slate-900 border border-slate-700 w-80 min-h-screen p-6 shadow-2xl">
            <h2 className="text-lg font-bold mb-4">설정</h2>

            <div className="space-y-4 text-sm">
              <div className="text-slate-400">
                현재 사용자:{' '}
                <span className="text-white font-medium">
                  {currentMember?.name ?? '없음'}
                </span>
              </div>

              <button
                onClick={() => { logout(); setShowAdmin(false) }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-lg py-2 transition-colors"
              >
                로그아웃
              </button>

              <hr className="border-slate-700" />

              <button
                onClick={() => {
                  if (window.confirm('모든 시스템 상태를 초기화하시겠습니까?')) {
                    resetAll()
                    setShowAdmin(false)
                  }
                }}
                className="w-full bg-red-900/40 hover:bg-red-900/70 text-red-400 rounded-lg py-2 transition-colors border border-red-800/50"
              >
                전체 초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
