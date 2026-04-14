export type ZoneId = '01' | '02' | '03' | '04' | '05'

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
  initialScore: number
  initialOwnerIds?: string[]
}

export type SystemState = {
  system_id: string
  score: number
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
