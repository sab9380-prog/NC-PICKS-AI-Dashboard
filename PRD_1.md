# PRD: Picks AI Pipeline Tracker

> **작성자**: 김재열 | 이랜드 Picks OPR 전략기획  
> **버전**: v1.0  
> **작성일**: 2026-04-07  
> **상태**: Draft

---

## 1. 배경 및 목적

Picks OPR 사업부는 매입→출고 6개 속도 구간에 걸쳐 **18개 AI 시스템**을 병렬 개발 중이다.  
현재 진척 현황은 담당자 구두 보고에 의존하며 아래 문제가 반복된다.

- 경영진이 전체 현황을 실시간 파악하기 어려움
- AI 시스템 PM이 타 시스템 대비 자신의 상대적 진도를 알 수 없음
- 지연 조기 감지 및 자원 재배분을 위한 구조적 시그널 없음
- 주간 보고 준비에 수작업 약 2시간/회 소요

**핵심 명제**: 속도 1일 단축 = 연간 영업이익 +0.8억 → 전 구간 AI 완성 = +120억

본 제품은 18개 AI 시스템의 개발 단계를 **7단계 100점 기준**으로 추적하고,  
구간별·전체 점수를 실시간으로 가시화하여 경영 보고, PM 자가 진단, 전략기획 모니터링을 단일 화면에서 가능하게 한다.

---

## 2. 제품 개요

| 항목 | 내용 |
|------|------|
| 제품명 | Picks AI Pipeline Tracker |
| 유형 | 내부 웹 기반 진척 관리 대시보드 |
| 주요 뷰 | (1) 시스템 현황 · (2) 로드맵 타임라인 |
| 추적 대상 | 18개 AI 시스템 / 6개 속도 구간 / 7단계 개발 사이클 |
| 핵심 지표 | 시스템 점수 / 구간 점수 / 전체 점수 (0~100pt) |
| 접근 | 사내 인트라넷 URL (MVP는 단순 인증) |
| 지원 화면 | PC 우선 / 태블릿·모바일 반응형 |

---

## 3. 사용자 및 권한

### 3.1 페르소나

| 페르소나 | 접속 빈도 | 주요 행동 | 기대 가치 |
|---------|----------|---------|---------|
| **P1. 경영진** | 주 1회 이하 | 전체·구간 점수 확인, 지연 시스템 파악 | 30초 안에 전체 현황 파악 |
| **P2. AI 시스템 PM** | 주 1~2회 | 담당 시스템 단계 업데이트, 상태 변경, 날짜 조정 | 클릭 하나로 보고 완료 |
| **P3. 전략기획 관리자** | 매일 | 지연 필터링, 구간 점수 점검, 로드맵 확인 | 보고 데이터 즉시 추출 |

### 3.2 권한 체계 (v1.2 이후)

| 역할 | 읽기 | 단계·상태 편집 | 담당자·날짜 편집 | 단계 정의 변경 |
|------|------|-------------|--------------|-------------|
| 경영진 | ✅ | ❌ | ❌ | ❌ |
| AI 시스템 PM | ✅ | 담당 시스템만 | 담당 시스템만 | ❌ |
| 전략기획 관리자 | ✅ | ✅ (전체) | ✅ (전체) | ✅ |

> MVP(v1.0)에서는 권한 구분 없이 전체 편집 허용

---

## 4. 핵심 데이터 모델

### 4.1 속도 구간 (Zone) — 고정값

```ts
type Zone = {
  id: '01' | '02' | '03' | '04' | '05' | '06'
  name: string        // 역기획 | 협상 | 의사결정 | 상품이동 | 상품화 | 출고
  ai_pct: number      // AI 자동화 목표 비율 (%)
  target: string      // 속도 목표 (예: '당일', '13일')
  color: string       // HEX 색상 코드
  default_target_month: string  // YYYY-MM
}
```

| id | name | ai_pct | target | color | default_target_month |
|----|------|--------|--------|-------|----------------------|
| 01 | 역기획 | 85 | 자동롤링 | #BA7517 | 2026-12 |
| 02 | 협상 | 50 | 당일 | #534AB7 | 2027-04 |
| 03 | 의사결정 | 90 | 당일 | #BA7517 | 2026-10 |
| 04 | 상품이동 | 70 | 13일 | #0F6E56 | 2027-07 |
| 05 | 상품화 | 95 | 1일 | #BA7517 | 2027-01 |
| 06 | 출고 | 80 | 1일 | #BA7517 | 2027-10 |

