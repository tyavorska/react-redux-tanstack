import React, { useEffect, useState, useTransition } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { signIn } from '@/store/auth.thunks'

export const Route = createFileRoute('/signin/')({
  component: SignIn,
})

export default function SignIn() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isPending, startTransition] = useTransition()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const authStatus = useAppSelector((s) => s.auth.status)
  const authError = useAppSelector((s) => s.auth.error)
  const user = useAppSelector((s) => s.auth.user)

  useEffect(() => {
    console.log(user, authStatus)

    if (authStatus === 'succeeded' && user) {
      navigate({ to: '/' })
    }
  }, [authStatus, user, navigate])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username || !password) return

    startTransition(() => {
      dispatch(signIn({ username, password }))
    })
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

        {authError ? <div className="text-red-400">{authError}</div> : null}

        <div>
          <button
            type="submit"
            disabled={isPending || authStatus === 'loading'}
            className="bg-green-600 px-4 py-2 rounded disabled:opacity-60"
          >
            {authStatus === 'loading' ? 'Signing in…' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  )
}
