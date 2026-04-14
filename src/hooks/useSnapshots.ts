import { useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '../lib/storage'
import { SYSTEMS } from '../data/systems'
import type { ScoreSnapshot, SystemState } from '../types'

async function fetchSnapshots(): Promise<ScoreSnapshot[]> {
  const { data, error } = await supabase
    .from('score_snapshots')
    .select('*')
    .order('snapshot_at')

  if (error) throw error
  return (data as ScoreSnapshot[]) ?? []
}

export function useSnapshots() {
  const queryClient = useQueryClient()

  const { data: snapshots = [] } = useQuery({
    queryKey: ['snapshots'],
    queryFn: fetchSnapshots,
    placeholderData: () =>
      loadFromStorage<ScoreSnapshot[]>(STORAGE_KEYS.snapshots, []),
  })

  // Sync to localStorage for fallback
  useEffect(() => {
    if (snapshots.length > 0) saveToStorage(STORAGE_KEYS.snapshots, snapshots)
  }, [snapshots])

  const mutation = useMutation({
    mutationFn: async (states: Record<string, SystemState>) => {
      const today = new Date().toISOString().slice(0, 10)
      const rows = SYSTEMS.map(sys => ({
        system_id: sys.id,
        score: states[sys.id]?.score ?? 0,
        snapshot_at: today,
      }))

      const { error } = await supabase.from('score_snapshots').insert(rows)
      if (error) throw error
      return rows
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snapshots'] })
    },
  })

  const takeSnapshot = useCallback(
    (states: Record<string, SystemState>) => {
      mutation.mutate(states)
    },
    [mutation]
  )

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
