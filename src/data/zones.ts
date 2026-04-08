import type { Zone } from '../types'

export const ZONES: Zone[] = [
  { id: '01', name: '모니터링', ai_pct: 90, target: '실시간', color: '#378add', defaultTargetMonth: '2026-10' },
  { id: '02', name: '상품 역기획', ai_pct: 85, target: '자동롤링', color: '#7f77dd', defaultTargetMonth: '2026-12' },
  { id: '03', name: '매입', ai_pct: 70, target: '당일', color: '#ba7517', defaultTargetMonth: '2027-04' },
  { id: '04', name: '상품화(물류)', ai_pct: 90, target: '1일', color: '#1d9e75', defaultTargetMonth: '2027-01' },
  { id: '05', name: '판매(영업/매장)', ai_pct: 80, target: '1일', color: '#d85a30', defaultTargetMonth: '2027-07' },
]

export const ZONE_MAP = Object.fromEntries(ZONES.map(z => [z.id, z])) as Record<string, Zone>
