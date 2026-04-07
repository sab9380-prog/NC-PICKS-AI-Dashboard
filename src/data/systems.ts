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
