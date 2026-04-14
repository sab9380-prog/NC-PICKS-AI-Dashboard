import { useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
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
        score: sys.initialScore,
        status: 'normal' as const,
        status_reason: null,
        owner_id: sys.initialOwnerIds?.join(',') ?? null,
        start_month: '2026-04',
        target_month: ZONE_MAP[sys.zoneId]?.defaultTargetMonth ?? '2027-12',
        note: null,
        updated_at: new Date().toISOString(),
        updated_by: null,
      },
    ])
  )
}

async function fetchSystems(): Promise<Record<string, SystemState>> {
  const { data, error } = await supabase
    .from('system_states')
    .select('*')

  if (error) throw error
  if (!data || data.length === 0) throw new Error('empty')

  return Object.fromEntries(data.map(row => [row.system_id, row as SystemState]))
}

export function useSystems() {
  const queryClient = useQueryClient()

  const { data: states = createDefaultStates(), isLoading } = useQuery({
    queryKey: ['systems'],
    queryFn: fetchSystems,
    placeholderData: () => {
      const stored = loadFromStorage<Record<string, SystemState>>(STORAGE_KEYS.systems, {})
      return Object.keys(stored).length > 0 ? stored : createDefaultStates()
    },
    meta: { fallback: true },
  })

  // Keep localStorage in sync as cache for fallback
  useEffect(() => {
    if (Object.keys(states).length > 0) {
      saveToStorage(STORAGE_KEYS.systems, states)
    }
  }, [states])

  const mutation = useMutation({
    mutationFn: async ({ systemId, updates, memberId }: {
      systemId: string
      updates: Partial<SystemState>
      memberId?: string | null
    }) => {
      const current = states[systemId]
      const merged = {
        ...current,
        ...updates,
        system_id: systemId,
        updated_at: new Date().toISOString(),
        updated_by: memberId ?? current?.updated_by ?? null,
      }
      const { error } = await supabase
        .from('system_states')
        .upsert(merged, { onConflict: 'system_id' })

      if (error) throw error
      return { systemId, merged }
    },
    onMutate: async ({ systemId, updates, memberId }) => {
      await queryClient.cancelQueries({ queryKey: ['systems'] })
      const previous = queryClient.getQueryData<Record<string, SystemState>>(['systems'])

      queryClient.setQueryData<Record<string, SystemState>>(['systems'], old => {
        if (!old) return old
        return {
          ...old,
          [systemId]: {
            ...old[systemId],
            ...updates,
            updated_at: new Date().toISOString(),
            updated_by: memberId ?? old[systemId]?.updated_by ?? null,
          },
        }
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['systems'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['systems'] })
    },
  })

  const updateSystem = useCallback(
    (systemId: string, updates: Partial<SystemState>, memberId?: string | null) => {
      mutation.mutate({ systemId, updates, memberId })
    },
    [mutation]
  )

  const resetMutation = useMutation({
    mutationFn: async () => {
      const defaults = createDefaultStates()
      const rows = Object.values(defaults)
      const { error } = await supabase
        .from('system_states')
        .upsert(rows, { onConflict: 'system_id' })
      if (error) throw error
      return defaults
    },
    onSuccess: (defaults) => {
      queryClient.setQueryData(['systems'], defaults)
      saveToStorage(STORAGE_KEYS.systems, defaults)
    },
  })

  const resetAll = useCallback(() => {
    resetMutation.mutate()
  }, [resetMutation])

  return { states, updateSystem, resetAll, isLoading }
}
