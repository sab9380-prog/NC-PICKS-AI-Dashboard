# Picks AI Pipeline Tracker — 설계 스펙

> **문서 버전**: v1.0  
> **작성일**: 2026-04-07  
> **기반 문서**: PRD_1.md  
> **상태**: 설계 확정

---

## 1. 제품 요약

Picks OPR 사업부의 18개 AI 시스템 개발 진척을 **자동화 성숙도 기준 7단계(0~100점)**로 추적하는 내부 웹 대시보드.  
경영진 의사결정, PM 자가 진단, 전략기획 모니터링을 단일 화면에서 지원한다.

---

## 2. 확정된 설계 결정

| 항목 | 결정 | 비고 |
|------|------|------|
| 배포 | Vercel | SPA 정적 배포 |
| DB | Supabase (PostgreSQL) | 무료 티어, 팀 공유 저장소 |
| 실시간 동기화 | 수동 새로고침 | 접속 빈도 주 1~2회 수준 |
| 인증 | 공용 비밀번호 + 이름 선택 | v1.2에서 SSO 전환 |
| PM 목록 | 관리자 CRUD | 추가/수정/비활성화 가능 |
| 경영진 URL | /share/:token 읽기 전용 | MVP 포함, 인증 없이 접근 |
| 디자인 톤 | 다크 모던 | Grafana/Datadog 스타일 |
| 구간 색상 | 6개 고유 색상 | PRD 원안의 중복 색상 해소 |
| 반응형 | PC + 태블릿 (768px~) | 모바일은 v1.1 이후 |
| 메모 | 한 줄 메모 | 시스템 카드에 표시 |
| 방치 시그널 | 7일 이상 미업데이트 경고 | updated_at 기반 계산 |
| 주간 델타 | ▲▼ 표시 | score_snapshots 테이블 |
| 상태 사유 | delay/hold 변경 시 사유 입력 | status_reason 필드 |

---

## 3. 기술 스택

| 레이어 | 선택 | 비고 |
|--------|------|------|
| 빌드 | Vite 6 | 빠른 HMR, SPA |
| UI | React 19 + TypeScript | 타입 안전성 |
| 라우팅 | React Router 7 | 탭 전환 + share URL |
| 서버 상태 | TanStack Query v5 | fetch, cache, mutation |
| 스타일 | Tailwind CSS 4 | 다크 테마, 반응형 |
| DB | Supabase (PostgreSQL) | 호스팅 + JS SDK |
| 배포 | Vercel | SPA 정적 배포 |

**Zustand 미사용** — UI 상태(활성 탭, 필터)는 URL 파라미터 또는 React useState로 처리. 상태 관리 라이브러리 1개(TanStack Query)로 통일.

---

## 4. 자동화 성숙도 7단계 (정량 지표 기반)

PRD 원안의 개발 중심 단계를 자동화 성숙도 기반으로 재설계.  
각 단계 전환은 정량 지표로 판단하며, 주관적 판단을 최소화한다.

| level | 단계명 | 점수 | 전환 기준 (모두 충족 시) |
|-------|--------|------|------------------------|
| 0 | 미착수 | 0 | — |
| 1 | 기획 | 10 | 요건 정의서 존재 + PM 배정 + 일정 확정 |
| 2 | 개발 | 25 | 스테이징 배포 완료 + 핵심 기능 테스트 통과율 ≥90% |
| 3 | 도입 | 40 | 프로덕션 배포 + 실 데이터 연결 + 대상 사용자 교육 완료율 ≥80% |
| 4 | 활용 | 60 | 자동화율 ≥30% + 주간 활성 사용률 ≥70% + 수작업 대비 시간 절감 ≥20% |
| 5 | 최적화 | 80 | 자동화율 ≥70% + 오류율 ≤5% + 인간 개입 빈도 ≤주 2회 |
| 6 | 자동화 | 100 | 자동화율 ≥95% + 오류율 ≤1% + MTTR ≤1시간 + KPI 목표 달성 |

