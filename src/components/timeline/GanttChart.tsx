import { useState } from 'react'
import { ZONES } from '../../data/zones'
import { SYSTEM_MAP } from '../../data/systems'
import { TIMELINE_MONTHS, getTodayPct, indexToMonth } from '../../lib/timeline'
import GanttZoneGroup from './GanttZoneGroup'
import type { SystemState, Member } from '../../types'

type Props = {
  states: Record<string, SystemState>
  members: Member[]
  now: string
  onUpdateDates: (systemId: string, updates: Partial<SystemState>) => void
  readOnly?: boolean
}

type DateEditModal = {
  systemId: string
  startMonth: string
  targetMonth: string
}

// Build year/month header data
function buildHeaders(): { year2026: number; year2027: number; months: { label: string; idx: number }[] } {
  const months: { label: string; idx: number }[] = []
  for (let i = 0; i < TIMELINE_MONTHS; i++) {
    const ym = indexToMonth(i)
    const [, m] = ym.split('-')
    months.push({ label: m, idx: i })
  }
  // 2026: months 0-11, 2027: months 12-23
  return { year2026: 12, year2027: 12, months }
}

export default function GanttChart({ states, members, now, onUpdateDates, readOnly = false }: Props) {
  const [editModal, setEditModal] = useState<DateEditModal | null>(null)
  const todayPct = getTodayPct(now)
  const { months } = buildHeaders()
  const nowYearMonth = now // e.g. "2026-04"

  function handleEditDates(systemId: string) {
    const state = states[systemId]
    if (!state) return
    setEditModal({
      systemId,
      startMonth: state.start_month,
      targetMonth: state.target_month,
    })
  }

  function handleSaveDates() {
    if (!editModal) return
    onUpdateDates(editModal.systemId, {
      start_month: editModal.startMonth,
      target_month: editModal.targetMonth,
    })
    setEditModal(null)
  }

  function handleCancelEdit() {
    setEditModal(null)
  }

  const editSystem = editModal ? SYSTEM_MAP[editModal.systemId] : null

  return (
    <div className="p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        {/* Scroll container */}
        <div className="overflow-x-auto">
          <div style={{ minWidth: '900px' }}>
            {/* Year header row */}
            <div className="flex border-b border-slate-700 bg-slate-800/60">
              {/* Left sticky label placeholder */}
              <div className="sticky left-0 z-20 bg-slate-800/60 w-[220px] shrink-0 border-r border-slate-700 flex items-center px-3 py-1.5">
                <span className="text-xs text-slate-500 font-medium">시스템</span>
              </div>
              {/* Year labels */}
              <div className="flex-1 flex">
                <div
                  className="flex items-center justify-center text-xs font-semibold text-slate-300 border-r border-slate-700"
                  style={{ width: '50%' }}
                >
                  2026
                </div>
                <div
                  className="flex items-center justify-center text-xs font-semibold text-slate-300"
                  style={{ width: '50%' }}
                >
                  2027
                </div>
              </div>
            </div>

            {/* Month header row */}
            <div className="flex border-b border-slate-700 bg-slate-800/40">
              {/* Left sticky label placeholder */}
              <div className="sticky left-0 z-20 bg-slate-800/40 w-[220px] shrink-0 border-r border-slate-700" />
              {/* Month labels */}
              <div className="flex-1 relative flex">
                {months.map(({ label, idx }) => {
                  const ym = indexToMonth(idx)
                  const isCurrent = ym === nowYearMonth
                  return (
                    <div
                      key={idx}
                      className={`flex-1 text-center text-xs py-1 border-r border-slate-800 last:border-r-0 ${
                        isCurrent
                          ? 'bg-blue-600/30 text-blue-300 font-bold'
                          : 'text-slate-500'
                      }`}
                    >
                      {label}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Zone groups with today marker overlay */}
            <div className="relative">
              {/* Today vertical line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-blue-500/70 z-10 pointer-events-none"
                style={{
                  // todayPct is relative to the full grid width (right area)
                  // We need to position within the right area only
                  left: `calc(220px + (100% - 220px) * ${todayPct / 100})`,
                }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                </div>
              </div>

              {/* Zone groups */}
              {ZONES.map(zone => (
                <GanttZoneGroup
                  key={zone.id}
                  zone={zone}
                  states={states}
                  members={members}
                  now={now}
                  onEditDates={readOnly ? undefined : handleEditDates}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Date edit modal */}
      {editModal && editSystem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={handleCancelEdit}
          />
          <div className="relative bg-slate-900 border border-slate-700 rounded-xl p-6 w-80 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white">날짜 수정</h3>
            <p className="text-sm text-slate-400">{editSystem.name}</p>

            <div className="space-y-3">
              <label className="block">
                <span className="text-xs text-slate-400 mb-1 block">시작 월</span>
                <input
                  type="month"
                  value={editModal.startMonth}
                  onChange={e =>
                    setEditModal(prev => prev ? { ...prev, startMonth: e.target.value } : prev)
                  }
                  min="2026-01"
                  max="2027-12"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-xs text-slate-400 mb-1 block">목표 월</span>
                <input
                  type="month"
                  value={editModal.targetMonth}
                  onChange={e =>
                    setEditModal(prev => prev ? { ...prev, targetMonth: e.target.value } : prev)
                  }
                  min="2026-01"
                  max="2027-12"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg py-2 text-sm transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveDates}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
