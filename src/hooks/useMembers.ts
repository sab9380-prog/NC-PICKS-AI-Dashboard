import { useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '../lib/storage'
import type { Member } from '../types'

const DEFAULT_MEMBERS: Member[] = [
  { id: 'm-kimjy', name: '김재열', is_active: true, created_at: '2026-04-01T00:00:00Z' },
  { id: 'm-kimje', name: '김지은', is_active: true, created_at: '2026-04-01T00:00:00Z' },
  { id: 'm-jungsm', name: '정수만', is_active: true, created_at: '2026-04-01T00:00:00Z' },
  { id: 'm-tipa', name: 'TIPA', is_active: true, created_at: '2026-04-01T00:00:00Z' },
  { id: 'm-baeksh', name: '백서현', is_active: true, created_at: '2026-04-01T00:00:00Z' },
  { id: 'm-hanjh', name: '한정훈', is_active: true, created_at: '2026-04-01T00:00:00Z' },
  { id: 'm-johik', name: '조한익', is_active: true, created_at: '2026-04-01T00:00:00Z' },
  { id: 'm-yunsh', name: '윤성하', is_active: true, created_at: '2026-04-01T00:00:00Z' },
  { id: 'm-hongik', name: '홍임경', is_active: true, created_at: '2026-04-01T00:00:00Z' },
  { id: 'm-kimyh', name: '김영환', is_active: true, created_at: '2026-04-01T00:00:00Z' },
  { id: 'm-yangsh', name: '양세훈', is_active: true, created_at: '2026-04-01T00:00:00Z' },
  { id: 'm-ohkm', name: '오광묵', is_active: true, created_at: '2026-04-01T00:00:00Z' },
]

async function fetchMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at')

  if (error) throw error
  if (!data || data.length === 0) throw new Error('empty')

  return data as Member[]
}

export function useMembers() {
  const queryClient = useQueryClient()

  const { data: members = DEFAULT_MEMBERS } = useQuery({
    queryKey: ['members'],
    queryFn: fetchMembers,
    placeholderData: () => {
      const stored = loadFromStorage<Member[]>(STORAGE_KEYS.members, [])
      return stored.length > 0 ? stored : DEFAULT_MEMBERS
    },
  })

  // Sync to localStorage for fallback
  useEffect(() => {
    if (members.length > 0) saveToStorage(STORAGE_KEYS.members, members)
  }, [members])

  const addMutation = useMutation({
    mutationFn: async (name: string) => {
      const newMember: Member = {
        id: crypto.randomUUID(),
        name,
        is_active: true,
        created_at: new Date().toISOString(),
      }
      const { error } = await supabase.from('members').insert(newMember)
      if (error) throw error
      return newMember
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Member> }) => {
      const { error } = await supabase
        .from('members')
        .update(updates)
        .eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['members'] })
      const previous = queryClient.getQueryData<Member[]>(['members'])

      queryClient.setQueryData<Member[]>(['members'], old =>
        old?.map(m => (m.id === id ? { ...m, ...updates } : m)) ?? []
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['members'], context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })

  const addMember = useCallback((name: string) => {
    addMutation.mutate(name)
  }, [addMutation])

  const updateMember = useCallback((id: string, updates: Partial<Member>) => {
    updateMutation.mutate({ id, updates })
  }, [updateMutation])

  const activeMembers = members.filter(m => m.is_active)

  return { members, activeMembers, addMember, updateMember }
}