### 점수 배분 철학

시스템을 만드는 것(0→25)은 전체의 25%. 나머지 75%는 도입→활용→최적화→자동화에 배분.  
"개발 완료"가 아니라 "실제 자동화 달성"이 점수의 핵심.

### 핵심 측정 지표 (5개)

| 지표 | 계산식 | 측정 방법 |
|------|--------|---------|
| 자동화율 | 자동 처리 건수 / 전체 처리 건수 × 100 | 시스템 로그 (MVP: PM 수동 입력) |
| 활성 사용률 | 주간 실 사용자 수 / 대상 사용자 수 × 100 | 접속 로그 (MVP: PM 수동 입력) |
| 시간 절감률 | (기존 소요시간 - 현재 소요시간) / 기존 소요시간 × 100 | Before/After 측정 |
| 오류율 | 실패 or 수정 필요 건수 / 전체 처리 건수 × 100 | 시스템 로그 |
| 인간 개입 빈도 | 수동 개입 횟수 / 주 | 운영 기록 |

### 단계 전환 UX

PM이 단계를 올릴 때, 카드 하단에 전환 조건 체크리스트 자동 표시:
- 충족 → ✅ 초록
- 미충족 → ❌ 빨강
- 조건 미충족 상태에서 수동 승격 가능하되, "조건 미충족 상태에서 승격됨" 표시가 남음

---

## 5. DB 스키마

### 테이블 구조

```sql
-- 1. PM 멤버
CREATE TABLE members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- 2. 시스템 상태 (핵심)
CREATE TABLE system_states (
  system_id     text PRIMARY KEY,           -- "s01"~"s18"
  stage         smallint DEFAULT 0,         -- 0~6
  status        text DEFAULT 'normal',      -- 'normal'|'delay'|'hold'
  status_reason text,                       -- delay/hold 사유
  owner_id      uuid REFERENCES members(id),
  start_month   text DEFAULT '2026-04',     -- "YYYY-MM"
  target_month  text,                       -- "YYYY-MM"
  note          text,                       -- 한 줄 메모
  updated_at    timestamptz DEFAULT now(),
  updated_by    uuid REFERENCES members(id)
);

-- 3. 주간 스냅샷
CREATE TABLE score_snapshots (
  id          serial PRIMARY KEY,
  system_id   text NOT NULL,
  score       smallint NOT NULL,
  snapshot_at date DEFAULT CURRENT_DATE
);

-- 4. 공유 토큰
CREATE TABLE share_tokens (
  token       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now(),
  created_by  uuid REFERENCES members(id),
  is_active   boolean DEFAULT true
);

-- 5. 앱 설정
CREATE TABLE app_config (
  key         text PRIMARY KEY,
  value       text,
  updated_at  timestamptz DEFAULT now()
);
```

### 설계 판단

- `system_states`의 PK가 text: 시스템 18개는 코드에서 고정. DB에 마스터 테이블 불필요
- `owner_id`를 FK로 연결: 드롭다운 고정 목록과 일치. 이름 변경 시 한 곳만 수정
- `score_snapshots`: 주 1회 저장 (MVP: 관리자가 관리 페이지에서 수동 트리거, v2.0: Supabase Edge Function 자동화). 18행 × 52주 = 연간 936행. 주간 델타 계산에 사용
- `change_log` 테이블 미포함: PRD v1.2 범위. 현재는 `updated_at` + `updated_by`로 추적

---

## 6. 점수 체계

### 점수 계산

```
시스템 점수(s)  = STAGE_POINTS[s.stage]  // [0, 10, 25, 40, 60, 80, 100]
구간 점수(z)    = mean( 시스템 점수(s) for s in zone z )
전체 점수       = mean( 시스템 점수(s) for all s )  // 총합 / 18
```

### SPI (Schedule Performance Index) 계산