### 4.2 AI 시스템 마스터 데이터 — 고정값

```ts
type SystemMeta = {
  id: string       // s01 ~ s18
  zone_id: string  // 01 ~ 06
  name: string
  desc: string
}
```

| id | zone_id | name | desc |
|----|---------|------|------|
| s01 | 01 | TCR 2.0 시뮬레이터 | 카테고리 믹스 자동 최적화 |
| s02 | 01 | 12P 역기획판 | OTB 실시간 자동 롤링 |
| s03 | 01 | AI 상품셀렉판 | 심리가 자동 산출 |
| s04 | 02 | AI 매입 칸반 | 매입 진척 실시간 대시보드 |
| s05 | 02 | AI 프라이싱 | 온라인 최저가 자동 수집·RV 계산 |
| s06 | 02 | AI 코드 생성 | PO 코드·발주 서류 자동 생성 |
| s07 | 03 | AI PO 생성 | 승인 즉시 자동 발행 |
| s08 | 03 | AI 심리가 역기획 | 심리가 역기획 자동화 |
| s09 | 04 | AI 가품 검증 | 비전 AI · TIPA 협업 |
| s10 | 04 | AI 입고 헤이준카 | 입고 평준화 자동 스케줄링 |
| s11 | 04 | 스마트 SCM 트래커 | 리드타임 실시간 노출 |
| s12 | 05 | 비전 AI 상품분류 | 시간당 3,000피스 무인 분류 |
| s13 | 05 | RFID 태깅 자동화 | 보안택 자동 부착·Unit Level Data |
| s14 | 05 | AI D급 필터링 | 최악 상품 자동 이동 |
| s15 | 06 | OPR식 로봇 물류 | 크로스도킹 50%·자율 로봇 적치 |
| s16 | 06 | AI 최적 상품분배 | SKU 단위 매장별 자동 배분 |
| s17 | 06 | AI 마크다운 | 판매율 90% 자동 트리거 |
| s18 | 06 | AI 최적 진열 | 골든존·조닝 순환 자동 계획 |

### 4.3 시스템 상태 (State) — 사용자가 편집

```ts
type SystemState = {
  system_id: string       // s01 ~ s18
  stage: 0 | 1 | 2 | 3 | 4 | 5 | 6  // 개발 단계
  status: 'normal' | 'delay' | 'hold' // 진행 상태
  owner: string           // 담당 PM 이름
  start_month: string     // YYYY-MM
  target_month: string    // YYYY-MM
  updated_at: string      // ISO datetime
  note?: string           // 메모 (optional)
}
```

### 4.4 변경 이력 (v1.2 이후)

```ts
type ChangeLog = {
  id: string
  system_id: string
  field: 'stage' | 'status' | 'owner' | 'start_month' | 'target_month'
  old_value: string
  new_value: string
  changed_by: string
  changed_at: string  // ISO datetime
}
```

---

## 5. 점수 체계

### 5.1 7단계 정의 및 점수

```ts
type StageDef = {
  level: number
  name: string
  points: number
  criteria: string
}
```

| level | name | points | criteria |
|-------|------|--------|----------|
| 0 | 미착수 | 0 | 시작 전 — 미배정 |
| 1 | 기획 | 15 | 요건 정의 완료 · 담당 PM 배정 · 일정 산정 |
| 2 | 설계 | 30 | 아키텍처 확정 · 데이터 모델 설계 · API 인터페이스 정의 |
| 3 | 개발 | 55 | 핵심 기능 코딩 완료 · 단위 테스트 통과 · 코드 리뷰 완료 |
| 4 | 테스트 | 70 | QA 통과 · 성능·부하 검증 · 버그 수정 완료 |
| 5 | 파일럿 | 85 | 현장 실증 완료 · 실 데이터 검증 · 피드백 반영 |
| 6 | 운영 | 100 | 상시 자동화 운영 중 · KPI 목표 달성 · 모니터링 정착 |

> 점수가 비선형(15→30→55→70→85→100)인 이유: 실제 공수의 무게중심이 **개발 단계(30→55)**에 있기 때문.

### 5.2 집계 공식

```
시스템 점수(s)  = STAGE_POINTS[s.stage]

구간 점수(z)    = mean( 시스템 점수(s) for s in zone z )
               = sum(points) / count(systems in zone)

전체 점수       = mean( 시스템 점수(s) for all s )
               = sum(all points) / 18
```

### 5.3 점수 색상 임계값

