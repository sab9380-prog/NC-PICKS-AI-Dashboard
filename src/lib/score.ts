import { STAGE_POINTS } from '../data/stages'
import { SYSTEMS } from '../data/systems'
import type { SystemState, SPIStatus } from '../types'

export function getSystemScore(stage: number): number {
  return STAGE_POINTS[stage] ?? 0
}

export function getZoneScore(zoneId: string, states: Record<string, SystemState>): number {
  const zoneSystems = SYSTEMS.filter(s => s.zoneId === zoneId)
  if (zoneSystems.length === 0) return 0
  const total = zoneSystems.reduce((sum, s) => sum + getSystemScore(states[s.id]?.stage ?? 0), 0)
  return Math.round(total / zoneSystems.length)
}

export function getTotalScore(states: Record<string, SystemState>): number {
  if (SYSTEMS.length === 0) return 0
  const total = SYSTEMS.reduce((sum, s) => sum + getSystemScore(states[s.id]?.stage ?? 0), 0)
  return Math.round(total / SYSTEMS.length)
}

export function getScoreColor(score: number): SPIStatus {
  if (score >= 70) return 'ok'
  if (score >= 40) return 'warning'
  return 'danger'
}

function monthToIndex(ym: string): number {
  const [y, m] = ym.split('-').map(Number)
  return (y - 2026) * 12 + (m - 1)
}

export function calcElapsedRatio(startMonth: string, targetMonth: string, now: string): number {
  const start = monthToIndex(startMonth)
  const target = monthToIndex(targetMonth)
  const current = monthToIndex(now)
  if (target === start) return 1
  return (current - start) / (target - start)
}

export function calcExpectedProgress(startMonth: string, targetMonth: string, now: string): number {
  return Math.max(0, Math.min(1, calcElapsedRatio(startMonth, targetMonth, now)))
}

export function calcSPI(state: SystemState, now: string): number {
  const start = monthToIndex(state.start_month)
  const current = monthToIndex(now)
  if (current <= start) return 1.0
  const elapsed = calcElapsedRatio(state.start_month, state.target_month, now)
  if (elapsed <= 0) return 1.0
  const progress = getSystemScore(state.stage) / 100
  return progress / elapsed
}

export function getSPIStatus(spi: number): SPIStatus {
  if (spi >= 0.9) return 'ok'
  if (spi >= 0.7) return 'warning'
  return 'danger'
}

export function calcDelayDays(state: SystemState, now: string): number {
  const spi = calcSPI(state, now)
  if (spi >= 1.0) return 0
  const start = monthToIndex(state.start_month)
  const target = monthToIndex(state.target_month)
  const totalDuration = (target - start) * 30
  const progress = getSystemScore(state.stage) / 100
  const expected = calcExpectedProgress(state.start_month, state.target_month, now)
  return Math.round((expected - progress) * totalDuration)
}