```
경과율 = (현재월 - 시작월) / (목표월 - 시작월)
진척률 = 현재 점수 / 100
SPI    = 진척률 / 경과율

SPI ≥ 0.9  → 정상 (초록)
SPI 0.7~0.9 → 주의 (노랑)
SPI < 0.7  → 위험 (빨강)
```

### 점수 색상 임계값

| 점수 범위 | 색상 의미 |
|---------|---------|
| 70~100 | 초록 (양호) |
| 40~69 | 노랑 (주의) |
| 0~39 | 빨강 (위험) |

---

## 7. 속도 구간 데이터

6개 구간에 고유 색상 배정:

| id | name | ai_pct | target | color | default_target_month |
|----|------|--------|--------|-------|---------------------|
| 01 | 역기획 | 85 | 자동롤링 | #f59e0b (amber) | 2026-12 |
| 02 | 협상 | 50 | 당일 | #8b5cf6 (violet) | 2027-04 |
| 03 | 의사결정 | 90 | 당일 | #06b6d4 (cyan) | 2026-10 |
| 04 | 상품이동 | 70 | 13일 | #10b981 (emerald) | 2027-07 |
| 05 | 상품화 | 95 | 1일 | #f43f5e (rose) | 2027-01 |
| 06 | 출고 | 80 | 1일 | #f97316 (orange) | 2027-10 |

---

## 8. 화면 구조

### 전체 IA

```
Picks AI Pipeline Tracker
│
├── 로그인 화면
│   ├── 공용 비밀번호 입력
│   └── PM 이름 드롭다운 선택
│
├── 메인 대시보드
│   │
│   ├── 헤더 고정 영역 (한 페이지 요약판)
│   │   ├── Picks AI 전체 점수 + 주간 델타
│   │   ├── 운영완료 / 진행중 / 미착수 / 지연 수치
│   │   ├── 7단계 분포 바 (18개 시스템의 단계별 분포)
│   │   └── 구간별 6칸 (구간 점수 + 미니 분포 바 + 목표월)
│   │
│   ├── 탭 네비게이션
│   │   ├── [탭1] 시스템 현황
│   │   ├── [탭2] 일정 현황
│   │   └── [탭3] 타임라인
│   │
│   ├── 탭1: 시스템 현황
│   │   ├── 단계 범례 (7단계 이름 + 점수)
│   │   ├── 상태 필터 (전체/정상/지연/보류)
│   │   └── 구간별 그룹 × 6 (접기/펼치기)
│   │       └── 시스템 카드 × N
│   │           ├── 시스템명 + 설명 + 담당자 + 상태 배지
│   │           ├── 한 줄 메모
│   │           ├── 방치 시그널 ("N일 미업데이트")
│   │           ├── 7단계 셀렉터 (클릭 업데이트)
│   │           ├── 전환 조건 체크리스트
│   │           └── 점수 + 주간 델타
│   │
│   ├── 탭2: 일정 현황 (경영진 의사결정 뷰)
│   │   ├── "즉시 주의 필요" 영역 (위험+주의 시스템만)
│   │   │   └── SPI + 계획vs실제 비교 바 + 지연일수
│   │   └── 전체 시스템 RAG 테이블 (SPI 순 정렬)
│   │       ├── RAG 신호등 (●빨강/●노랑/●초록)
│   │       ├── 구간 배지 + 시스템명 + 담당자
│   │       ├── 현재 단계 + 점수
│   │       ├── 계획 vs 실제 비교 바
│   │       ├── SPI 수치
│   │       └── 트렌드 화살표 (↗→↘)
│   │
│   └── 탭3: 타임라인 (간트 차트)
│       ├── 좌측 고정 라벨 (시스템명 + 단계 + 점수)
│       ├── 월 헤더 (2026-01 ~ 2027-12)
│       ├── 오늘 날짜 마커 (파란 수직선)
│       ├── 구간별 그룹 분리
│       └── 간트 바 (계획 범위 + 진척 채움)
│           └── 바/라벨 클릭 시 시작월·완료월 수정
│
├── 읽기 전용 공유 (/share/:token)
│   ├── 헤더 요약판 (동일)
│   ├── 탭2 일정 현황 (동일, 편집 비활성)
│   └── 상단 "읽기 전용" 배지
│
└── 관리 페이지 (설정 아이콘)
    ├── PM 목록 CRUD (추가/수정/비활성화)
    ├── 공용 비밀번호 변경
    ├── 공유 토큰 생성/비활성화
    └── 데이터 초기화 (confirm 후)
```