| 점수 범위 | 색상 의미 |
|---------|---------|
| 70 이상 | 초록 (양호) |
| 40~69 | 노랑 (주의) |
| 39 이하 | 빨강 (위험) |

---

## 6. 기능 요구사항

### 6.1 공통 헤더 영역 (항상 노출)

| ID | 기능 | 설명 |
|----|------|------|
| FR-01 | 전체 점수 카드 | 18개 시스템 평균 점수 (0~100), 실시간 계산 |
| FR-02 | 운영 완료 카드 | stage=6인 시스템 수 |
| FR-03 | 개발 진행 카드 | stage=1~5인 시스템 수 |
| FR-04 | 지연 알림 카드 | status='delay'인 시스템 수, 1개 이상 시 빨간색 |
| FR-05 | 구간 점수 6칸 | 6개 구간별 점수 + 미니 진척 바, 구간 색상 코딩 |
| FR-06 | 전체 진척 바 | 전체 점수를 퍼센트 바로 시각화 |

### 6.2 탭 1 — 시스템 현황 뷰

| ID | 기능 | 설명 |
|----|------|------|
| FR-10 | 단계 정의 범례 | 7단계 이름·점수를 화면 상단에 항상 표시, 각 단계 색상 코딩 |
| FR-11 | 상태 필터 | 전체 / 정상 / 지연 / 보류 버튼 필터 |
| FR-12 | 구간별 그룹 | 6개 구간 헤더(구간명·AI목표%·속도목표·구간점수) + 하위 시스템 카드 |
| FR-13 | 시스템 카드 | 구간 색상 좌측 바 / 시스템명·설명 / 7단계 셀렉터 / 상태 배지 / 점수 / 담당자 |
| FR-14 | 단계 클릭 업데이트 | 단계 버튼 클릭 시 해당 단계로 즉시 변경·저장 |
| FR-15 | 상태 배지 토글 | 정상→지연→보류→정상 순환 클릭 |
| FR-16 | 담당자 편집 | 담당자 이름 클릭 시 인라인 입력 또는 prompt() |
| FR-17 | 툴팁 | 각 단계 버튼 hover 시 해당 단계의 완료 기준 텍스트 표시 |

### 6.3 탭 2 — 로드맵 타임라인 뷰

| ID | 기능 | 설명 |
|----|------|------|
| FR-20 | 월별 간트 차트 | 2026-01 ~ 2027-12 (24개월), 수평 스크롤 지원 |
| FR-21 | 오늘 날짜 마커 | 현재 월 기준선 (파란 수직선) |
| FR-22 | 구간 그룹 분리 | 타임라인 내 6개 구간 라벨·분리선 |
| FR-23 | 간트 바 시각화 | 계획 범위(연한 색) + 진척 채움(진한 색, 점수 비례) |
| FR-24 | 날짜 편집 | 시스템명 또는 바 클릭 시 시작월·완료목표월 수정 |
| FR-25 | 시스템명 + 점수 | 좌측 라벨에 시스템명·현재 단계명·점수 표시 |

### 6.4 데이터 저장

| ID | 기능 | 설명 |
|----|------|------|
| FR-30 | 퍼시스턴스 | 모든 편집 내용 자동 저장 (localStorage 또는 DB) |
| FR-31 | 초기화 | confirm 후 전체 상태를 기본값으로 리셋 |
| FR-32 | 변경 이력 | 단계·상태 변경 시 타임스탬프·변경자 기록 (v1.2) |

---

## 7. 비기능 요구사항

| ID | 분류 | 요구사항 | 기준값 |
|----|------|---------|------|
| NFR-01 | 성능 | 초기 페이지 로드 | 3초 이내 |
| NFR-02 | 성능 | 데이터 저장 응답 | 1초 이내 |
| NFR-03 | 반응형 | 브레이크포인트 지원 | 768px / 1024px / 1440px |
| NFR-04 | 보안 | 사내 인트라넷 내 서비스 | 이랜드 IT 보안 정책 준수 |
| NFR-05 | 가용성 | 업무 시간(09:00~22:00) | 99% 이상 |
| NFR-06 | 데이터 | 변경 이력 보존 | 6개월 |
| NFR-07 | 접근성 | 읽기 전용 경영진 URL | 인증 없이 접근 가능한 share URL |

---

## 8. 화면 구성 (IA)

