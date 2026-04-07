import { describe, it, expect } from 'vitest'
import {
  getSystemScore,
  getZoneScore,
  getTotalScore,
  getScoreColor,
  calcSPI,
  getSPIStatus,
  calcDelayDays,
} from '../lib/score'
import type { SystemState } from '../types'

function makeState(overrides: Partial<SystemState> = {}): SystemState {
  return {
    system_id: 's01',
    stage: 0,
    status: 'normal',
    status_reason: null,
    owner_id: null,
    start_month: '2026-01',
    target_month: '2026-12',
    note: null,
    updated_at: '2026-04-07T00:00:00Z',
    updated_by: null,
    ...overrides,
  }
}

describe('getSystemScore', () => {
  it('returns 0 for stage 0', () => {
    expect(getSystemScore(0)).toBe(0)
  })
  it('returns 40 for stage 3 (도입)', () => {
    expect(getSystemScore(3)).toBe(40)
  })
  it('returns 100 for stage 6 (자동화)', () => {
    expect(getSystemScore(6)).toBe(100)
  })
})

describe('getZoneScore', () => {
  it('averages scores for systems in a zone', () => {
    const states: Record<string, SystemState> = {
      s01: makeState({ system_id: 's01', stage: 3 }),
      s02: makeState({ system_id: 's02', stage: 4 }),
      s03: makeState({ system_id: 's03', stage: 1 }),
    }
    expect(getZoneScore('01', states)).toBe(37)
  })
})

describe('getTotalScore', () => {
  it('averages all 18 system scores', () => {
    const states: Record<string, SystemState> = {}
    for (let i = 1; i <= 18; i++) {
      const id = `s${String(i).padStart(2, '0')}`
      states[id] = makeState({ system_id: id, stage: 0 })
    }
    expect(getTotalScore(states)).toBe(0)
  })
})

describe('getScoreColor', () => {
  it('returns danger for score < 40', () => {
    expect(getScoreColor(39)).toBe('danger')
  })
  it('returns warning for score 40-69', () => {
    expect(getScoreColor(40)).toBe('warning')
    expect(getScoreColor(69)).toBe('warning')
  })
  it('returns ok for score >= 70', () => {
    expect(getScoreColor(70)).toBe('ok')
  })
})

describe('calcSPI', () => {
  it('returns 1.0 before start month', () => {
    const state = makeState({ start_month: '2026-06', target_month: '2026-12', stage: 0 })
    expect(calcSPI(state, '2026-04')).toBe(1.0)
  })
  it('calculates SPI correctly mid-project', () => {
    const state = makeState({ start_month: '2026-01', target_month: '2027-01', stage: 3 })
    expect(calcSPI(state, '2026-04')).toBeCloseTo(1.6, 1)
  })
  it('returns low SPI for behind-schedule system', () => {
    const state = makeState({ start_month: '2026-01', target_month: '2026-12', stage: 1 })
    expect(calcSPI(state, '2026-07')).toBeCloseTo(0.183, 2)
  })
})

describe('getSPIStatus', () => {
  it('returns danger for SPI < 0.7', () => {
    expect(getSPIStatus(0.5)).toBe('danger')
  })
  it('returns warning for SPI 0.7-0.89', () => {
    expect(getSPIStatus(0.8)).toBe('warning')
  })
  it('returns ok for SPI >= 0.9', () => {
    expect(getSPIStatus(1.0)).toBe('ok')
  })
})

describe('calcDelayDays', () => {
  it('returns 0 when on or ahead of schedule', () => {
    const state = makeState({ start_month: '2026-01', target_month: '2027-01', stage: 3 })
    expect(calcDelayDays(state, '2026-04')).toBe(0)
  })
  it('returns positive days when behind schedule', () => {
    const state = makeState({ start_month: '2026-01', target_month: '2026-12', stage: 1 })
    const days = calcDelayDays(state, '2026-07')
    expect(days).toBeGreaterThan(0)
  })
})
