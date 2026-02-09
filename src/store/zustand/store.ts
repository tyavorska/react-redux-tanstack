import { create } from 'zustand'
import type { User } from '@/features/users/users.types'

export const useAuthStore = create((set, get) => ({
  user: null,
  setUser: (user: User) => set({ user }),
  logout: () => set({ user: null }),
  // Selector for easy access in beforeLoad
  isAuthenticated: () => !!get().user,
}))