```
Picks AI Pipeline Tracker
│
├── 헤더 고정 영역
│   ├── 전체 점수 카드 (FR-01)
│   ├── 운영 완료 카드 (FR-02)
│   ├── 개발 진행 카드 (FR-03)
│   ├── 지연 알림 카드 (FR-04)
│   ├── 구간 점수 6칸 (FR-05)
│   └── 전체 진척 바 (FR-06)
│
├── 탭 네비게이션
│   ├── [탭1] 시스템 현황
│   └── [탭2] 로드맵 타임라인
│
├── 탭1: 시스템 현황
│   ├── 단계 정의 범례 (FR-10)
│   ├── 상태 필터 바 (FR-11)
│   └── 구간 그룹 × 6
│       ├── 구간 헤더 (구간명 / AI% / 목표 / 구간점수)
│       └── 시스템 카드 × N
│           ├── [구간색 좌측 바]
│           ├── 시스템명 + 설명
│           ├── 7단계 셀렉터 (클릭 업데이트)
│           ├── 상태 배지 (클릭 토글)
│           ├── 점수 (pt)
│           └── 담당자 (클릭 편집)
│
└── 탭2: 로드맵 타임라인
    ├── 월 헤더 (2026-01 ~ 2027-12)
    ├── 오늘 날짜 마커
    └── 구간 그룹 × 6
        ├── 구간 라벨 + 구간 점수
        └── 시스템 행 × N
            ├── [좌] 시스템명 / 단계명 / 점수
            └── [우] 간트 바 (계획 범위 + 진척 채움)
```

---

## 9. 컴포넌트 구조 (권장)

```
src/
├── data/
│   ├── zones.ts          # 구간 고정 데이터
│   ├── systems.ts        # 시스템 마스터 데이터 (18개)
│   └── stageDefs.ts      # 7단계 정의 + 점수
│
├── store/
│   └── tracker.ts        # 전역 상태 (Zustand 또는 Context)
│                         # - systemStates: Record<systemId, SystemState>
│                         # - actions: setStage, setStatus, setOwner, setDates
│                         # - persist: localStorage
│
├── utils/
│   └── score.ts          # 점수 계산 함수
│                         # - getSystemScore(id)
│                         # - getZoneScore(zoneId)
│                         # - getTotalScore()
│                         # - getScoreColor(score)
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx        # 점수 카드 4개 + 구간 점수 6칸 + 전체 바
│   │   └── TabNav.tsx        # 탭 전환
│   │
│   ├── status/               # 탭1 컴포넌트
│   │   ├── StageLegend.tsx   # 단계 정의 범례
│   │   ├── StatusFilter.tsx  # 상태 필터 버튼
│   │   ├── ZoneGroup.tsx     # 구간 그룹 컨테이너
│   │   ├── SystemCard.tsx    # 시스템 카드 (단계 셀렉터 포함)
│   │   └── StageSelector.tsx # 7단계 클릭 버튼 행
│   │
│   └── roadmap/              # 탭2 컴포넌트
│       ├── GanttHeader.tsx   # 월 레이블 헤더
│       ├── GanttZoneGroup.tsx
│       ├── GanttRow.tsx      # 시스템 행 + 바
│       └── GanttBar.tsx      # 간트 바 (계획/진척 시각화)
│
└── pages/
    └── index.tsx             # 진입점
```

---

## 10. 상태 관리 스펙

### 초기 상태 생성

```ts
function createDefaultState(): Record<string, SystemState> {
  return Object.fromEntries(
    SYSTEMS.map(sys => [
      sys.id,
      {
        system_id: sys.id,
        stage: 0,
        status: 'normal',
        owner: '',
        start_month: '2026-04',
        target_month: ZONES.find(z => z.id === sys.zone_id)!.default_target_month,
        updated_at: new Date().toISOString(),
      }
    ])
  )
}
```

### 저장 키

```
localStorage key: 'picks-ai-tracker-v1'
```

### 점수 계산

```ts
const STAGE_POINTS = [0, 15, 30, 55, 70, 85, 100]

function getSystemScore(id: string): number {
  return STAGE_POINTS[state[id].stage]
}

function getZoneScore(zoneId: string): number {
  const systems = SYSTEMS.filter(s => s.zone_id === zoneId)
  const total = systems.reduce((sum, s) => sum + getSystemScore(s.id), 0)
  return Math.round(total / systems.length)
}

function getTotalScore(): number {
  const total = SYSTEMS.reduce((sum, s) => sum + getSystemScore(s.id), 0)
  return Math.round(total / SYSTEMS.length)
}
```

---

## 11. 타임라인 계산 스펙

