import { useMemo } from 'react'
import { SYSTEMS } from '../data/systems'
import { ZONES } from '../data/zones'
import { getStageFromScore } from '../lib/score'
import { STAGES } from '../data/stages'
import type { ScoreSnapshot, SystemState } from '../types'

/** ISO week string e.g. '2026-W15' */
export function getISOWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

/** Convert ISO week to Korean label e.g. '4월 2주차' */
export function weekToKorean(isoWeek: string): string {
  const [yearStr, wStr] = isoWeek.split('-W')
  const weekNum = parseInt(wStr)
  const year = parseInt(yearStr)
  // Approximate: week 1 starts around Jan 1
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const firstMonday = new Date(year, 0, 4 - dayOfWeek + 1)
  const targetDate = new Date(firstMonday.getTime() + (weekNum - 1) * 7 * 86400000)
  const month = targetDate.getMonth() + 1
  // Calculate which week of the month
  const firstOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
  const firstMondayOfMonth = new Date(firstOfMonth)
  const fDay = firstMondayOfMonth.getDay() || 7
  if (fDay > 1) firstMondayOfMonth.setDate(firstMondayOfMonth.getDate() + (8 - fDay))
  const adjustedWeek = Math.max(1, Math.min(5, Math.ceil(targetDate.getDate() / 7)))
  return `${month}월 ${adjustedWeek}주`
}

/** Get week date range string e.g. '04.07 ~ 04.13' */
export function weekDateRange(isoWeek: string): string {
  const [yearStr, wStr] = isoWeek.split('-W')
  const weekNum = parseInt(wStr)
  const year = parseInt(yearStr)
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const firstMonday = new Date(year, 0, 4 - dayOfWeek + 1)
  const monday = new Date(firstMonday.getTime() + (weekNum - 1) * 7 * 86400000)
  const sunday = new Date(monday.getTime() + 6 * 86400000)
  const fmt = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  return `${fmt(monday)} ~ ${fmt(sunday)}`
}

export type WeeklySystemData = {
  systemId: string
  name: string
  zoneId: string
  owner: string
  currentScore: number
  currentStage: number
  weekScores: Record<string, number | null> // isoWeek -> score
}

export type WeeklyZoneData = {
  zoneId: string
  zoneName: string
  systems: WeeklySystemData[]
  weekAverages: Record<string, number> // isoWeek -> avg
}

export type WeeklySummary = {
  currentWeek: string
  weeks: string[] // sorted ISO weeks
  totalAvg: number
  totalAvgDelta: number | null
  stageChanges: { systemId: string; name: string; fromStage: string; toStage: string }[]
  scoreUp: number
  scoreFlat: number
  scoreDown: number
  topGainers: { systemId: string; name: string; delta: number; fromStage: string; toStage: string; desc: string }[]
  needsAttention: { systemId: string; name: string; score: number; desc: string }[]
  zones: WeeklyZoneData[]
  zoneAvgs: Record<string, { avg: number; delta: number | null }>
}

function getStageName(score: number): string {
  const level = getStageFromScore(score)
  return STAGES[level].name
}

