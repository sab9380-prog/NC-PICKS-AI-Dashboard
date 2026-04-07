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
