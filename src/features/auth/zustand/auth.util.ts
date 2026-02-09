import { queryClient } from '@/main'
import { useAuthStore } from '@/store/zustand/store'

export const checkAuthStatusZustand = async () => {
  const { user, setUser } = useAuthStore.getState()

  // 1. If already in store, return true
  if (user) return true

  // 2. If empty (Refresh), try to fetch from /auth/me
  try {
    // This sends your cookies automatically
    const userData = await queryClient.fetchQuery({
      queryKey: ['authUser'],
      queryFn: async () => {
        const res = await fetch('/api/auth/me')
        if (!res.ok) throw new Error()
        return res.json()
      },
      staleTime: 0, // Ensure we check fresh on refresh
    })

    setUser(userData) // Refill Zustand
    return true
  } catch {
    return false // Unauthorized
  }
}
