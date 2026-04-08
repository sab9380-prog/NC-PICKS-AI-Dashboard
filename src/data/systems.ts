import type { SystemMeta } from '../types'

export const SYSTEMS: SystemMeta[] = [
  // 01 모니터링
  { id: 's01', zoneId: '01', name: 'AI 시스템 진척도 대시보드', desc: 'AI 시스템 개발·자동화 현황 실시간 추적', initialScore: 15 },
  { id: 's02', zoneId: '01', name: 'AI 속도 모니터링', desc: '매입→출고 전 구간 리드타임 실시간 모니터링', initialScore: 5 },
  // 02 상품 역기획
  { id: 's03', zoneId: '02', name: '12P 상품 역기획판', desc: 'OTB 실시간 자동 롤링·카테고리 믹스 최적화', initialScore: 0 },
  { id: 's04', zoneId: '02', name: 'AI 프라이싱 인텔리전스', desc: '온라인 최저가 자동 수집·RV 계산·심리가 산출', initialScore: 20 },
  { id: 's05', zoneId: '02', name: '스마트 브랜드 스카우터', desc: '유망 브랜드·상품 자동 발굴·트렌드 분석', initialScore: 15 },
  // 03 매입
  { id: 's06', zoneId: '03', name: 'AI 스마트 매입', desc: '매입 진척 실시간 대시보드·의사결정 자동화', initialScore: 0 },
  { id: 's07', zoneId: '03', name: 'AI 자동발주(PO 자동 생성)', desc: '승인 즉시 PO 자동 발행·발주 서류 생성', initialScore: 0 },
  // 04 상품화(물류)
  { id: 's08', zoneId: '04', name: 'AI 가품 판별 솔루션', desc: '비전 AI 기반 가품·정품 자동 판별', initialScore: 60 },
  { id: 's09', zoneId: '04', name: '비전 AI 스마트 분류기', desc: '시간당 3,000피스 무인 상품 분류', initialScore: 0 },
  { id: 's10', zoneId: '04', name: 'RFID 실시간 재고추적', desc: '보안택 자동 부착·Unit Level 실시간 재고 추적', initialScore: 0 },
  { id: 's11', zoneId: '04', name: 'AI D급 필터링(워스트 사전제거)', desc: '최악 상품 자동 감별·사전 제거', initialScore: 0 },
  // 05 판매(영업/매장)
  { id: 's12', zoneId: '05', name: 'AI 상품 분배', desc: 'SKU 단위 매장별 최적 자동 배분', initialScore: 30 },
  { id: 's13', zoneId: '05', name: '지능형 재고 관리 엔진(적정재고)', desc: '적정 재고 수준 자동 산출·보충 알림', initialScore: 0 },
  { id: 's14', zoneId: '05', name: 'AI 매장 최적 진열맵', desc: '골든존·조닝 순환 자동 계획', initialScore: 0 },
  { id: 's15', zoneId: '05', name: 'AI 초개인화 알림 서비스', desc: '고객별 맞춤 상품 추천·알림 자동 발송', initialScore: 0 },
  { id: 's16', zoneId: '05', name: 'AI 상품 자산 운용(3개월 완판)', desc: '3개월 내 완판 목표 자동 운영 전략', initialScore: 30 },
  { id: 's17', zoneId: '05', name: 'AI 마크다운', desc: '판매율 기반 자동 할인 트리거', initialScore: 0 },
  { id: 's18', zoneId: '05', name: 'AI 재고 자산 최적화', desc: '재고 회전율 극대화·자산 효율 최적화', initialScore: 0 },
]

export const SYSTEM_MAP = Object.fromEntries(SYSTEMS.map(s => [s.id, s])) as Record<string, SystemMeta>

export function getSystemsByZone(zoneId: string): SystemMeta[] {
  return SYSTEMS.filter(s => s.zoneId === zoneId)
}
