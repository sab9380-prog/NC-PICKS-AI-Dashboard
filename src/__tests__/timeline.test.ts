import { describe, it, expect } from 'vitest'
import { monthToIndex, indexToPercent, getGanttBar } from '../lib/timeline'

describe('monthToIndex', () => {
  it('2026-01 is index 0', () => {
    expect(monthToIndex('2026-01')).toBe(0)
  })
  it('2026-04 is index 3', () => {
    expect(monthToIndex('2026-04')).toBe(3)
  })
  it('2027-12 is index 23', () => {
    expect(monthToIndex('2027-12')).toBe(23)
  })
})

describe('indexToPercent', () => {
  it('index 0 is 0%', () => {
    expect(indexToPercent(0)).toBe(0)
  })
  it('index 12 is 50%', () => {
    expect(indexToPercent(12)).toBe(50)
  })
})

describe('getGanttBar', () => {
  it('calculates bar position and width', () => {
    const bar = getGanttBar('2026-04', '2026-12', 40)
    expect(bar.leftPct).toBeCloseTo(3 / 24 * 100, 1)
    expect(bar.widthPct).toBeGreaterThan(0)
    expect(bar.fillPct).toBeGreaterThan(0)
    expect(bar.fillPct).toBeLessThanOrEqual(bar.widthPct)
  })
})
