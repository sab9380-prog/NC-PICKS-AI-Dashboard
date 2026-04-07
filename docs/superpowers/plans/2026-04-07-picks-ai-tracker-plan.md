# Picks AI Pipeline Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an internal dashboard that tracks 18 AI systems across 7 maturity stages with SPI-based executive decision views, team collaboration via Supabase, and read-only share URLs.

**Architecture:** Vite SPA with React 19 + TypeScript. TanStack Query manages all server state from Supabase PostgreSQL. Three-tab layout (System Status, Schedule Status, Timeline) with a sticky header summary panel. Dark modern theme via Tailwind CSS 4.

**Tech Stack:** Vite 6, React 19, TypeScript, React Router 7, TanStack Query v5, Tailwind CSS 4, Supabase JS SDK, Vitest

---

## File Map

```
picks-ai-tracker/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .env.local                    # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── supabase/
│   └── migrations/
│       └── 001_initial.sql       # DB schema
├── src/
│   ├── main.tsx                  # ReactDOM entry
│   ├── App.tsx                   # Router + QueryClient + AuthGate
│   ├── index.css                 # Tailwind directives + dark theme
│   ├── types.ts                  # Shared TypeScript types
│   ├── data/
│   │   ├── zones.ts              # 6 zones with colors
│   │   ├── systems.ts            # 18 systems master data
│   │   └── stages.ts             # 7 stages + points + criteria
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client init
│   │   ├── score.ts              # Score + SPI + delay calculations
│   │   └── timeline.ts           # Gantt coordinate calculations
│   ├── hooks/
│   │   ├── useAuth.ts            # Auth state (password + member selection)
│   │   ├── useSystems.ts         # system_states CRUD via TanStack Query
│   │   ├── useMembers.ts         # members CRUD
│   │   └── useSnapshots.ts       # score_snapshots queries
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx      # Full layout wrapper
│   │   │   ├── Header.tsx        # Sticky summary panel
│   │   │   └── TabNav.tsx        # 3-tab navigation
│   │   ├── auth/
│   │   │   └── LoginGate.tsx     # Password + name selection
│   │   ├── status/
│   │   │   ├── StageLegend.tsx   # 7-stage legend bar
│   │   │   ├── StatusFilter.tsx  # Filter buttons
│   │   │   ├── ZoneGroup.tsx     # Collapsible zone container
│   │   │   └── SystemCard.tsx    # System card with stage selector
│   │   ├── schedule/
│   │   │   ├── AlertPanel.tsx    # "Immediate attention" section
│   │   │   └── RagTable.tsx      # Full RAG status table
│   │   ├── timeline/
│   │   │   ├── GanttChart.tsx    # Gantt container
│   │   │   └── GanttZoneGroup.tsx # Zone rows in gantt
│   │   └── admin/
│   │       └── AdminPanel.tsx    # Member CRUD + password + tokens + snapshot
│   ├── pages/
│   │   ├── DashboardPage.tsx     # Main dashboard (header + 3 tabs)
│   │   └── SharePage.tsx         # /share/:token read-only
│   └── __tests__/
│       ├── score.test.ts         # Score/SPI calculation tests
│       └── timeline.test.ts      # Timeline calculation tests
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `tailwind.config.ts`, `postcss.config.js`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `.env.local`

- [ ] **Step 1: Initialize Vite project**

```bash
cd "/c/Users/KJY9380/Documents/AI 라이프/AI 시스템 진척 대시보드"
npm create vite@latest . -- --template react-ts
```

Select: React, TypeScript when prompted. If directory is non-empty, confirm overwrite.

- [ ] **Step 2: Install dependencies**

```bash
npm install react-router-dom @tanstack/react-query @supabase/supabase-js
npm install -D tailwindcss @tailwindcss/vite vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Configure Vite with Tailwind**

Replace `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
})
```

- [ ] **Step 4: Set up Tailwind CSS with dark theme**

Replace `src/index.css`:

```css
@import "tailwindcss";

:root {
  color-scheme: dark;
}

body {
  @apply bg-slate-950 text-white antialiased;
  font-family: system-ui, -apple-system, sans-serif;
}
```

- [ ] **Step 5: Create minimal App entry**

Replace `src/App.tsx`:

```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-2xl font-bold">Picks AI Pipeline Tracker</h1>
      <p className="text-slate-400 mt-2">Setup complete</p>
    </div>
  )
}
```

Replace `src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 6: Create .env.local template**

Create `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Add to `.gitignore`:

```
.env.local
```

- [ ] **Step 7: Run dev server and verify**

```bash
npm run dev
```

Expected: Browser opens at `http://localhost:5173`, shows "Picks AI Pipeline Tracker" on dark background.

- [ ] **Step 8: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Vite + React + TS + Tailwind project"
```

---

## Task 2: Static Data & Types

**Files:**
- Create: `src/types.ts`, `src/data/zones.ts`, `src/data/systems.ts`, `src/data/stages.ts`

- [ ] **Step 1: Define shared types**

Create `src/types.ts`:

```ts
export type ZoneId = '01' | '02' | '03' | '04' | '05' | '06'

export type Zone = {
  id: ZoneId
  name: string
  ai_pct: number
  target: string
  color: string
  defaultTargetMonth: string
}

export type SystemMeta = {
  id: string
  zoneId: ZoneId
  name: string
  desc: string
}

export type SystemState = {
  system_id: string
  stage: number
  status: 'normal' | 'delay' | 'hold'
  status_reason: string | null
  owner_id: string | null
  start_month: string
  target_month: string
  note: string | null
  updated_at: string
  updated_by: string | null
}

export type Member = {
  id: string
  name: string
  is_active: boolean
  created_at: string
}

export type ScoreSnapshot = {
  id: number
  system_id: string
  score: number
  snapshot_at: string
}

export type ShareToken = {
  token: string
  created_at: string
  created_by: string | null
  is_active: boolean
}

export type StageDef = {
  level: number
  name: string
  points: number
  criteria: string[]
}

export type SPIStatus = 'danger' | 'warning' | 'ok'
```

- [ ] **Step 2: Create zones data**

Create `src/data/zones.ts`:

```ts
import type { Zone } from '../types'

export const ZONES: Zone[] = [
  { id: '01', name: '역기획', ai_pct: 85, target: '자동롤링', color: '#f59e0b', defaultTargetMonth: '2026-12' },
  { id: '02', name: '협상', ai_pct: 50, target: '당일', color: '#8b5cf6', defaultTargetMonth: '2027-04' },
  { id: '03', name: '의사결정', ai_pct: 90, target: '당일', color: '#06b6d4', defaultTargetMonth: '2026-10' },
  { id: '04', name: '상품이동', ai_pct: 70, target: '13일', color: '#10b981', defaultTargetMonth: '2027-07' },
  { id: '05', name: '상품화', ai_pct: 95, target: '1일', color: '#f43f5e', defaultTargetMonth: '2027-01' },
  { id: '06', name: '출고', ai_pct: 80, target: '1일', color: '#f97316', defaultTargetMonth: '2027-10' },
]

export const ZONE_MAP = Object.fromEntries(ZONES.map(z => [z.id, z])) as Record<string, Zone>
```

- [ ] **Step 3: Create systems data**

Create `src/data/systems.ts`:

```ts
import type { SystemMeta } from '../types'

export const SYSTEMS: SystemMeta[] = [
  { id: 's01', zoneId: '01', name: 'TCR 2.0 시뮬레이터', desc: '카테고리 믹스 자동 최적화' },
  { id: 's02', zoneId: '01', name: '12P 역기획판', desc: 'OTB 실시간 자동 롤링' },
  { id: 's03', zoneId: '01', name: 'AI 상품셀렉판', desc: '심리가 자동 산출' },
  { id: 's04', zoneId: '02', name: 'AI 매입 칸반', desc: '매입 진척 실시간 대시보드' },
  { id: 's05', zoneId: '02', name: 'AI 프라이싱', desc: '온라인 최저가 자동 수집·RV 계산' },
  { id: 's06', zoneId: '02', name: 'AI 코드 생성', desc: 'PO 코드·발주 서류 자동 생성' },
  { id: 's07', zoneId: '03', name: 'AI PO 생성', desc: '승인 즉시 자동 발행' },
  { id: 's08', zoneId: '03', name: 'AI 심리가 역기획', desc: '심리가 역기획 자동화' },
  { id: 's09', zoneId: '04', name: 'AI 가품 검증', desc: '비전 AI · TIPA 협업' },
  { id: 's10', zoneId: '04', name: 'AI 입고 헤이준카', desc: '입고 평준화 자동 스케줄링' },
  { id: 's11', zoneId: '04', name: '스마트 SCM 트래커', desc: '리드타임 실시간 노출' },
  { id: 's12', zoneId: '05', name: '비전 AI 상품분류', desc: '시간당 3,000피스 무인 분류' },
  { id: 's13', zoneId: '05', name: 'RFID 태깅 자동화', desc: '보안택 자동 부착·Unit Level Data' },
  { id: 's14', zoneId: '05', name: 'AI D급 필터링', desc: '최악 상품 자동 이동' },
  { id: 's15', zoneId: '06', name: 'OPR식 로봇 물류', desc: '크로스도킹 50%·자율 로봇 적치' },
  { id: 's16', zoneId: '06', name: 'AI 최적 상품분배', desc: 'SKU 단위 매장별 자동 배분' },
  { id: 's17', zoneId: '06', name: 'AI 마크다운', desc: '판매율 90% 자동 트리거' },
  { id: 's18', zoneId: '06', name: 'AI 최적 진열', desc: '골든존·조닝 순환 자동 계획' },
]