### 탭2 일정 현황 — SPI 기반 의사결정 뷰

기존 간트 차트 대신 경영진 의사결정에 최적화된 뷰:

**"즉시 주의 필요" 영역:**
- SPI < 0.9인 시스템만 상단에 하이라이트
- 각 시스템에 SPI 수치 + 계획 vs 실제 비교 바 + 지연 일수 표시
- 위험도(SPI) 순 정렬

**전체 시스템 RAG 테이블:**
- 위험(빨강) → 주의(노랑) → 정상(초록) 순 정렬
- 정상 시스템은 접힘 가능 (exception-based 표시)
- 각 행: RAG 신호등 | 구간 | 시스템명+담당자 | 현재 단계 | 점수 | 계획vs실제 바 | SPI | 트렌드

### 헤더 한 페이지 요약판

모든 탭에서 항상 고정 노출:

**전체 요약 상단:**
- Picks AI 전체 점수 (대형 숫자) + 주간 델타
- 운영완료 / 진행중 / 미착수 / 지연 4개 수치

**7단계 분포 바:**
- 18개 시스템이 각 단계에 몇 개인지 비례 너비 바로 표시
- 왼쪽(미착수) → 오른쪽(자동화)으로 진행 방향 시각화

**구간별 6칸:**
- 각 구간 점수 + 주간 델타 + 미니 분포 바 + 시스템 수 + 목표월

### 반응형 브레이크포인트

| 요소 | PC (≥1024px) | 태블릿 (768~1023px) |
|------|-------------|-------------------|
| 구간 6칸 | 6열 그리드 | 3×2 그리드 |
| 시스템 카드 | 가로 레이아웃 (정보+셀렉터+점수) | 세로 스택 |
| RAG 테이블 | 전체 컬럼 표시 | 비교 바 숨김, SPI+트렌드만 |
| 간트 차트 | 좌측 라벨 220px 고정 | 좌측 라벨 160px |

---

## 9. 프로젝트 구조

```
src/
├── data/
│   ├── zones.ts              # 6개 구간 (고유 색상 포함)
│   ├── systems.ts            # 18개 시스템 마스터
│   └── stages.ts             # 7단계 정의 + 점수 + 전환 기준
│
├── lib/
│   ├── supabase.ts           # Supabase 클라이언트
│   ├── score.ts              # 점수 계산 (시스템/구간/전체/SPI)
│   └── timeline.ts           # 간트 차트 좌표 계산
│
├── hooks/
│   ├── useSystems.ts         # 시스템 상태 CRUD (TanStack Query)
│   ├── useMembers.ts         # PM 멤버 CRUD
│   ├── useSnapshots.ts       # 주간 스냅샷 조회 (델타 계산)
│   └── useAuth.ts            # 인증 상태
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx      # 전체 레이아웃
│   │   ├── Header.tsx        # 한 페이지 요약판
│   │   └── TabNav.tsx        # 3탭 전환
│   │
│   ├── auth/
│   │   └── LoginGate.tsx     # 비밀번호 + 이름 선택
│   │
│   ├── status/               # 탭1: 시스템 현황
│   │   ├── StageLegend.tsx   # 7단계 범례
│   │   ├── StatusFilter.tsx  # 상태 필터
│   │   ├── ZoneGroup.tsx     # 구간 컨테이너 (접기/펼치기)
│   │   └── SystemCard.tsx    # 시스템 카드 (셀렉터+체크리스트 포함)
│   │
│   ├── schedule/             # 탭2: 일정 현황
│   │   ├── AlertPanel.tsx    # "즉시 주의 필요" 영역
│   │   └── RagTable.tsx      # 전체 시스템 RAG 테이블
│   │
│   ├── timeline/             # 탭3: 타임라인
│   │   ├── GanttChart.tsx    # 간트 차트 컨테이너
│   │   └── GanttZoneGroup.tsx
│   │
│   └── admin/
│       └── MemberManager.tsx # PM 목록 CRUD
│
├── pages/
│   ├── DashboardPage.tsx     # 메인 (헤더 + 3탭)
│   └── SharePage.tsx         # /share/:token 읽기 전용
│
├── App.tsx                   # 라우터 + QueryProvider + AuthGate
└── main.tsx
```

