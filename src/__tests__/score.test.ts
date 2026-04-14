import { describe, it, expect } from 'vitest'
import {
  getSystemScore,
  getStageFromScore,
  getZoneScore,
  getTotalScore,
  getScoreColor,
  calcSPI,
  getSPIStatus,
  calcDelayDays,
} from '../lib/score'
import { STAGE_POINTS } from '../data/stages'
import type { SystemState } from '../types'

function makeState(overrides: Partial<SystemState> = {}): SystemState {
  return {
    system_id: 's01',
    score: 0,
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

describe('getStageFromScore', () => {
  // 기준점과 정확히 같으면 해당 단계, 초과해야 다음 단계
  it('returns 0 for score 0 (L0 미착수)', () => {
    expect(getStageFromScore(0)).toBe(0)
  })
  it('returns 1 for score 1 (L1 기획 진입)', () => {
    expect(getStageFromScore(1)).toBe(1)
  })
  it('returns 1 for score 10 (L1 기획 — 기준점 정확히)', () => {
    expect(getStageFromScore(10)).toBe(1)
  })
  it('returns 2 for score 11 (L2 개발 진입)', () => {
    expect(getStageFromScore(11)).toBe(2)
  })
  it('returns 2 for score 25 (L2 개발 — 기준점 정확히)', () => {
    expect(getStageFromScore(25)).toBe(2)
  })
  it('returns 3 for score 26 (L3 도입 진입)', () => {
    expect(getStageFromScore(26)).toBe(3)
  })
  it('returns 3 for score 40 (L3 도입 — 기준점 정확히)', () => {
    expect(getStageFromScore(40)).toBe(3)
  })
  it('returns 4 for score 41 (L4 활용 진입)', () => {
    expect(getStageFromScore(41)).toBe(4)
  })
  it('returns 4 for score 60 (L4 활용 — 기준점 정확히)', () => {
    expect(getStageFromScore(60)).toBe(4)
  })
  it('returns 5 for score 61 (L5 최적화 진입)', () => {
    expect(getStageFromScore(61)).toBe(5)
  })
  it('returns 5 for score 80 (L5 최적화 — 기준점 정확히)', () => {
    expect(getStageFromScore(80)).toBe(5)
  })
  it('returns 6 for score 81 (L6 자동화 진입)', () => {
    expect(getStageFromScore(81)).toBe(6)
  })
  it('returns 6 for score 100 (L6 자동화 — 기준점 정확히)', () => {
    expect(getStageFromScore(100)).toBe(6)
  })
})

describe('getSystemScore', () => {
  it('returns 0 for score 0', () => {
    expect(getSystemScore(makeState({ score: STAGE_POINTS[0] }))).toBe(0)
  })
  it('returns 40 for stage 3 (도입)', () => {
    expect(getSystemScore(makeState({ score: STAGE_POINTS[3] }))).toBe(40)
  })
  it('returns 100 for stage 6 (자동화)', () => {
    expect(getSystemScore(makeState({ score: STAGE_POINTS[6] }))).toBe(100)
  })
})

describe('getZoneScore', () => {
  it('averages scores for systems in a zone', () => {
    const states: Record<string, SystemState> = {
      s01: makeState({ system_id: 's01', score: 40 }),
      s02: makeState({ system_id: 's02', score: 60 }),
    }
    // zone 01 has s01, s02 → avg = (40+60)/2 = 50
    expect(getZoneScore('01', states)).toBe(50)
  })
})

describe('getTotalScore', () => {
  it('averages all 18 system scores', () => {
    const states: Record<string, SystemState> = {}
    for (let i = 1; i <= 18; i++) {
      const id = `s${String(i).padStart(2, '0')}`
      states[id] = makeState({ system_id: id, score: 0 })
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
    const state = makeState({ start_month: '2026-06', target_month: '2026-12', score: 0 })
    expect(calcSPI(state, '2026-04')).toBe(1.0)
  })
  it('calculates SPI correctly mid-project', () => {
    const state = makeState({ start_month: '2026-01', target_month: '2027-01', score: STAGE_POINTS[3] })
    expect(calcSPI(state, '2026-04')).toBeCloseTo(1.6, 1)
  })
  it('returns low SPI for behind-schedule system', () => {
    const state = makeState({ start_month: '2026-01', target_month: '2026-12', score: STAGE_POINTS[1] })
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
    const state = makeState({ start_month: '2026-01', target_month: '2027-01', score: STAGE_POINTS[3] })
    expect(calcDelayDays(state, '2026-04')).toBe(0)
  })
  it('returns positive days when behind schedule', () => {
    const state = makeState({ start_month: '2026-01', target_month: '2026-12', score: STAGE_POINTS[1] })
    const days = calcDelayDays(state, '2026-07')
    expect(days).toBeGreaterThan(0)
  })
})
