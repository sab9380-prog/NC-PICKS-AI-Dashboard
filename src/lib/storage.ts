const STORAGE_KEYS = {
  systems: 'picks-tracker-systems',
  members: 'picks-tracker-members',
  snapshots: 'picks-tracker-snapshots',
  tokens: 'picks-tracker-tokens',
  password: 'picks-tracker-password',
  auth: 'picks-tracker-auth',
} as const

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {}
  return fallback
}

export function saveToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data))
}

export { STORAGE_KEYS }