```ts
const TIMELINE_START = { year: 2026, month: 1 }  // 2026-01
const TIMELINE_MONTHS = 24                          // 2026-01 ~ 2027-12
const TODAY = '2026-04'                             // 현재 기준월

// YYYY-MM → timeline index (0-based)
function monthToIndex(ym: string): number {
  const [y, m] = ym.split('-').map(Number)
  return (y - TIMELINE_START.year) * 12 + (m - TIMELINE_START.month)
}

// index → 화면상 left % 위치
function indexToPercent(i: number): number {
  return (i / TIMELINE_MONTHS) * 100
}

// 간트 바 계산
function getGanttBar(systemId: string) {
  const state = getSystemState(systemId)
  const score = getSystemScore(systemId)  // 0~100
  const startIdx = clamp(monthToIndex(state.start_month), 0, TIMELINE_MONTHS - 1)
  const endIdx   = clamp(monthToIndex(state.target_month), startIdx, TIMELINE_MONTHS - 1)
  const barSpan  = endIdx - startIdx + 1

  return {
    leftPct:   indexToPercent(startIdx),
    widthPct:  (barSpan / TIMELINE_MONTHS) * 100,
    fillPct:   (barSpan / TIMELINE_MONTHS) * 100 * (score / 100),  // 진척 채움
    todayPct:  indexToPercent(monthToIndex(TODAY) + 0.5),
  }
}
```

---

## 12. 성공 지표 (KPI)

| 지표 | 현재 (2026-04 기준) | 목표 |
|------|-------------------|------|
| PM 주간 업데이트율 | 0% (수작업 보고) | 80% 이상 |
| 경영 보고 준비 시간 | 약 2시간/회 | 30분 이하 |
| 지연 조기 감지 리드타임 | 약 5일 | 2일 이내 |
| 전체 AI 시스템 운영 전환율 | 0% | 100% (2027-12 목표) |

---

## 13. 마일스톤

| 버전 | 목표일 | 포함 범위 |
|------|--------|---------|
| **MVP (v1.0)** | 2026-05 | FR-01~17 (헤더 + 시스템 현황 뷰 전체) + FR-30~31 (저장·초기화) |
| **v1.1** | 2026-06 | FR-20~25 (로드맵 타임라인 뷰) |
| **v1.2** | 2026-07 | 역할 기반 권한 + SSO + FR-32 (변경 이력) |
| **v2.0** | 2026-09 | Slack 지연 알림 + 주간 자동 스냅샷 + 트렌드 차트 |

---

## 14. 제약사항 및 리스크

### 제약사항

- 이랜드 IT 보안 정책: 외부 클라우드 스토리지 불가 → 사내 서버 배포 필수
- MVP는 localStorage 기반, v1.2에서 DB + SSO 전환
- 단계 정의 점수는 프로젝트 시작 전 전 PM 합의 필요 (이후 변경 시 이력 왜곡 가능)

### 리스크

| 리스크 | 영향도 | 대응 방안 |
|--------|--------|---------|
| PM 업데이트 참여율 저조 | 높음 | 월요일 스탠드업에 트래커 업데이트를 공식 아이템으로 포함 |
| 단계 정의 팀 간 해석 차이 | 중간 | 킥오프 시 전 PM 대상 단계 정의 워크숍 + 문서화 |
| IT 인프라 제약으로 개발 지연 | 중간 | MVP는 Vercel·Netlify 임시 배포 허용 여부 IT팀 선확인 |
| SSO 연동 일정 지연 | 낮음 | v1.0은 단순 패스워드 인증으로 시작 |

---

## 15. 기술 스택 권장

| 레이어 | 권장 | 비고 |
|--------|------|------|
| 프레임워크 | Next.js 14 (App Router) | SSR + 정적 생성 모두 가능 |
| 언어 | TypeScript | 데이터 모델 타입 안정성 |
| 상태 관리 | Zustand + persist 미들웨어 | localStorage 자동 동기화 |
| 스타일 | Tailwind CSS | 빠른 반응형 구현 |
| 차트·간트 | 직접 구현 (CSS position) | 외부 Gantt 라이브러리 없이도 충분 |
| DB (v1.2+) | PostgreSQL + Prisma | 이력 관리, 권한 |
| 인증 (v1.2+) | NextAuth.js | SSO 연동 유연성 |
| 배포 (MVP) | Vercel 또는 사내 Node 서버 | IT팀 확인 필요 |

---

*끝. 이 문서를 기반으로 Claude Code에서 구현을 시작하세요.*
