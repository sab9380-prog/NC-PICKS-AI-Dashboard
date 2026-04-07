import { useState, useCallback } from 'react'
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '../lib/storage'
import { SYSTEMS } from '../data/systems'
import { ZONE_MAP } from '../data/zones'
import type { SystemState } from '../types'

function createDefaultStates(): Record<string, SystemState> {
  return Object.fromEntries(
    SYSTEMS.map(sys => [
      sys.id,
      {
        system_id: sys.id,
        stage: 0,
        status: 'normal' as const,
        status_reason: null,
        owner_id: null,
        start_month: '2026-04',
        target_month: ZONE_MAP[sys.zoneId]?.defaultTargetMonth ?? '2027-12',
        note: null,
        updated_at: new Date().toISOString(),
        updated_by: null,
      },
    ])
  )
}

export function useSystems() {
  const [states, setStates] = useState<Record<string, SystemState>>(() => {
    const stored = loadFromStorage<Record<string, SystemState>>(STORAGE_KEYS.systems, {})
    if (Object.keys(stored).length === 0) {
      const defaults = createDefaultStates()
      saveToStorage(STORAGE_KEYS.systems, defaults)
      return defaults
    }
    return stored
  })

  const updateSystem = useCallback((systemId: string, updates: Partial<SystemState>, memberId?: string | null) => {
    setStates(prev => {
      const next = {
        ...prev,
        [systemId]: {
          ...prev[systemId],
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: memberId ?? prev[systemId]?.updated_by ?? null,
        },
      }
      saveToStorage(STORAGE_KEYS.systems, next)
      return next
    })
  }, [])

  const resetAll = useCallback(() => {
    const defaults = createDefaultStates()
    setStates(defaults)
    saveToStorage(STORAGE_KEYS.systems, defaults)
  }, [])

  return { states, updateSystem, resetAll, isLoading: false }
}
