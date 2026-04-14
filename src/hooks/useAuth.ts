import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '../lib/storage'
import type { Member } from '../types'

const DEFAULT_PASSWORD = 'picks2026'

type AuthState = {
  isAuthenticated: boolean
  currentMember: Member | null
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() =>
    loadFromStorage(STORAGE_KEYS.auth, { isAuthenticated: false, currentMember: null })
  )

  const login = useCallback(async (password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'password')
        .single()

      if (!error && data) {
        return password === data.value
      }
    } catch {
      // Supabase 실패 시 localStorage 폴백
    }

    const stored = loadFromStorage(STORAGE_KEYS.password, DEFAULT_PASSWORD)
    return password === stored
  }, [])

  const selectMember = useCallback((member: Member) => {
    const newAuth = { isAuthenticated: true, currentMember: member }
    setAuth(newAuth)
    saveToStorage(STORAGE_KEYS.auth, newAuth)
  }, [])

  const logout = useCallback(() => {
    const newAuth = { isAuthenticated: false, currentMember: null }
    setAuth(newAuth)
    saveToStorage(STORAGE_KEYS.auth, newAuth)
  }, [])

  return { ...auth, login, selectMember, logout }
}
