import type { User } from '../api/api'

const STORAGE_KEY = 'auth'

export type StoredAuth = {
  token: string
  user: User
}

export const authStorage = {
  save(data: StoredAuth) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  },

  load(): StoredAuth | null {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY)
  },
}
