// import { createFileRoute, useNavigate } from '@tanstack/react-router'
// import { useAppSelector } from '@/store/redux/hooks'
// import { usePerformLogoutMutation } from '@/features/auth/auth.api'

// export const Route = createFileRoute('/_authenticated/admin/')({
//   component: Admin,
// })

// export default function Admin() {
//   const [triggerLogout] = usePerformLogoutMutation()
//   const navigate = useNavigate()
//   const user = useAppSelector((s) => s.auth.user)

//   const onClickSignOutHandler = async () => {
//     await triggerLogout()

//     navigate({ to: '/signin', replace: true })
//   }

//   return (
//     <div className="p-4">
//       <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
//       <p>
//         Welcome to the admin area
//         {user ? `, ${user.firstName ?? user.username ?? ''}` : ''}.
//       </p>
//       <button
//         className="mt-4 bg-red-600 px-3 py-2 rounded"
//         onClick={onClickSignOutHandler}
//       >
//         Sign out
//       </button>
//     </div>
//   )
// }

import { createFileRoute } from '@tanstack/react-router'
import { useLogout } from '@/hooks/useLogout'
import { useAuthStore } from '@/store/zustand/store'

export const Route = createFileRoute('/_authenticated/admin/')({
  component: Admin,
})

export default function Admin() {
  const user = useAuthStore((s) => s.user)
  // Get our new logout mutation
  const logoutMutation = useLogout()

  const onClickSignOutHandler = () => {
    // Just trigger the mutation; the hook handles navigation/cleanup
    logoutMutation.mutate()
  }

  return (
    <div className="p-4 text-slate-200">
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
      <p>
        Welcome to the admin area
        {user ? `, ${user.firstName ?? user.username ?? ''}` : ''}.
      </p>

      <button
        className="mt-4 bg-red-600 hover:bg-red-700 px-3 py-2 rounded disabled:opacity-50"
        onClick={onClickSignOutHandler}
        disabled={logoutMutation.isPending}
      >
        {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
      </button>
    </div>
  )
}
