// import React, { useState } from 'react'
// import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
// import { setAuth } from '@/features/auth/auth.slice'
// import { useLoginMutation } from '@/features/auth/auth.api'
// import { useAppDispatch } from '@/store/redux/hooks'

// export const Route = createFileRoute('/signin/')({
//   component: SignIn,
// })

// export default function SignIn() {
//   const search = useSearch<{ redirect?: string }>({ from: '/signin/' })
//   const navigate = useNavigate()
//   const [login, { isLoading, error }] = useLoginMutation()
//   const dispatch = useAppDispatch()

//   const [username, setUsername] = useState('')
//   const [password, setPassword] = useState('')

//   async function onSubmit(e: React.FormEvent) {
//     e.preventDefault()
//     if (!username || !password) return

//     try {
//       const result = await login({ username, password }).unwrap()
//       dispatch(setAuth({ user: result }))

//       const redirectTo = search.redirect || '/'
//       navigate({ to: redirectTo, replace: true })
//     } catch (err) {
//       console.error('Login failed', err)
//     }
//   }

//   return (
//     <div className="p-4 max-w-md mx-auto">
//       <h2 className="text-2xl font-bold mb-4">Sign In</h2>

//       <form onSubmit={onSubmit} className="space-y-4">
//         <label className="block">
//           <div className="text-sm mb-1">Username</div>
//           <input
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             name="username"
//             required
//             className="w-full p-2 rounded bg-slate-200"
//             autoComplete="username"
//             aria-label="username"
//           />
//         </label>

//         <label className="block">
//           <div className="text-sm mb-1">Password</div>
//           <input
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             name="password"
//             type="password"
//             required
//             className="w-full p-2 rounded bg-slate-200"
//             autoComplete="current-password"
//             aria-label="password"
//           />
//         </label>

//         {error ? <div className="text-red-400">Login failed</div> : null}

//         <div>
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="bg-green-600 px-4 py-2 rounded disabled:opacity-60"
//           >
//             {isLoading ? 'Signing in…' : 'Sign In'}
//           </button>
//         </div>
//       </form>
//     </div>
//   )
// }

import React, { useState } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/zustand/store'

export const Route = createFileRoute('/signin/')({
  component: SignIn,
})

export default function SignIn() {
  const search = useSearch({ from: '/signin/' }) as { redirect?: string }
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // the setter from Zustand
  const setAuth = useAuthStore((s) => s.setUser)

  // the TanStack Mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Invalid username or password')
      }

      return res.json()
    },
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username || !password) return

    try {
      // mutateAsync to wait for the result in this try/catch block
      const result = await loginMutation.mutateAsync({ username, password })

      // Saving result to Zustand
      setAuth(result)

      const redirectTo = search.redirect || '/'
      navigate({ to: redirectTo, replace: true })
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Sign In</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <div className="text-sm mb-1">Username</div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            name="username"
            required
            className="w-full p-2 rounded bg-slate-200"
            autoComplete="username"
            aria-label="username"
          />
        </label>

        <label className="block">
          <div className="text-sm mb-1">Password</div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="password"
            type="password"
            required
            className="w-full p-2 rounded bg-slate-200"
            autoComplete="current-password"
            aria-label="password"
          />
        </label>

        {loginMutation.isError && (
          <div className="text-red-400 text-sm bg-red-400/10 p-2 rounded border border-red-400/20">
            {loginMutation.error instanceof Error
              ? loginMutation.error.message
              : 'Login failed'}
          </div>
        )}
        <div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="bg-green-600 px-4 py-2 rounded disabled:opacity-60"
          >
            {loginMutation.isPending ? 'Signing in…' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  )
}
