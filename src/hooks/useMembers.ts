import { useState, useCallback } from 'react'
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '../lib/storage'
import type { Member } from '../types'

export function useMembers() {
  const [members, setMembers] = useState<Member[]>(() =>
    loadFromStorage(STORAGE_KEYS.members, [])
  )

  const addMember = useCallback((name: string) => {
    setMembers(prev => {
      const next = [...prev, {
        id: crypto.randomUUID(),
        name,
        is_active: true,
        created_at: new Date().toISOString(),
      }]
      saveToStorage(STORAGE_KEYS.members, next)
      return next
    })
  }, [])

  const updateMember = useCallback((id: string, updates: Partial<Member>) => {
    setMembers(prev => {
      const next = prev.map(m => m.id === id ? { ...m, ...updates } : m)
      saveToStorage(STORAGE_KEYS.members, next)
      return next
    })
  }, [])

  const activeMembers = members.filter(m => m.is_active)

  return { members, activeMembers, addMember, updateMember }
}
