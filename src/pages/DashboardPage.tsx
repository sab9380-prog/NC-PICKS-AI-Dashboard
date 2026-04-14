import { useState, useMemo } from 'react'
import { useSystems } from '../hooks/useSystems'
import { useMembers } from '../hooks/useMembers'
import { useSnapshots } from '../hooks/useSnapshots'
import { useAuth } from '../hooks/useAuth'
import { SYSTEMS } from '../data/systems'
import AppShell from '../components/layout/AppShell'
import Header from '../components/layout/Header'
import StageLegend from '../components/status/StageLegend'
import StatusFilter, { type FilterValue } from '../components/status/StatusFilter'
import SystemTable from '../components/status/SystemTable'
import AlertPanel from '../components/schedule/AlertPanel'
import RagTable from '../components/schedule/RagTable'
import GanttChart from '../components/timeline/GanttChart'
import AdminPanel from '../components/admin/AdminPanel'
import WeeklyTab from '../components/weekly/WeeklyTab'

const NOW = '2026-04'

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
    <div className="p-4 space-y-4" style={{ backgroundColor: '#080812' }}>
      {/* Stage legend */}
      <StageLegend />

      {/* Filter */}
      <StatusFilter value={filter} onChange={setFilter} counts={counts} />

      {/* System table */}
      <SystemTable
        states={states}
        members={members}
        snapshots={snapshots}
        filter={filter}
        onUpdate={onUpdate}
        readOnly={readOnly}
      />
    </div>
  )
}

function ScheduleTab({
  states,
  members,
  snapshots,
}: {
  states: ReturnType<typeof useSystems>['states']
  members: ReturnType<typeof useMembers>['members']
  snapshots: ReturnType<typeof useSnapshots>['latestSnapshots']
}) {
  return (
    <div className="space-y-0">
      <AlertPanel states={states} members={members} now={NOW} />
      <RagTable states={states} members={members} snapshots={snapshots} now={NOW} />
    </div>
  )
}

function TimelineTab({
  states,
  members,
  onUpdate,
  readOnly,
}: {
  states: ReturnType<typeof useSystems>['states']
  members: ReturnType<typeof useMembers>['members']
  onUpdate: ReturnType<typeof useSystems>['updateSystem']
  readOnly: boolean
}) {
  return (
    <GanttChart
      states={states}
      members={members}
      now={NOW}
      onUpdateDates={(systemId, updates) => onUpdate(systemId, updates)}
      readOnly={readOnly}
    />
  )
}

export default function DashboardPage() {
  const { states, updateSystem } = useSystems()
  const { activeMembers, members: allMembers } = useMembers()
  const { latestSnapshots, snapshots } = useSnapshots()
  const { currentMember } = useAuth()
  const [filter, setFilter] = useState<FilterValue>('all')
  const [showAdmin, setShowAdmin] = useState(false)

  const readOnly = !currentMember || currentMember.id === 'guest'

  // Member map for WeeklyTab (id -> Member)
  const memberMap = useMemo(
    () => Object.fromEntries(allMembers.map(m => [m.id, m])),
    [allMembers],
  )

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
        weeklyTab={
          <WeeklyTab
            snapshots={snapshots}
            states={states}
            members={memberMap}
          />
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
        scheduleTab={
          <ScheduleTab
            states={states}
            members={activeMembers}
            snapshots={latestSnapshots}
          />
        }
        timelineTab={
          <TimelineTab
            states={states}
            members={activeMembers}
            onUpdate={updateSystem}
            readOnly={readOnly}
          />
        }
      />

      {/* Admin panel */}
      {showAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}
    </>
  )
}
