import { useState, useCallback } from 'react'
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '../lib/storage'
import { SYSTEMS } from '../data/systems'
import { getSystemScore } from '../lib/score'
import type { ScoreSnapshot, SystemState } from '../types'

export function useSnapshots() {
  const [snapshots, setSnapshots] = useState<ScoreSnapshot[]>(() =>
    loadFromStorage(STORAGE_KEYS.snapshots, [])
  )

  const takeSnapshot = useCallback((states: Record<string, SystemState>) => {
    const today = new Date().toISOString().slice(0, 10)
    const newSnaps: ScoreSnapshot[] = SYSTEMS.map((sys, i) => ({
      id: Date.now() + i,
      system_id: sys.id,
      score: getSystemScore(states[sys.id]?.stage ?? 0),
      snapshot_at: today,
    }))

    setSnapshots(prev => {
      const next = [...prev, ...newSnaps]
      saveToStorage(STORAGE_KEYS.snapshots, next)
      return next
    })
  }, [])

  // Get latest snapshot per system
  const latestSnapshots: Record<string, ScoreSnapshot> = {}
  for (let i = snapshots.length - 1; i >= 0; i--) {
    const snap = snapshots[i]
    if (!latestSnapshots[snap.system_id]) {
      latestSnapshots[snap.system_id] = snap
    }
  }

  return { snapshots, latestSnapshots, takeSnapshot }
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