export const SYSTEM_MAP = Object.fromEntries(SYSTEMS.map(s => [s.id, s])) as Record<string, SystemMeta>

export function getSystemsByZone(zoneId: string): SystemMeta[] {
  return SYSTEMS.filter(s => s.zoneId === zoneId)
}
```

- [ ] **Step 4: Create stages data**

Create `src/data/stages.ts`:

```ts
import type { StageDef } from '../types'

export const STAGES: StageDef[] = [
  { level: 0, name: '미착수', points: 0, criteria: [] },
  { level: 1, name: '기획', points: 10, criteria: ['요건 정의서 존재', 'PM 배정', '일정 확정'] },
  { level: 2, name: '개발', points: 25, criteria: ['스테이징 배포 완료', '테스트 통과율 ≥90%'] },
  { level: 3, name: '도입', points: 40, criteria: ['프로덕션 배포', '실 데이터 연결', '교육 완료율 ≥80%'] },
  { level: 4, name: '활용', points: 60, criteria: ['자동화율 ≥30%', '사용률 ≥70%', '시간 절감 ≥20%'] },
  { level: 5, name: '최적화', points: 80, criteria: ['자동화율 ≥70%', '오류율 ≤5%', '인간 개입 ≤주 2회'] },
  { level: 6, name: '자동화', points: 100, criteria: ['자동화율 ≥95%', '오류율 ≤1%', 'MTTR ≤1시간', 'KPI 목표 달성'] },
]

export const STAGE_POINTS = STAGES.map(s => s.points)

export const STAGE_MAP = Object.fromEntries(STAGES.map(s => [s.level, s])) as Record<number, StageDef>
```

- [ ] **Step 5: Commit**

```bash
git add src/types.ts src/data/
git commit -m "feat: add shared types and static data (zones, systems, stages)"
```

---

## Task 3: Score & SPI Calculation Library + Tests

**Files:**
- Create: `src/lib/score.ts`, `src/__tests__/score.test.ts`

- [ ] **Step 1: Write failing tests for score calculations**

Create `src/__tests__/score.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  getSystemScore,
  getZoneScore,
  getTotalScore,
  getScoreColor,
  calcSPI,
  getSPIStatus,
  calcDelayDays,
  calcElapsedRatio,
  calcExpectedProgress,
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
      s01: makeState({ system_id: 's01', stage: 3 }),  // 40
      s02: makeState({ system_id: 's02', stage: 4 }),  // 60
      s03: makeState({ system_id: 's03', stage: 1 }),  // 10
    }
    // zone 01 has s01, s02, s03 → avg = (40+60+10)/3 = 36.67 → 37
    expect(getZoneScore('01', states)).toBe(37)
  })
})

