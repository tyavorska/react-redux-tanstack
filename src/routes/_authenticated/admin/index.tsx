import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '../../../store/hooks'
import { logout } from '@/features/auth/auth.slice'
// import { signOut } from '@/store/auth.slice'

export const Route = createFileRoute('/_authenticated/admin/')({
  component: Admin,
})

export default function Admin() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useAppSelector((s) => s.auth.user)

  const onClickSignOutHandler = () => {
    dispatch(logout())
    navigate({ to: '/' })
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
