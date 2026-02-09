import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAppSelector } from '@/store/redux/hooks'
import { usePerformLogoutMutation } from '@/features/auth/auth.api'

export const Route = createFileRoute('/_authenticated/admin/')({
  component: Admin,
})

export default function Admin() {
  const [triggerLogout] = usePerformLogoutMutation()
  const navigate = useNavigate()
  const user = useAppSelector((s) => s.auth.user)

  const onClickSignOutHandler = async () => {
    await triggerLogout()

    navigate({ to: '/signin', replace: true })
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
      <p>
        Welcome to the admin area
        {user ? `, ${user.firstName ?? user.username ?? ''}` : ''}.
      </p>
      <button
        className="mt-4 bg-red-600 px-3 py-2 rounded"
        onClick={onClickSignOutHandler}
      >
        Sign out
      </button>
    </div>
  )
}
