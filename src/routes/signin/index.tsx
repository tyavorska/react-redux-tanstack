import React, { useState } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useAppDispatch } from '../../store/hooks'
import { setAuth } from '@/features/auth/auth.slice'
import { useLoginMutation } from '@/features/auth/auth.api'

export const Route = createFileRoute('/signin/')({
  component: SignIn,
})

export default function SignIn() {
  const search = useSearch<{ redirect?: string }>({ from: '/signin/' })
  const navigate = useNavigate()
  const [login, { isLoading, error }] = useLoginMutation()
  const dispatch = useAppDispatch()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username || !password) return

    try {
      const result = await login({ username, password }).unwrap()
      dispatch(setAuth({ accessToken: result.accessToken, user: result.user }))

      const redirectTo = search.redirect || '/'
      navigate({ to: redirectTo, replace: true })
    } catch (err) {
      console.error('Login failed', err)
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

        {error ? <div className="text-red-400">Login failed</div> : null}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-green-600 px-4 py-2 rounded disabled:opacity-60"
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  )
}