---

## 10. 타임라인 계산

```ts
const TIMELINE_START = { year: 2026, month: 1 }
const TIMELINE_MONTHS = 24  // 2026-01 ~ 2027-12

// SPI 계산
function calcSPI(system: SystemState): number {
  const now = currentMonthIndex()
  const start = monthToIndex(system.start_month)
  const target = monthToIndex(system.target_month)
  
  if (now <= start) return 1.0  // 아직 시작 전
  
  const elapsed = (now - start) / (target - start)  // 경과율
  const progress = STAGE_POINTS[system.stage] / 100  // 진척률
  
  return elapsed > 0 ? progress / elapsed : 1.0
}

// 지연 일수 계산
function calcDelayDays(system: SystemState): number {
  const spi = calcSPI(system)
  if (spi >= 1.0) return 0
  
  const target = monthToIndex(system.target_month)
  const start = monthToIndex(system.start_month)
  const totalDuration = (target - start) * 30  // 월→일 근사
  const progress = STAGE_POINTS[system.stage] / 100
  const expectedProgress = calcElapsedRatio(system)
  
  return Math.round((expectedProgress - progress) * totalDuration)
}
```

---

## 11. MVP 범위 (v1.0)

### 포함

- 헤더 한 페이지 요약판 (전체 점수 + 7단계 분포 바 + 구간 6칸)
- 탭1 시스템 현황 (카드 뷰 + 7단계 셀렉터 + 상태 필터 + 전환 조건 체크리스트)
- 탭2 일정 현황 (SPI + RAG 테이블 + 즉시 주의 필요 영역)
- 탭3 타임라인 (간트 차트 + 날짜 편집)
- 로그인 (공용 비밀번호 + 이름 선택)
- 읽기 전용 공유 URL
- PM 목록 관리
- 주간 스냅샷 + 델타 표시
- 방치 시그널 (7일 미업데이트 경고)
- delay/hold 사유 입력
- 데이터 저장 (Supabase) + 초기화

### 미포함 (v1.2 이후)

- 역할 기반 권한 + SSO
- 변경 이력 (change_log 테이블)
- Slack 지연 알림
- 자동 스냅샷 (Supabase Edge Function)
- 트렌드 차트
- 모바일 반응형
- 지표 자동 수집 (시스템 로그 연동)

---

## 12. 마일스톤

| 버전 | 목표일 | 포함 범위 |
|------|--------|---------|
| **MVP (v1.0)** | 2026-05 | 전체 3탭 + 요약판 + 인증 + 공유 URL + 스냅샷 |
| **v1.1** | 2026-06 | 모바일 반응형 + 트렌드 차트 |
| **v1.2** | 2026-07 | 역할 기반 권한 + SSO + 변경 이력 |
| **v2.0** | 2026-09 | Slack 알림 + 자동 스냅샷 + 지표 자동 수집 |
