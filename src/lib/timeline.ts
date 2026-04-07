export const TIMELINE_START_YEAR = 2026
export const TIMELINE_START_MONTH = 1
export const TIMELINE_MONTHS = 24

export function monthToIndex(ym: string): number {
  const [y, m] = ym.split('-').map(Number)
  return (y - TIMELINE_START_YEAR) * 12 + (m - TIMELINE_START_MONTH)
}

export function indexToMonth(index: number): string {
  const year = TIMELINE_START_YEAR + Math.floor((TIMELINE_START_MONTH - 1 + index) / 12)
  const month = ((TIMELINE_START_MONTH - 1 + index) % 12) + 1
  return `${year}-${String(month).padStart(2, '0')}`
}

export function indexToPercent(index: number): number {
  return (index / TIMELINE_MONTHS) * 100
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

export function getGanttBar(startMonth: string, targetMonth: string, score: number) {
  const startIdx = clamp(monthToIndex(startMonth), 0, TIMELINE_MONTHS - 1)
  const endIdx = clamp(monthToIndex(targetMonth), startIdx, TIMELINE_MONTHS - 1)
  const barSpan = endIdx - startIdx + 1
  const widthPct = (barSpan / TIMELINE_MONTHS) * 100
  const fillPct = widthPct * (score / 100)
  return { leftPct: indexToPercent(startIdx), widthPct, fillPct }
}

export function getTodayPct(now: string): number {
  const idx = monthToIndex(now) + 0.5
  return indexToPercent(idx)
}