export function useWeeklyData(
  snapshots: ScoreSnapshot[],
  states: Record<string, SystemState>,
  members: Record<string, { name: string }>,
): WeeklySummary {
  return useMemo(() => {
    // Group snapshots by week
    const weekMap: Record<string, Record<string, number>> = {} // isoWeek -> systemId -> score
    for (const snap of snapshots) {
      const week = getISOWeek(snap.snapshot_at)
      if (!weekMap[week]) weekMap[week] = {}
      // Take latest snapshot per system per week
      weekMap[week][snap.system_id] = snap.score
    }

    // Sort weeks
    const weeks = Object.keys(weekMap).sort()
    const currentWeek = weeks.length > 0 ? weeks[weeks.length - 1] : getISOWeek(new Date().toISOString().slice(0, 10))
    const prevWeek = weeks.length > 1 ? weeks[weeks.length - 2] : null

    // Build per-system data
    const systemDataMap: Record<string, WeeklySystemData> = {}
    for (const sys of SYSTEMS) {
      const ownerIds = states[sys.id]?.owner_id?.split(',') ?? sys.initialOwnerIds ?? []
      const ownerNames = ownerIds.map(id => members[id.trim()]?.name ?? id.trim()).join(', ')
      const currentScore = states[sys.id]?.score ?? sys.initialScore

      const weekScores: Record<string, number | null> = {}
      for (const w of weeks) {
        weekScores[w] = weekMap[w]?.[sys.id] ?? null
      }

      systemDataMap[sys.id] = {
        systemId: sys.id,
        name: sys.name,
        zoneId: sys.zoneId,
        owner: ownerNames || '미정',
        currentScore,
        currentStage: getStageFromScore(currentScore),
        weekScores,
      }
    }

    // Calculate stage changes and score movements
    const stageChanges: WeeklySummary['stageChanges'] = []
    let scoreUp = 0, scoreFlat = 0, scoreDown = 0
    const topGainers: WeeklySummary['topGainers'] = []
    const needsAttention: WeeklySummary['needsAttention'] = []

    for (const sys of SYSTEMS) {
      const data = systemDataMap[sys.id]
      const curScore = data.weekScores[currentWeek] ?? data.currentScore
      const prevScore = prevWeek ? (data.weekScores[prevWeek] ?? null) : null

      if (prevScore !== null) {
        const delta = curScore - prevScore
        if (delta > 0) {
          scoreUp++
          const fromStage = getStageName(prevScore)
          const toStage = getStageName(curScore)
          topGainers.push({
            systemId: sys.id,
            name: sys.name,
            delta,
            fromStage,
            toStage,
            desc: sys.desc,
          })
          if (fromStage !== toStage) {
            stageChanges.push({
              systemId: sys.id,
              name: sys.name,
              fromStage,
              toStage,
            })
          }
        } else if (delta < 0) {
          scoreDown++
        } else {
          scoreFlat++
        }
      } else {
        scoreFlat++
      }

      // Systems needing attention: 0 score for 2+ weeks or score decreased
      const prevPrevWeek = weeks.length > 2 ? weeks[weeks.length - 3] : null
      const _prevPrevScore = prevPrevWeek ? (data.weekScores[prevPrevWeek] ?? null) : null
      if (curScore === 0 && (prevScore === 0 || prevScore === null)) {
        needsAttention.push({
          systemId: sys.id,
          name: sys.name,
          score: curScore,
          desc: sys.desc,
        })
      }
    }

    // Sort top gainers by delta desc
    topGainers.sort((a, b) => b.delta - a.delta)

    // Zone data
    const zones: WeeklyZoneData[] = ZONES.map(zone => {
      const zoneSystems = SYSTEMS.filter(s => s.zoneId === zone.id)
      const weekAverages: Record<string, number> = {}
      for (const w of weeks) {
        const scores = zoneSystems.map(s => weekMap[w]?.[s.id] ?? 0)
        weekAverages[w] = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0
      }
      return {
        zoneId: zone.id,
        zoneName: zone.name,
        systems: zoneSystems.map(s => systemDataMap[s.id]),
        weekAverages,
      }
    })

    // Zone averages with delta
    const zoneAvgs: Record<string, { avg: number; delta: number | null }> = {}
    for (const zone of zones) {
      const curAvg = zone.weekAverages[currentWeek] ?? 0
      const prevAvg = prevWeek ? (zone.weekAverages[prevWeek] ?? null) : null
      zoneAvgs[zone.zoneId] = {
        avg: curAvg,
        delta: prevAvg !== null ? Math.round((curAvg - prevAvg) * 10) / 10 : null,
      }
    }

    // Total averageh
    const allCurrentScores = SYSTEMS.map(s => weekMap[currentWeek]?.[s.id] ?? 0)
    const totalAvg = allCurrentScores.length > 0
      ? Math.round((allCurrentScores.reduce((a, b) => a + b, 0) / allCurrentScores.length) * 10) / 10
      : 0
    const allPrevScores = prevWeek ? SYSTEMS.map(s => weekMap[prevWeek]?.[s.id] ?? 0) : null
    const prevTotalAvg = allPrevScores
      ? Math.round((allPrevScores.reduce((a, b) => a + b, 0) / allPrevScores.length) * 10) / 10
      : null
    const totalAvgDelta = prevTotalAvg !== null ? Math.round((totalAvg - prevTotalAvg) * 10) / 10 : null

    return {
      currentWeek,
      weeks,
      totalAvg,
      totalAvgDelta,
      stageChanges,
      scoreUp,
      scoreFlat,
      scoreDown,
      topGainers,
      needsAttention,
      zones,
      zoneAvgs,
    }
  }, [snapshots, states, members])
}