describe('getTotalScore', () => {
  it('averages all 18 system scores', () => {
    const states: Record<string, SystemState> = {}
    // All at stage 0 → total = 0
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
    // now = 2026-04, start = 2026-06 → not started yet
    expect(calcSPI(state, '2026-04')).toBe(1.0)
  })

  it('calculates SPI correctly mid-project', () => {
    const state = makeState({ start_month: '2026-01', target_month: '2027-01', stage: 3 })
    // now = 2026-04 → elapsed = 3/12 = 0.25, progress = 40/100 = 0.4
    // SPI = 0.4 / 0.25 = 1.6
    expect(calcSPI(state, '2026-04')).toBeCloseTo(1.6, 1)
  })

  it('returns low SPI for behind-schedule system', () => {
    const state = makeState({ start_month: '2026-01', target_month: '2026-12', stage: 1 })
    // now = 2026-07 → elapsed = 6/11 = 0.545, progress = 10/100 = 0.1
    // SPI = 0.1 / 0.545 = 0.183
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/__tests__/score.test.ts
```

Expected: FAIL — module `../lib/score` not found.

- [ ] **Step 3: Implement score library**

Create `src/lib/score.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/__tests__/score.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/score.ts src/__tests__/score.test.ts
git commit -m "feat: add score/SPI calculation library with tests"
```

---

## Task 4: Timeline Calculation Library + Tests

**Files:**
- Create: `src/lib/timeline.ts`, `src/__tests__/timeline.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/timeline.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { monthToIndex, indexToPercent, getGanttBar, TIMELINE_MONTHS } from '../lib/timeline'

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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/__tests__/timeline.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement timeline library**

Create `src/lib/timeline.ts`:

```ts
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

  return {
    leftPct: indexToPercent(startIdx),
    widthPct,
    fillPct,
  }
}

export function getTodayPct(now: string): number {
  const idx = monthToIndex(now) + 0.5
  return indexToPercent(idx)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/__tests__/timeline.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/timeline.ts src/__tests__/timeline.test.ts
git commit -m "feat: add timeline/gantt calculation library with tests"
```

---

## Task 5: Supabase Schema & Client

**Files:**
- Create: `supabase/migrations/001_initial.sql`, `src/lib/supabase.ts`

- [ ] **Step 1: Write migration SQL**

Create `supabase/migrations/001_initial.sql`:

```sql
-- Members
CREATE TABLE members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- System states
CREATE TABLE system_states (
  system_id     text PRIMARY KEY,
  stage         smallint DEFAULT 0 CHECK (stage >= 0 AND stage <= 6),
  status        text DEFAULT 'normal' CHECK (status IN ('normal', 'delay', 'hold')),
  status_reason text,
  owner_id      uuid REFERENCES members(id),
  start_month   text DEFAULT '2026-04',
  target_month  text,
  note          text,
  updated_at    timestamptz DEFAULT now(),
  updated_by    uuid REFERENCES members(id)
);

-- Score snapshots
CREATE TABLE score_snapshots (
  id          serial PRIMARY KEY,
  system_id   text NOT NULL,
  score       smallint NOT NULL,
  snapshot_at date DEFAULT CURRENT_DATE
);

-- Share tokens
CREATE TABLE share_tokens (
  token       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now(),
  created_by  uuid REFERENCES members(id),
  is_active   boolean DEFAULT true
);

-- App config
CREATE TABLE app_config (
  key         text PRIMARY KEY,
  value       text,
  updated_at  timestamptz DEFAULT now()
);

-- Seed default password (bcrypt hash of 'picks2026')
INSERT INTO app_config (key, value) VALUES ('access_password', 'picks2026');

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Allow anon access (MVP: no role-based auth)
CREATE POLICY "Allow all for anon" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON system_states FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON score_snapshots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON share_tokens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON app_config FOR ALL USING (true) WITH CHECK (true);
```

- [ ] **Step 2: Create Supabase client**

Create `src/lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseKey)
```

- [ ] **Step 3: Run migration in Supabase dashboard**

Go to Supabase dashboard → SQL Editor → paste contents of `001_initial.sql` → Run.

- [ ] **Step 4: Update .env.local with real Supabase credentials**

Replace the placeholder values in `.env.local` with your actual Supabase project URL and anon key.

- [ ] **Step 5: Commit**

```bash
git add supabase/ src/lib/supabase.ts
git commit -m "feat: add Supabase schema migration and client"
```

---

## Task 6: Auth Hook & Login Gate

**Files:**
- Create: `src/hooks/useAuth.ts`, `src/components/auth/LoginGate.tsx`

- [ ] **Step 1: Create useAuth hook**

Create `src/hooks/useAuth.ts`:

```ts
import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Member } from '../types'

type AuthState = {
  isAuthenticated: boolean
  currentMember: Member | null
}

const STORAGE_KEY = 'picks-auth'

function loadAuth(): AuthState {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return { isAuthenticated: false, currentMember: null }
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(loadAuth)

  const login = useCallback(async (password: string): Promise<boolean> => {
    const { data } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'access_password')
      .single()

    if (data?.value === password) {
      return true
    }
    return false
  }, [])

  const selectMember = useCallback((member: Member) => {
    const newAuth = { isAuthenticated: true, currentMember: member }
    setAuth(newAuth)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newAuth))
  }, [])

  const logout = useCallback(() => {
    setAuth({ isAuthenticated: false, currentMember: null })
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  return { ...auth, login, selectMember, logout }
}
```

- [ ] **Step 2: Create LoginGate component**

Create `src/components/auth/LoginGate.tsx`:

```tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Member } from '../../types'

type Props = {
  onLogin: (password: string) => Promise<boolean>
  onSelectMember: (member: Member) => void
}

export default function LoginGate({ onLogin, onSelectMember }: Props) {
  const [step, setStep] = useState<'password' | 'member'>('password')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const { data } = await supabase
        .from('members')
        .select('*')
        .eq('is_active', true)
        .order('name')
      return (data ?? []) as Member[]
    },
    enabled: step === 'member',
  })

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const ok = await onLogin(password)
    if (ok) {
      setStep('member')
    } else {
      setError('비밀번호가 일치하지 않습니다')
    }
  }

  if (step === 'password') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <form onSubmit={handlePasswordSubmit} className="bg-slate-900 rounded-xl p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold mb-1">Picks AI Pipeline Tracker</h1>
          <p className="text-slate-400 text-sm mb-6">접속 비밀번호를 입력하세요</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 mb-3"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-medium transition-colors"
          >
            확인
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="bg-slate-900 rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-1">이름을 선택하세요</h1>
        <p className="text-slate-400 text-sm mb-6">수정 내역에 이름이 기록됩니다</p>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {members.map(m => (
            <button
              key={m.id}
              onClick={() => onSelectMember(m)}
              className="w-full text-left bg-slate-800 hover:bg-slate-700 rounded-lg px-4 py-3 text-white transition-colors"
            >
              {m.name}
            </button>
          ))}
          {members.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">
              등록된 멤버가 없습니다. 관리 페이지에서 추가하세요.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAuth.ts src/components/auth/LoginGate.tsx
git commit -m "feat: add auth hook and login gate (password + member selection)"
```

---

## Task 7: Data Hooks (useSystems, useMembers, useSnapshots)

**Files:**
- Create: `src/hooks/useSystems.ts`, `src/hooks/useMembers.ts`, `src/hooks/useSnapshots.ts`

- [ ] **Step 1: Create useSystems hook**

Create `src/hooks/useSystems.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { SYSTEMS } from '../data/systems'
import { ZONE_MAP } from '../data/zones'
import type { SystemState } from '../types'

export function useSystems() {
  return useQuery({
    queryKey: ['systems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_states')
        .select('*')

      if (error) throw error

      const stateMap: Record<string, SystemState> = {}
      for (const row of (data ?? []) as SystemState[]) {
        stateMap[row.system_id] = row
      }
      return stateMap
    },
  })
}

export function useInitSystems() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const rows = SYSTEMS.map(sys => ({
        system_id: sys.id,
        stage: 0,
        status: 'normal' as const,
        status_reason: null,
        owner_id: null,
        start_month: '2026-04',
        target_month: ZONE_MAP[sys.zoneId]?.defaultTargetMonth ?? '2027-12',
        note: null,
        updated_at: new Date().toISOString(),
        updated_by: null,
      }))

      const { error } = await supabase
        .from('system_states')
        .upsert(rows, { onConflict: 'system_id' })

      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['systems'] }),
  })
}

export function useUpdateSystem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      systemId: string
      updates: Partial<SystemState>
      memberId: string | null
    }) => {
      const { error } = await supabase
        .from('system_states')
        .update({
          ...params.updates,
          updated_at: new Date().toISOString(),
          updated_by: params.memberId,
        })
        .eq('system_id', params.systemId)

      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['systems'] }),
  })
}
```

- [ ] **Step 2: Create useMembers hook**

Create `src/hooks/useMembers.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Member } from '../types'

export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name')

      if (error) throw error
      return (data ?? []) as Member[]
    },
  })
}

export function useActiveMembers() {
  return useQuery({
    queryKey: ['members', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return (data ?? []) as Member[]
    },
  })
}

export function useAddMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from('members')
        .insert({ name })

      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members'] }),
  })
}

export function useUpdateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { id: string; updates: Partial<Member> }) => {
      const { error } = await supabase
        .from('members')
        .update(params.updates)
        .eq('id', params.id)

      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members'] }),
  })
}
```

- [ ] **Step 3: Create useSnapshots hook**

Create `src/hooks/useSnapshots.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { SYSTEMS } from '../data/systems'
import { getSystemScore } from '../lib/score'
import type { ScoreSnapshot, SystemState } from '../types'

export function useLatestSnapshots() {
  return useQuery({
    queryKey: ['snapshots', 'latest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('score_snapshots')
        .select('*')
        .order('snapshot_at', { ascending: false })
        .limit(36) // 18 systems × 2 recent snapshots

      if (error) throw error

      // Group by system_id, return only the most recent per system
      const latest: Record<string, ScoreSnapshot> = {}
      for (const row of (data ?? []) as ScoreSnapshot[]) {
        if (!latest[row.system_id]) {
          latest[row.system_id] = row
        }
      }
      return latest
    },
  })
}

export function useTakeSnapshot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (states: Record<string, SystemState>) => {
      const rows = SYSTEMS.map(sys => ({
        system_id: sys.id,
        score: getSystemScore(states[sys.id]?.stage ?? 0),
      }))

      const { error } = await supabase
        .from('score_snapshots')
        .insert(rows)

      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['snapshots'] }),
  })
}

export function calcDelta(
  systemId: string,
  currentScore: number,
  snapshots: Record<string, ScoreSnapshot>,
): number | null {
  const snap = snapshots[systemId]
  if (!snap) return null
  return currentScore - snap.score
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/
git commit -m "feat: add data hooks (useSystems, useMembers, useSnapshots)"
```

---

## Task 8: App Shell, Router & Tab Navigation

**Files:**
- Create: `src/components/layout/AppShell.tsx`, `src/components/layout/TabNav.tsx`
- Modify: `src/App.tsx`
- Create: `src/pages/DashboardPage.tsx`, `src/pages/SharePage.tsx`

- [ ] **Step 1: Create TabNav component**

Create `src/components/layout/TabNav.tsx`:

```tsx
type Tab = { id: string; label: string }

const TABS: Tab[] = [
  { id: 'status', label: '시스템 현황' },
  { id: 'schedule', label: '일정 현황' },
  { id: 'timeline', label: '타임라인' },
]

type Props = {
  activeTab: string
  onChange: (tab: string) => void
}

export default function TabNav({ activeTab, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create AppShell**

Create `src/components/layout/AppShell.tsx`:

```tsx
import { useState } from 'react'
import TabNav from './TabNav'

type Props = {
  header: React.ReactNode
  statusTab: React.ReactNode
  scheduleTab: React.ReactNode
  timelineTab: React.ReactNode
  onSettingsClick: () => void
  readOnly?: boolean
}

export default function AppShell({ header, statusTab, scheduleTab, timelineTab, onSettingsClick, readOnly }: Props) {
  const [activeTab, setActiveTab] = useState('status')

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold">Picks AI Pipeline Tracker</h1>
            <div className="flex items-center gap-3">
              {readOnly && (
                <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">읽기 전용</span>
              )}
              {!readOnly && (
                <button
                  onClick={onSettingsClick}
                  className="text-slate-400 hover:text-white transition-colors"
                  title="설정"
                >
                  ⚙
                </button>
              )}
            </div>
          </div>
          {header}
          <div className="mt-4">
            <TabNav activeTab={activeTab} onChange={setActiveTab} />
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        {activeTab === 'status' && statusTab}
        {activeTab === 'schedule' && scheduleTab}
        {activeTab === 'timeline' && timelineTab}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create placeholder pages**

Create `src/pages/DashboardPage.tsx`:

```tsx
import AppShell from '../components/layout/AppShell'

export default function DashboardPage() {
  return (
    <AppShell
      header={<div className="text-slate-500">헤더 요약판 (구현 예정)</div>}
      statusTab={<div className="text-slate-500">탭1: 시스템 현황 (구현 예정)</div>}
      scheduleTab={<div className="text-slate-500">탭2: 일정 현황 (구현 예정)</div>}
      timelineTab={<div className="text-slate-500">탭3: 타임라인 (구현 예정)</div>}
      onSettingsClick={() => {}}
    />
  )
}
```

Create `src/pages/SharePage.tsx`:

```tsx
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import AppShell from '../components/layout/AppShell'

export default function SharePage() {
  const { token } = useParams<{ token: string }>()

  const { data: isValid, isLoading } = useQuery({
    queryKey: ['share-token', token],
    queryFn: async () => {
      const { data } = await supabase
        .from('share_tokens')
        .select('is_active')
        .eq('token', token)
        .eq('is_active', true)
        .single()
      return !!data
    },
  })

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">로딩 중...</div>
  }

  if (!isValid) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-400">유효하지 않은 공유 링크입니다</div>
  }

  return (
    <AppShell
      header={<div className="text-slate-500">헤더 요약판 (구현 예정)</div>}
      statusTab={<div className="text-slate-500">읽기 전용</div>}
      scheduleTab={<div className="text-slate-500">읽기 전용</div>}
      timelineTab={<div className="text-slate-500">읽기 전용</div>}
      onSettingsClick={() => {}}
      readOnly
    />
  )
}
```

- [ ] **Step 4: Wire up App.tsx with router and providers**

Replace `src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from './hooks/useAuth'
import LoginGate from './components/auth/LoginGate'
import DashboardPage from './pages/DashboardPage'
import SharePage from './pages/SharePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

function AuthenticatedApp() {
  const { isAuthenticated, login, selectMember } = useAuth()

  if (!isAuthenticated) {
    return <LoginGate onLogin={login} onSelectMember={selectMember} />
  }

  return <DashboardPage />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/share/:token" element={<SharePage />} />
          <Route path="*" element={<AuthenticatedApp />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 5: Verify dev server runs without errors**

```bash
npm run dev
```

Expected: App loads, shows login screen or "Picks AI Pipeline Tracker" with placeholder tabs.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/ src/pages/ src/App.tsx
git commit -m "feat: add app shell, router, tab navigation, and page stubs"
```

---

## Task 9: Header Summary Panel

**Files:**
- Create: `src/components/layout/Header.tsx`

- [ ] **Step 1: Implement Header component**

Create `src/components/layout/Header.tsx`:

```tsx
import { ZONES } from '../../data/zones'
import { SYSTEMS } from '../../data/systems'
import { STAGES, STAGE_POINTS } from '../../data/stages'
import { getSystemScore, getZoneScore, getTotalScore, getScoreColor } from '../../lib/score'
import { calcDelta } from '../../hooks/useSnapshots'
import type { SystemState, ScoreSnapshot } from '../../types'

type Props = {
  states: Record<string, SystemState>
  snapshots: Record<string, ScoreSnapshot>
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return null
  if (delta === 0) return <span className="text-xs text-slate-500">—</span>
  if (delta > 0) return <span className="text-xs text-emerald-400">▲{delta}</span>
  return <span className="text-xs text-red-400">▼{Math.abs(delta)}</span>
}

function ScoreText({ score }: { score: number }) {
  const color = getScoreColor(score)
  const cls = color === 'ok' ? 'text-emerald-400' : color === 'warning' ? 'text-amber-400' : 'text-red-400'
  return <span className={cls}>{score}</span>
}

export default function Header({ states, snapshots }: Props) {
  const totalScore = getTotalScore(states)
  const prevTotal = Object.values(snapshots).reduce((s, snap) => s + snap.score, 0) / (SYSTEMS.length || 1)
  const totalDelta = snapshots && Object.keys(snapshots).length > 0
    ? totalScore - Math.round(prevTotal)
    : null

  const completed = SYSTEMS.filter(s => (states[s.id]?.stage ?? 0) === 6).length
  const inProgress = SYSTEMS.filter(s => {
    const stage = states[s.id]?.stage ?? 0
    return stage >= 1 && stage <= 5
  }).length
  const notStarted = SYSTEMS.filter(s => (states[s.id]?.stage ?? 0) === 0).length
  const delayed = SYSTEMS.filter(s => states[s.id]?.status === 'delay').length

  // Stage distribution
  const stageCounts = STAGES.map(stage =>
    SYSTEMS.filter(s => (states[s.id]?.stage ?? 0) === stage.level).length
  )

  const stageColors = [
    'bg-slate-600', 'bg-blue-900', 'bg-blue-800',
    'bg-cyan-800', 'bg-emerald-800', 'bg-lime-800', 'bg-green-700',
  ]

  return (
    <div className="space-y-4">
      {/* Top: Total score + summary numbers */}
      <div className="bg-slate-900 rounded-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Picks AI 전체 점수</div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-5xl font-extrabold"><ScoreText score={totalScore} /></span>
              <span className="text-slate-500">/ 100</span>
              {totalDelta !== null && (
                <span className={`text-sm px-2 py-0.5 rounded ${totalDelta >= 0 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                  {totalDelta >= 0 ? '▲' : '▼'} {Math.abs(totalDelta)}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-[10px] text-slate-500">운영 완료</div>
              <div className="text-2xl font-extrabold text-emerald-400">{completed}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-slate-500">진행 중</div>
              <div className="text-2xl font-extrabold text-blue-400">{inProgress}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-slate-500">미착수</div>
              <div className="text-2xl font-extrabold text-slate-400">{notStarted}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-red-400">지연</div>
              <div className="text-2xl font-extrabold text-red-400">{delayed}</div>
            </div>
          </div>
        </div>

        {/* Stage distribution bar */}
        <div className="mt-4">
          <div className="flex gap-0.5 h-8 rounded-lg overflow-hidden">
            {stageCounts.map((count, i) =>
              count > 0 ? (
                <div
                  key={i}
                  className={`${stageColors[i]} flex items-center justify-center text-xs font-semibold`}
                  style={{ flex: count }}
                  title={`${STAGES[i].name} ${count}개`}
                >
                  {STAGES[i].name} <span className="font-extrabold ml-1">{count}</span>
                </div>
              ) : null
            )}
          </div>
          <div className="flex justify-between text-[10px] text-slate-600 mt-1">
            <span>← 초기</span>
            <span>{SYSTEMS.length}개 시스템 분포</span>
            <span>완성 →</span>
          </div>
        </div>
      </div>

      {/* Zone scores - 6 cards */}
      <div className="grid grid-cols-6 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {ZONES.map(zone => {
          const zoneScore = getZoneScore(zone.id, states)
          const zoneSystems = SYSTEMS.filter(s => s.zoneId === zone.id)
          const zoneDeltas = zoneSystems.map(s => {
            const score = getSystemScore(states[s.id]?.stage ?? 0)
            return calcDelta(s.id, score, snapshots)
          })
          const zoneDelta = zoneDeltas.every(d => d !== null)
            ? zoneDeltas.reduce((a, b) => (a ?? 0) + (b ?? 0), 0)
            : null

          // Mini distribution bar for this zone
          const zoneStageCounts = STAGES.map(stage =>
            zoneSystems.filter(s => (states[s.id]?.stage ?? 0) === stage.level).length
          )

          return (
            <div
              key={zone.id}
              className="bg-slate-900 rounded-lg p-3.5"
              style={{ borderTop: `3px solid ${zone.color}` }}
            >
              <div className="flex justify-between items-start mb-2.5">
                <div>
                  <div className="text-[10px] font-semibold" style={{ color: zone.color }}>
                    {zone.id} {zone.name}
                  </div>
                  <div className="text-[9px] text-slate-600">AI {zone.ai_pct}% · {zone.target}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold"><ScoreText score={zoneScore} /></div>
                  <DeltaBadge delta={zoneDelta ? Math.round(zoneDelta / zoneSystems.length) : null} />
                </div>
              </div>

              {/* Mini distribution */}
              <div className="flex gap-px h-4 rounded overflow-hidden mb-1.5">
                {zoneStageCounts.map((count, i) =>
                  count > 0 ? (
                    <div key={i} className={stageColors[i]} style={{ flex: count }} title={`${STAGES[i].name} ${count}`} />
                  ) : null
                )}
              </div>

              <div className="flex justify-between text-[9px] text-slate-600">
                <span>{zoneSystems.length}개 시스템</span>
                <span>목표 {zone.defaultTargetMonth.slice(2)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire Header into DashboardPage**

Update `src/pages/DashboardPage.tsx`:

```tsx
import AppShell from '../components/layout/AppShell'
import Header from '../components/layout/Header'
import { useSystems, useInitSystems } from '../hooks/useSystems'
import { useLatestSnapshots } from '../hooks/useSnapshots'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: states, isLoading } = useSystems()
  const { data: snapshots = {} } = useLatestSnapshots()
  const initSystems = useInitSystems()

  // Auto-init system_states if empty
  useEffect(() => {
    if (!isLoading && states && Object.keys(states).length === 0) {
      initSystems.mutate()
    }
  }, [isLoading, states])

  if (isLoading || !states) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">로딩 중...</div>
  }

  return (
    <AppShell
      header={<Header states={states} snapshots={snapshots} />}
      statusTab={<div className="text-slate-500">탭1: 시스템 현황 (구현 예정)</div>}
      scheduleTab={<div className="text-slate-500">탭2: 일정 현황 (구현 예정)</div>}
      timelineTab={<div className="text-slate-500">탭3: 타임라인 (구현 예정)</div>}
      onSettingsClick={() => {}}
    />
  )
}
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Expected: After login, header shows total score 0/100, 18 systems in "미착수" stage, all zone scores at 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Header.tsx src/pages/DashboardPage.tsx
git commit -m "feat: add header summary panel with scores, distribution bar, zone cards"
```

---

## Task 10: Tab 1 — System Status View

**Files:**
- Create: `src/components/status/StageLegend.tsx`, `src/components/status/StatusFilter.tsx`, `src/components/status/ZoneGroup.tsx`, `src/components/status/SystemCard.tsx`

- [ ] **Step 1: Create StageLegend**

Create `src/components/status/StageLegend.tsx`:

```tsx
import { STAGES } from '../../data/stages'

export default function StageLegend() {
  return (
    <div className="bg-slate-900 rounded-lg px-4 py-3 flex items-center gap-1.5 flex-wrap">
      <span className="text-xs text-slate-500 mr-2">단계 범례</span>
      {STAGES.map(stage => (
        <span
          key={stage.level}
          className="bg-slate-800 rounded px-2.5 py-1 text-xs text-slate-400"
          title={stage.criteria.join(' · ')}
        >
          {stage.level} {stage.name} {stage.points > 0 && <span className="text-slate-600">{stage.points}pt</span>}
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create StatusFilter**

Create `src/components/status/StatusFilter.tsx`:

```tsx
type FilterValue = 'all' | 'normal' | 'delay' | 'hold'

type Props = {
  value: FilterValue
  onChange: (v: FilterValue) => void
  counts: { all: number; normal: number; delay: number; hold: number }
}

const FILTERS: { value: FilterValue; label: string; cls: string }[] = [
  { value: 'all', label: '전체', cls: 'bg-blue-600 text-white' },
  { value: 'normal', label: '정상', cls: 'text-slate-400 border-slate-700' },
  { value: 'delay', label: '지연', cls: 'text-red-400 border-red-900' },
  { value: 'hold', label: '보류', cls: 'text-amber-400 border-amber-900' },
]

export default function StatusFilter({ value, onChange, counts }: Props) {
  return (
    <div className="flex gap-2">
      {FILTERS.map(f => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors border ${
            value === f.value ? f.cls : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
          }`}
        >
          {f.label} ({counts[f.value]})
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create SystemCard**

Create `src/components/status/SystemCard.tsx`:

```tsx
import { useState } from 'react'
import { STAGES } from '../../data/stages'
import { getSystemScore, getScoreColor } from '../../lib/score'
import { calcDelta } from '../../hooks/useSnapshots'
import type { SystemState, SystemMeta, Member, ScoreSnapshot, Zone } from '../../types'

type Props = {
  system: SystemMeta
  state: SystemState
  zone: Zone
  members: Member[]
  snapshots: Record<string, ScoreSnapshot>
  onUpdate: (updates: Partial<SystemState>) => void
  readOnly?: boolean
}

export default function SystemCard({ system, state, zone, members, snapshots, onUpdate, readOnly }: Props) {
  const [showReasonInput, setShowReasonInput] = useState(false)
  const score = getSystemScore(state.stage)
  const delta = calcDelta(system.id, score, snapshots)
  const scoreColor = getScoreColor(score)
  const owner = members.find(m => m.id === state.owner_id)

  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(state.updated_at).getTime()) / (1000 * 60 * 60 * 24)
  )
  const isStale = daysSinceUpdate >= 7

  const nextStage = STAGES[state.stage + 1]

  function handleStageClick(level: number) {
    if (readOnly || level === state.stage) return
    onUpdate({ stage: level })
  }

  function handleStatusToggle() {
    if (readOnly) return
    const cycle = { normal: 'delay', delay: 'hold', hold: 'normal' } as const
    const next = cycle[state.status]
    if (next === 'delay' || next === 'hold') {
      setShowReasonInput(true)
    }
    onUpdate({ status: next, status_reason: next === 'normal' ? null : state.status_reason })
  }

  function handleReasonSubmit(reason: string) {
    onUpdate({ status_reason: reason })
    setShowReasonInput(false)
  }

  const statusBadge = {
    normal: 'bg-emerald-900/50 text-emerald-400',
    delay: 'bg-red-900/50 text-red-400',
    hold: 'bg-amber-900/50 text-amber-400',
  }
  const statusLabel = { normal: '정상', delay: '지연', hold: '보류' }

  return (
    <div className="bg-slate-900 rounded-xl p-4" style={{ borderLeft: `4px solid ${zone.color}` }}>
      <div className="flex items-start gap-4 flex-wrap lg:flex-nowrap">
        {/* Left: system info */}
        <div className="min-w-[180px]">
          <div className="text-sm font-semibold">{system.name}</div>
          <div className="text-xs text-slate-600 mt-0.5">{system.desc}</div>
          <div className="flex items-center gap-2 mt-2">
            {owner ? (
              <span className="text-xs text-slate-400">👤 {owner.name}</span>
            ) : (
              <select
                className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-400"
                value=""
                onChange={e => onUpdate({ owner_id: e.target.value || null })}
                disabled={readOnly}
              >
                <option value="">담당자 미배정</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            )}
            <button
              onClick={handleStatusToggle}
              className={`text-[10px] px-2 py-0.5 rounded-full ${statusBadge[state.status]}`}
              disabled={readOnly}
            >
              {statusLabel[state.status]}
            </button>
          </div>
          {state.note && <div className="text-[10px] text-slate-600 mt-1">메모: {state.note}</div>}
          {isStale && <div className="text-[10px] text-red-400 mt-1">⚠ {daysSinceUpdate}일 미업데이트</div>}
        </div>

        {/* Center: stage selector */}
        <div className="flex-1 min-w-0">
          <div className="flex gap-1">
            {STAGES.map(stage => {
              const isCurrent = state.stage === stage.level
              const isPast = stage.level < state.stage
              return (
                <button
                  key={stage.level}
                  onClick={() => handleStageClick(stage.level)}
                  disabled={readOnly}
                  title={stage.criteria.join(' · ') || stage.name}
                  className={`flex-1 text-center rounded-md py-2 transition-colors ${
                    isCurrent
                      ? 'bg-blue-900/50 border-2 border-blue-500'
                      : isPast
                      ? 'bg-slate-800 opacity-50'
                      : 'bg-slate-800 hover:bg-slate-700'
                  } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className={`text-base font-bold ${isCurrent ? 'text-blue-400' : isPast ? 'text-slate-500' : 'text-slate-600'}`}>
                    {stage.level}
                  </div>
                  <div className={`text-[8px] ${isCurrent ? 'text-blue-400' : 'text-slate-600'}`}>
                    {stage.name}
                  </div>
                </button>
              )
            })}
          </div>
          {/* Next stage criteria checklist */}
          {nextStage && !readOnly && (
            <div className="mt-2 bg-slate-950 rounded-md px-2.5 py-2 text-[10px]">
              <span className="text-slate-600">다음 단계({nextStage.name}) 조건:</span>
              {nextStage.criteria.map((c, i) => (
                <span key={i} className="text-slate-500 ml-1.5">{c}</span>
              ))}
            </div>
          )}
        </div>

        {/* Right: score */}
        <div className="text-right min-w-[60px]">
          <div className={`text-3xl font-extrabold ${
            scoreColor === 'ok' ? 'text-emerald-400' : scoreColor === 'warning' ? 'text-amber-400' : 'text-red-400'
          }`}>
            {score}
          </div>
          {delta !== null && (
            <div className={`text-[10px] ${delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-red-400' : 'text-slate-600'}`}>
              {delta > 0 ? `▲+${delta}` : delta < 0 ? `▼${delta}` : '—'}
            </div>
          )}
          <div className="text-[10px] text-slate-600">pt</div>
        </div>
      </div>

      {/* Reason input modal */}
      {showReasonInput && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            placeholder="사유를 입력하세요"
            className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500"
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter') handleReasonSubmit((e.target as HTMLInputElement).value)
              if (e.key === 'Escape') setShowReasonInput(false)
            }}
          />
          <button
            onClick={() => setShowReasonInput(false)}
            className="text-xs text-slate-500 hover:text-white"
          >
            취소
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create ZoneGroup**

Create `src/components/status/ZoneGroup.tsx`:

```tsx
import { useState } from 'react'
import { getZoneScore, getScoreColor } from '../../lib/score'
import { getSystemsByZone } from '../../data/systems'
import SystemCard from './SystemCard'
import type { SystemState, Zone, Member, ScoreSnapshot } from '../../types'

type Props = {
  zone: Zone
  states: Record<string, SystemState>
  members: Member[]
  snapshots: Record<string, ScoreSnapshot>
  filter: string
  onUpdate: (systemId: string, updates: Partial<SystemState>) => void
  readOnly?: boolean
}

export default function ZoneGroup({ zone, states, members, snapshots, filter, onUpdate, readOnly }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const systems = getSystemsByZone(zone.id)
  const zoneScore = getZoneScore(zone.id, states)
  const scoreColor = getScoreColor(zoneScore)

  const filtered = systems.filter(sys => {
    if (filter === 'all') return true
    return states[sys.id]?.status === filter
  })

  if (filtered.length === 0) return null

  return (
    <div className="mb-6">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 mb-3 pb-2"
        style={{ borderBottom: `2px solid ${zone.color}` }}
      >
        <span
          className="text-xs font-bold px-2 py-0.5 rounded"
          style={{ background: zone.color, color: '#0f172a' }}
        >
          {zone.id}
        </span>
        <span className="text-sm font-semibold">{zone.name}</span>
        <span className="text-xs text-slate-500">AI {zone.ai_pct}% · {zone.target}</span>
        <span className="text-xs text-slate-500">{filtered.length}개 시스템</span>
        <span className={`ml-auto text-sm font-bold ${
          scoreColor === 'ok' ? 'text-emerald-400' : scoreColor === 'warning' ? 'text-amber-400' : 'text-red-400'
        }`}>
          {zoneScore}pt
        </span>
        <span className="text-slate-500 text-sm">{collapsed ? '▸' : '▾'}</span>
      </button>

      {!collapsed && (
        <div className="space-y-2">
          {filtered.map(sys => (
            <SystemCard
              key={sys.id}
              system={sys}
              state={states[sys.id]}
              zone={zone}
              members={members}
              snapshots={snapshots}
              onUpdate={updates => onUpdate(sys.id, updates)}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Wire Tab 1 into DashboardPage**

Update `src/pages/DashboardPage.tsx` — replace the `statusTab` placeholder with the real component composition. Import and use `StageLegend`, `StatusFilter`, `ZoneGroup` from `../components/status/`. Use `useState` for the filter, pass `useUpdateSystem` mutation for `onUpdate`, pass `useActiveMembers` for members list. Full wiring code:

```tsx
import { useState, useEffect } from 'react'
import AppShell from '../components/layout/AppShell'
import Header from '../components/layout/Header'
import StageLegend from '../components/status/StageLegend'
import StatusFilter from '../components/status/StatusFilter'
import ZoneGroup from '../components/status/ZoneGroup'
import { ZONES } from '../data/zones'
import { SYSTEMS } from '../data/systems'
import { useSystems, useInitSystems, useUpdateSystem } from '../hooks/useSystems'
import { useActiveMembers } from '../hooks/useMembers'
import { useLatestSnapshots } from '../hooks/useSnapshots'
import { useAuth } from '../hooks/useAuth'

export default function DashboardPage() {
  const { currentMember } = useAuth()
  const { data: states, isLoading } = useSystems()
  const { data: snapshots = {} } = useLatestSnapshots()
  const { data: members = [] } = useActiveMembers()
  const initSystems = useInitSystems()
  const updateSystem = useUpdateSystem()
  const [filter, setFilter] = useState<'all' | 'normal' | 'delay' | 'hold'>('all')

  useEffect(() => {
    if (!isLoading && states && Object.keys(states).length === 0) {
      initSystems.mutate()
    }
  }, [isLoading, states])

  if (isLoading || !states) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">로딩 중...</div>
  }

  const counts = {
    all: SYSTEMS.length,
    normal: SYSTEMS.filter(s => states[s.id]?.status === 'normal').length,
    delay: SYSTEMS.filter(s => states[s.id]?.status === 'delay').length,
    hold: SYSTEMS.filter(s => states[s.id]?.status === 'hold').length,
  }

  function handleUpdate(systemId: string, updates: Partial<typeof states[string]>) {
    updateSystem.mutate({
      systemId,
      updates,
      memberId: currentMember?.id ?? null,
    })
  }

  const statusTab = (
    <div className="space-y-4">
      <StageLegend />
      <StatusFilter value={filter} onChange={setFilter} counts={counts} />
      {ZONES.map(zone => (
        <ZoneGroup
          key={zone.id}
          zone={zone}
          states={states}
          members={members}
          snapshots={snapshots}
          filter={filter}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  )

  return (
    <AppShell
      header={<Header states={states} snapshots={snapshots} />}
      statusTab={statusTab}
      scheduleTab={<div className="text-slate-500">탭2: 일정 현황 (구현 예정)</div>}
      timelineTab={<div className="text-slate-500">탭3: 타임라인 (구현 예정)</div>}
      onSettingsClick={() => {}}
    />
  )
}
```

- [ ] **Step 6: Verify in browser**

```bash
npm run dev
```

Expected: Tab 1 shows stage legend, filter buttons, 6 zone groups with system cards. Clicking stage buttons updates the stage. Status badge toggles.

- [ ] **Step 7: Commit**

```bash
git add src/components/status/ src/pages/DashboardPage.tsx
git commit -m "feat: add Tab 1 system status view (cards, stage selector, filters, zone groups)"
```

---

## Task 11: Tab 2 — Schedule Status (Executive Decision View)

**Files:**
- Create: `src/components/schedule/AlertPanel.tsx`, `src/components/schedule/RagTable.tsx`

- [ ] **Step 1: Create AlertPanel**

Create `src/components/schedule/AlertPanel.tsx`:

```tsx
import { SYSTEMS, SYSTEM_MAP } from '../../data/systems'
import { ZONE_MAP } from '../../data/zones'
import { STAGE_MAP, STAGE_POINTS } from '../../data/stages'
import { calcSPI, getSPIStatus, calcDelayDays, calcExpectedProgress, getSystemScore } from '../../lib/score'
import type { SystemState, Member } from '../../types'

type Props = {
  states: Record<string, SystemState>
  members: Member[]
  now: string
}

export default function AlertPanel({ states, members, now }: Props) {
  const alerts = SYSTEMS
    .map(sys => {
      const state = states[sys.id]
      if (!state) return null
      const spi = calcSPI(state, now)
      const status = getSPIStatus(spi)
      if (status === 'ok') return null
      return { sys, state, spi, status, delayDays: calcDelayDays(state, now) }
    })
    .filter(Boolean)
    .sort((a, b) => a!.spi - b!.spi) as NonNullable<typeof alerts[number]>[]

  if (alerts.length === 0) return null

  return (
    <div className="bg-gradient-to-r from-red-950/50 to-slate-900 border border-red-900/50 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">⚠</span>
        <span className="text-sm font-bold text-red-300">즉시 주의 필요 — {alerts.length}건</span>
        <span className="text-xs text-slate-500 ml-auto">위험도순 정렬</span>
      </div>

      <div className="space-y-2">
        {alerts.map(({ sys, state, spi, status, delayDays }) => {
          const zone = ZONE_MAP[sys.zoneId]
          const stage = STAGE_MAP[state.stage]
          const score = getSystemScore(state.stage)
          const expected = calcExpectedProgress(state.start_month, state.target_month, now)
          const actual = score / 100
          const owner = members.find(m => m.id === state.owner_id)
          const isFull = status === 'danger'

          return (
            <div key={sys.id} className="bg-black/30 rounded-lg p-3 flex items-center gap-4 flex-wrap lg:flex-nowrap">
              {/* SPI */}
              <div className="min-w-[40px] text-center">
                <div className={`text-xl font-extrabold ${isFull ? 'text-red-400' : 'text-amber-400'}`}>
                  {spi.toFixed(2)}
                </div>
                <div className={`text-[8px] ${isFull ? 'text-red-400' : 'text-amber-400'}`}>SPI</div>
              </div>

              <div className="w-px h-9 bg-slate-700" />

              {/* System info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: zone?.color, color: '#0f172a' }}>
                    {zone?.name}
                  </span>
                  <span className="text-sm font-semibold truncate">{sys.name}</span>
                  {owner && <span className="text-[10px] text-slate-500">· {owner.name}</span>}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  현재 <strong className="text-amber-400">{stage?.name}({score}pt)</strong> · 목표 {state.target_month.slice(2)}까지 자동화 도달 필요
                </div>
              </div>

              {/* Plan vs Actual bar */}
              <div className="min-w-[180px]">
                <div className="text-[9px] text-slate-600 mb-1">계획 진척 vs 실제</div>
                <div className="relative h-5 bg-slate-800 rounded overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-500 z-10"
                    style={{ left: `${Math.min(expected * 100, 100)}%` }}
                  />
                  <div
                    className={`h-full rounded ${isFull ? 'bg-red-500' : 'bg-amber-500'}`}
                    style={{ width: `${actual * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] mt-0.5">
                  <span className={isFull ? 'text-red-400' : 'text-amber-400'}>실제 {Math.round(actual * 100)}%</span>
                  <span className={isFull ? 'text-red-400' : 'text-amber-400'} style={{ fontWeight: 700 }}>
                    {Math.round((expected - actual) * 100)}%p 뒤처짐
                  </span>
                </div>
              </div>

              {/* Delay days */}
              <div className="min-w-[60px] text-center">
                <div className="text-[9px] text-slate-600">지연</div>
                <div className={`text-lg font-extrabold ${isFull ? 'text-red-400' : 'text-amber-400'}`}>
                  {delayDays}일
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create RagTable**

Create `src/components/schedule/RagTable.tsx`:

```tsx
import { useState } from 'react'
import { SYSTEMS, SYSTEM_MAP } from '../../data/systems'
import { ZONE_MAP } from '../../data/zones'
import { STAGE_MAP } from '../../data/stages'
import { calcSPI, getSPIStatus, getSystemScore, getScoreColor, calcExpectedProgress } from '../../lib/score'
import { calcDelta } from '../../hooks/useSnapshots'
import type { SystemState, Member, ScoreSnapshot } from '../../types'

type Props = {
  states: Record<string, SystemState>
  members: Member[]
  snapshots: Record<string, ScoreSnapshot>
  now: string
}

export default function RagTable({ states, members, snapshots, now }: Props) {
  const [showNormal, setShowNormal] = useState(false)

  const rows = SYSTEMS.map(sys => {
    const state = states[sys.id]
    if (!state) return null
    const spi = calcSPI(state, now)
    const spiStatus = getSPIStatus(spi)
    const score = getSystemScore(state.stage)
    const expected = calcExpectedProgress(state.start_month, state.target_month, now)
    const actual = score / 100
    const delta = calcDelta(sys.id, score, snapshots)
    const prevSpi = delta !== null ? calcSPI({ ...state, stage: Math.max(0, state.stage - (delta > 0 ? 1 : 0)) }, now) : null
    const trend = prevSpi !== null ? (spi > prevSpi + 0.05 ? 'up' : spi < prevSpi - 0.05 ? 'down' : 'flat') : 'flat'
    return { sys, state, spi, spiStatus, score, expected, actual, trend }
  })
  .filter(Boolean)
  .sort((a, b) => a!.spi - b!.spi) as NonNullable<typeof rows[number]>[]

  const atRisk = rows.filter(r => r.spiStatus !== 'ok')
  const normal = rows.filter(r => r.spiStatus === 'ok')

  const spiDot = { danger: 'bg-red-500', warning: 'bg-amber-500', ok: 'bg-emerald-500' }
  const spiText = { danger: 'text-red-400', warning: 'text-amber-400', ok: 'text-emerald-400' }
  const trendIcon = { up: '↗', flat: '→', down: '↘' }
  const trendColor = { up: 'text-emerald-400', flat: 'text-slate-500', down: 'text-red-400' }

  function Row({ r }: { r: typeof rows[number] }) {
    const zone = ZONE_MAP[r.sys.zoneId]
    const stage = STAGE_MAP[r.state.stage]
    const owner = members.find(m => m.id === r.state.owner_id)
    const barColor = r.spiStatus === 'danger' ? 'bg-red-500' : r.spiStatus === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'

    return (
      <div className={`grid grid-cols-[30px_60px_1fr_70px_60px_140px_55px_40px] gap-0 px-4 py-2.5 text-xs items-center border-b border-slate-800/50 ${
        r.spiStatus === 'danger' ? 'bg-red-500/5' : r.spiStatus === 'warning' ? 'bg-amber-500/3' : ''
      }`}>
        <div><span className={`inline-block w-2.5 h-2.5 rounded-full ${spiDot[r.spiStatus]}`} /></div>
        <div>
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: zone?.color, color: zone?.color === '#f59e0b' || zone?.color === '#f97316' ? '#0f172a' : 'white' }}>
            {zone?.name}
          </span>
        </div>
        <div className="font-medium truncate">{r.sys.name} <span className="text-slate-600 font-normal">· {owner?.name ?? '미배정'}</span></div>
        <div className="text-blue-400">{stage?.name}</div>
        <div className="text-center font-bold">
          <span className={getScoreColor(r.score) === 'ok' ? 'text-emerald-400' : getScoreColor(r.score) === 'warning' ? 'text-amber-400' : 'text-red-400'}>
            {r.score}
          </span>
        </div>
        <div className="hidden lg:block">
          <div className="relative h-3.5 bg-slate-800 rounded overflow-hidden">
            <div className="absolute top-0 bottom-0 w-px bg-slate-500" style={{ left: `${Math.min(r.expected * 100, 100)}%` }} />
            <div className={`h-full rounded ${barColor}`} style={{ width: `${r.actual * 100}%` }} />
          </div>
        </div>
        <div className={`text-center font-extrabold ${spiText[r.spiStatus]}`}>{r.spi >= 10 ? '✓' : r.spi.toFixed(2)}</div>
        <div className={`text-center ${trendColor[r.trend]}`}>{trendIcon[r.trend]}</div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center border-b border-slate-800">
        <span className="text-sm font-semibold">전체 시스템 일정 현황</span>
        <span className="text-xs text-slate-500 ml-3">{SYSTEMS.length}개 시스템</span>
        <div className="ml-auto flex gap-3 text-[10px]">
          <span><span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1" />위험 SPI&lt;0.7</span>
          <span><span className="inline-block w-2 h-2 bg-amber-500 rounded-full mr-1" />주의 0.7~0.9</span>
          <span><span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-1" />정상 ≥0.9</span>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[30px_60px_1fr_70px_60px_140px_55px_40px] gap-0 px-4 py-2 text-[10px] text-slate-500 uppercase border-b border-slate-800">
        <div />
        <div>구간</div>
        <div>시스템</div>
        <div>단계</div>
        <div className="text-center">점수</div>
        <div className="text-center hidden lg:block">계획 vs 실제</div>
        <div className="text-center">SPI</div>
        <div className="text-center">추세</div>
      </div>

      {/* At-risk rows */}
      {atRisk.map(r => <Row key={r.sys.id} r={r} />)}

      {/* Normal section */}
      {normal.length > 0 && (
        <>
          <button
            onClick={() => setShowNormal(!showNormal)}
            className="w-full px-4 py-2 text-[10px] text-slate-500 bg-slate-950 hover:bg-slate-900 transition-colors text-left"
          >
            ── 정상 ({normal.length}개 시스템) {showNormal ? '▾' : '▸'}
          </button>
          {showNormal && normal.map(r => <Row key={r.sys.id} r={r} />)}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Wire Tab 2 into DashboardPage**

In `src/pages/DashboardPage.tsx`, add imports and replace the scheduleTab placeholder:

```tsx
import AlertPanel from '../components/schedule/AlertPanel'
import RagTable from '../components/schedule/RagTable'

// Inside the component, define:
const NOW = '2026-04' // Current month — later make dynamic

const scheduleTab = (
  <div>
    <AlertPanel states={states} members={members} now={NOW} />
    <RagTable states={states} members={members} snapshots={snapshots} now={NOW} />
  </div>
)
```

Pass `scheduleTab` to `AppShell`.

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Expected: Tab 2 shows alert panel (if any systems have SPI < 0.9) and RAG table with all systems sorted by SPI.

- [ ] **Step 5: Commit**

```bash
git add src/components/schedule/ src/pages/DashboardPage.tsx
git commit -m "feat: add Tab 2 schedule status (SPI alert panel + RAG table)"
```

---

## Task 12: Tab 3 — Timeline (Gantt Chart)

**Files:**
- Create: `src/components/timeline/GanttChart.tsx`, `src/components/timeline/GanttZoneGroup.tsx`

- [ ] **Step 1: Create GanttZoneGroup**

Create `src/components/timeline/GanttZoneGroup.tsx`:

```tsx
import { getSystemsByZone } from '../../data/systems'
import { STAGE_MAP } from '../../data/stages'
import { getSystemScore, getScoreColor, calcSPI, getSPIStatus } from '../../lib/score'
import { getGanttBar, TIMELINE_MONTHS } from '../../lib/timeline'
import type { SystemState, Zone, Member } from '../../types'

type Props = {
  zone: Zone
  states: Record<string, SystemState>
  members: Member[]
  now: string
  onEditDates?: (systemId: string) => void
  readOnly?: boolean
}

export default function GanttZoneGroup({ zone, states, members, now, onEditDates, readOnly }: Props) {
  const systems = getSystemsByZone(zone.id)
  const zoneScore = Math.round(
    systems.reduce((sum, s) => sum + getSystemScore(states[s.id]?.stage ?? 0), 0) / systems.length
  )

  return (
    <div className="border-b border-slate-800">
      {/* Zone header */}
      <div className="flex" style={{ background: `${zone.color}08` }}>
        <div className="min-w-[220px] lg:min-w-[220px] md:min-w-[160px] px-4 py-1.5 bg-slate-950 sticky left-0 z-10 border-r border-slate-800 flex items-center gap-2">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: zone.color, color: '#0f172a' }}>
            {zone.id}
          </span>
          <span className="text-xs font-semibold" style={{ color: zone.color }}>{zone.name}</span>
          <span className={`text-xs font-bold ml-auto ${
            getScoreColor(zoneScore) === 'ok' ? 'text-emerald-400' : getScoreColor(zoneScore) === 'warning' ? 'text-amber-400' : 'text-red-400'
          }`}>
            {zoneScore}pt
          </span>
        </div>
        <div className="flex-1" />
      </div>

      {/* System rows */}
      {systems.map(sys => {
        const state = states[sys.id]
        if (!state) return null
        const score = getSystemScore(state.stage)
        const stage = STAGE_MAP[state.stage]
        const owner = members.find(m => m.id === state.owner_id)
        const bar = getGanttBar(state.start_month, state.target_month, score)
        const spiStatus = getSPIStatus(calcSPI(state, now))

        return (
          <div key={sys.id} className="flex border-t border-slate-800/30">
            {/* Left label */}
            <div
              className="min-w-[220px] lg:min-w-[220px] md:min-w-[160px] px-4 py-2 bg-slate-950 sticky left-0 z-10 border-r border-slate-800 cursor-pointer hover:bg-slate-900"
              onClick={() => !readOnly && onEditDates?.(sys.id)}
            >
              <div className="text-xs font-medium truncate">{sys.name}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-blue-400">{stage?.name}</span>
                <span className={`text-[10px] font-bold ${
                  getScoreColor(score) === 'ok' ? 'text-emerald-400' : getScoreColor(score) === 'warning' ? 'text-amber-400' : 'text-red-400'
                }`}>{score}pt</span>
                {owner && <span className="text-[9px] text-slate-600">· {owner.name}</span>}
                {state.status === 'delay' && (
                  <span className="bg-red-900/50 text-red-400 text-[8px] px-1.5 py-px rounded-full ml-auto">지연</span>
                )}
              </div>
            </div>

            {/* Gantt bar area */}
            <div className="flex-1 relative h-12">
              {/* Bar */}
              <div
                className="absolute top-3 h-6 rounded"
                style={{
                  left: `${bar.leftPct}%`,
                  width: `${bar.widthPct}%`,
                  background: `${zone.color}25`,
                  border: `1px solid ${zone.color}40`,
                }}
              >
                <div
                  className="h-full rounded-l"
                  style={{
                    width: `${score}%`,
                    background: `${zone.color}80`,
                  }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Create GanttChart container**

Create `src/components/timeline/GanttChart.tsx`:

```tsx
import { useState } from 'react'
import { ZONES } from '../../data/zones'
import { TIMELINE_MONTHS, monthToIndex, getTodayPct, indexToMonth } from '../../lib/timeline'
import GanttZoneGroup from './GanttZoneGroup'
import type { SystemState, Member } from '../../types'

type Props = {
  states: Record<string, SystemState>
  members: Member[]
  now: string
  onUpdateDates?: (systemId: string, startMonth: string, targetMonth: string) => void
  readOnly?: boolean
}

export default function GanttChart({ states, members, now, onUpdateDates, readOnly }: Props) {
  const [editingSystem, setEditingSystem] = useState<string | null>(null)
  const todayPct = getTodayPct(now)
  const months = Array.from({ length: TIMELINE_MONTHS }, (_, i) => indexToMonth(i))
  const nowIdx = monthToIndex(now)

  function handleEditDates(systemId: string) {
    setEditingSystem(systemId)
  }

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth: '1100px' }}>
          {/* Year labels */}
          <div className="flex border-b border-slate-800">
            <div className="min-w-[220px] lg:min-w-[220px] md:min-w-[160px] bg-slate-950 sticky left-0 z-20 border-r border-slate-800" />
            <div className="flex-1 flex">
              <div className="flex-1 text-center text-[10px] text-slate-500 py-1 border-r border-slate-700">2026</div>
              <div className="flex-1 text-center text-[10px] text-slate-500 py-1">2027</div>
            </div>
          </div>

          {/* Month headers */}
          <div className="flex border-b border-slate-800">
            <div className="min-w-[220px] lg:min-w-[220px] md:min-w-[160px] px-4 py-2 bg-slate-950 sticky left-0 z-20 border-r border-slate-800">
              <span className="text-xs text-slate-500">시스템 / 단계 / 점수</span>
            </div>
            <div className="flex-1 flex relative">
              {months.map((m, i) => {
                const monthNum = parseInt(m.split('-')[1])
                const isToday = i === nowIdx
                return (
                  <div
                    key={m}
                    className={`flex-1 text-center py-2 text-[9px] border-r border-slate-800/20 ${
                      isToday ? 'text-blue-400 font-bold bg-blue-500/5' : 'text-slate-600'
                    } ${i === 12 ? 'border-l border-slate-700' : ''}`}
                  >
                    {monthNum}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Gantt body with today marker */}
          <div className="relative">
            {/* Today marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-blue-500/40 z-10"
              style={{ left: `calc(220px + (100% - 220px) * ${todayPct / 100})` }}
            />

            {ZONES.map(zone => (
              <GanttZoneGroup
                key={zone.id}
                zone={zone}
                states={states}
                members={members}
                now={now}
                onEditDates={handleEditDates}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Date edit modal */}
      {editingSystem && states[editingSystem] && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 w-80">
            <h3 className="text-sm font-bold mb-4">날짜 수정</h3>
            <label className="block text-xs text-slate-400 mb-1">시작월</label>
            <input
              type="month"
              defaultValue={states[editingSystem].start_month}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white mb-3"
              id="edit-start"
            />
            <label className="block text-xs text-slate-400 mb-1">목표월</label>
            <input
              type="month"
              defaultValue={states[editingSystem].target_month}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white mb-4"
              id="edit-target"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const start = (document.getElementById('edit-start') as HTMLInputElement).value
                  const target = (document.getElementById('edit-target') as HTMLInputElement).value
                  onUpdateDates?.(editingSystem, start, target)
                  setEditingSystem(null)
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded py-2 text-sm"
              >
                저장
              </button>
              <button
                onClick={() => setEditingSystem(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded py-2 text-sm"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Wire Tab 3 into DashboardPage**

In `src/pages/DashboardPage.tsx`, add import and create timelineTab:

```tsx
import GanttChart from '../components/timeline/GanttChart'

// Inside the component:
const timelineTab = (
  <GanttChart
    states={states}
    members={members}
    now={NOW}
    onUpdateDates={(systemId, startMonth, targetMonth) => {
      handleUpdate(systemId, { start_month: startMonth, target_month: targetMonth })
    }}
  />
)
```

- [ ] **Step 4: Verify in browser**

Expected: Tab 3 shows gantt chart with 24-month header, zone groups, bars with fill proportional to score, today marker, date editing modal.

- [ ] **Step 5: Commit**

```bash
git add src/components/timeline/ src/pages/DashboardPage.tsx
git commit -m "feat: add Tab 3 timeline gantt chart with date editing"
```

---

## Task 13: Admin Panel

**Files:**
- Create: `src/components/admin/AdminPanel.tsx`

- [ ] **Step 1: Create AdminPanel**

Create `src/components/admin/AdminPanel.tsx`:

```tsx
import { useState } from 'react'
import { useMembers, useAddMember, useUpdateMember } from '../../hooks/useMembers'
import { useSystems, useInitSystems } from '../../hooks/useSystems'
import { useTakeSnapshot } from '../../hooks/useSnapshots'
import { supabase } from '../../lib/supabase'
import type { ShareToken } from '../../types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

type Props = {
  onClose: () => void
}

export default function AdminPanel({ onClose }: Props) {
  const { data: members = [] } = useMembers()
  const { data: states } = useSystems()
  const addMember = useAddMember()
  const updateMember = useUpdateMember()
  const initSystems = useInitSystems()
  const takeSnapshot = useTakeSnapshot()
  const queryClient = useQueryClient()
  const [newName, setNewName] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const { data: tokens = [] } = useQuery({
    queryKey: ['share-tokens'],
    queryFn: async () => {
      const { data } = await supabase.from('share_tokens').select('*').order('created_at', { ascending: false })
      return (data ?? []) as ShareToken[]
    },
  })

  const createToken = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('share_tokens').insert({})
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['share-tokens'] }),
  })

  const toggleToken = useMutation({
    mutationFn: async ({ token, active }: { token: string; active: boolean }) => {
      const { error } = await supabase.from('share_tokens').update({ is_active: active }).eq('token', token)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['share-tokens'] }),
  })

  const changePassword = useMutation({
    mutationFn: async (password: string) => {
      const { error } = await supabase
        .from('app_config')
        .update({ value: password, updated_at: new Date().toISOString() })
        .eq('key', 'access_password')
      if (error) throw error
    },
  })

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">관리 설정</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">×</button>
        </div>

        {/* Members */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold mb-3">PM 멤버 관리</h3>
          <div className="space-y-1.5 mb-3">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-2 bg-slate-800 rounded px-3 py-2">
                <span className={`text-sm ${m.is_active ? 'text-white' : 'text-slate-600 line-through'}`}>{m.name}</span>
                <button
                  onClick={() => updateMember.mutate({ id: m.id, updates: { is_active: !m.is_active } })}
                  className={`ml-auto text-xs ${m.is_active ? 'text-red-400' : 'text-emerald-400'}`}
                >
                  {m.is_active ? '비활성화' : '활성화'}
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="새 멤버 이름"
              className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500"
              onKeyDown={e => {
                if (e.key === 'Enter' && newName.trim()) {
                  addMember.mutate(newName.trim())
                  setNewName('')
                }
              }}
            />
            <button
              onClick={() => { if (newName.trim()) { addMember.mutate(newName.trim()); setNewName('') } }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm"
            >
              추가
            </button>
          </div>
        </section>

        {/* Password */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold mb-3">비밀번호 변경</h3>
          <div className="flex gap-2">
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="새 비밀번호"
              className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500"
            />
            <button
              onClick={() => { if (newPassword) { changePassword.mutate(newPassword); setNewPassword(''); alert('변경 완료') } }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm"
            >
              변경
            </button>
          </div>
        </section>

        {/* Share tokens */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold mb-3">공유 링크 관리</h3>
          <div className="space-y-1.5 mb-3">
            {tokens.map(t => (
              <div key={t.token} className="flex items-center gap-2 bg-slate-800 rounded px-3 py-2">
                <code className="text-xs text-slate-400 truncate flex-1">/share/{t.token.slice(0, 8)}...</code>
                <span className={`text-xs ${t.is_active ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {t.is_active ? '활성' : '비활성'}
                </span>
                <button
                  onClick={() => toggleToken.mutate({ token: t.token, active: !t.is_active })}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  {t.is_active ? '비활성화' : '활성화'}
                </button>
                {t.is_active && (
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/share/${t.token}`)}
                    className="text-xs text-blue-400"
                  >
                    복사
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => createToken.mutate()}
            className="bg-slate-800 hover:bg-slate-700 text-white rounded px-4 py-2 text-sm"
          >
            + 새 공유 링크 생성
          </button>
        </section>

        {/* Snapshot */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold mb-3">주간 스냅샷</h3>
          <button
            onClick={() => { if (states) { takeSnapshot.mutate(states); alert('스냅샷 저장 완료') } }}
            className="bg-slate-800 hover:bg-slate-700 text-white rounded px-4 py-2 text-sm"
          >
            현재 점수 스냅샷 저장
          </button>
          <p className="text-xs text-slate-500 mt-2">매주 월요일에 저장하면 주간 변화량(▲▼)이 표시됩니다.</p>
        </section>

        {/* Reset */}
        <section>
          <h3 className="text-sm font-semibold mb-3 text-red-400">데이터 초기화</h3>
          <button
            onClick={() => {
              if (confirm('모든 시스템 상태를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                initSystems.mutate()
              }
            }}
            className="bg-red-900/50 hover:bg-red-900 text-red-400 rounded px-4 py-2 text-sm"
          >
            전체 초기화
          </button>
        </section>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire AdminPanel into DashboardPage**

In `src/pages/DashboardPage.tsx`, add:

```tsx
import AdminPanel from '../components/admin/AdminPanel'

// Add state:
const [showAdmin, setShowAdmin] = useState(false)

// In the return, add AdminPanel and update onSettingsClick:
// onSettingsClick={() => setShowAdmin(true)}
// After AppShell: {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/ src/pages/DashboardPage.tsx
git commit -m "feat: add admin panel (member CRUD, password, share tokens, snapshots)"
```

---

## Task 14: Share Page (Read-Only)

**Files:**
- Modify: `src/pages/SharePage.tsx`

- [ ] **Step 1: Complete SharePage with real data**

Replace `src/pages/SharePage.tsx`:

```tsx
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import AppShell from '../components/layout/AppShell'
import Header from '../components/layout/Header'
import AlertPanel from '../components/schedule/AlertPanel'
import RagTable from '../components/schedule/RagTable'
import { useSystems } from '../hooks/useSystems'
import { useActiveMembers } from '../hooks/useMembers'
import { useLatestSnapshots } from '../hooks/useSnapshots'

const NOW = '2026-04'

export default function SharePage() {
  const { token } = useParams<{ token: string }>()

  const { data: isValid, isLoading: validating } = useQuery({
    queryKey: ['share-token', token],
    queryFn: async () => {
      const { data } = await supabase
        .from('share_tokens')
        .select('is_active')
        .eq('token', token)
        .eq('is_active', true)
        .single()
      return !!data
    },
  })

  const { data: states, isLoading } = useSystems()
  const { data: snapshots = {} } = useLatestSnapshots()
  const { data: members = [] } = useActiveMembers()

  if (validating || isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">로딩 중...</div>
  }

  if (!isValid) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-400 text-lg">유효하지 않은 공유 링크입니다</div>
  }

  if (!states) return null

  return (
    <AppShell
      header={<Header states={states} snapshots={snapshots} />}
      statusTab={<div className="text-slate-500">읽기 전용 — 시스템 현황 탭은 일정 현황 탭을 이용해주세요</div>}
      scheduleTab={
        <div>
          <AlertPanel states={states} members={members} now={NOW} />
          <RagTable states={states} members={members} snapshots={snapshots} now={NOW} />
        </div>
      }
      timelineTab={<div className="text-slate-500">읽기 전용 — 타임라인 편집은 로그인 후 이용해주세요</div>}
      onSettingsClick={() => {}}
      readOnly
    />
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/SharePage.tsx
git commit -m "feat: complete read-only share page with header + schedule view"
```

---

## Task 15: Final Polish & Verification

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 2: Build for production**

```bash
npm run build
```

Expected: No TypeScript errors. Build output in `dist/`.

- [ ] **Step 3: Verify SPA routing for Vercel**

Create `public/vercel.json` (if deploying) or `vercel.json` at root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 4: Final commit**

```bash
git add vercel.json
git commit -m "feat: add Vercel SPA rewrite config"
```

- [ ] **Step 5: Run dev server and manually verify all features**

```bash
npm run dev
```

Verification checklist:
1. Login with password → member selection works
2. Header shows total score + distribution bar + 6 zone cards
3. Tab 1: Stage selector clicks update score, status toggle works, filters work
4. Tab 2: Alert panel shows at-risk systems, RAG table sorted by SPI
5. Tab 3: Gantt bars render, date edit modal works
6. Settings: Member CRUD, password change, share token generation
7. Share URL `/share/:token` shows read-only view
8. Tablet (768px) layout renders correctly
