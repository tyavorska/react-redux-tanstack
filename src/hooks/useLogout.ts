import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/zustand/store'

export const useLogout = () => {
  const logoutStore = useAuthStore((s) => s.logout)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => fetch('/api/auth/logout', { method: 'POST' }),
    onSettled: () => {
      logoutStore() // Clear Zustand
      queryClient.clear() // Clear TanStack Query Cache
      navigate({ to: '/signin' })
    },
  })
}
