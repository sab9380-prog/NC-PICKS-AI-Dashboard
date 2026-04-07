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
