// routes/_authenticated/users/$userId.tsx
import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from '@/features/users/users.api'

export const Route = createFileRoute('/_authenticated/users/$userId')({
  component: UserPage,
})

function UserPage() {
  const { userId } = Route.useParams()
  const id = Number(userId)

  const { data: user, isLoading } = useGetUserByIdQuery(id)
  const [updateUser, { isLoading: saving }] = useUpdateUserMutation()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      })
    }
  }, [user])

  if (isLoading) {
    return <div className="p-6 text-slate-400">Loading user…</div>
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Edit User #{id}</h1>

      <div className="space-y-4 bg-slate-900 p-6 rounded-xl border border-slate-800">
        {['firstName', 'lastName', 'email'].map((field) => (
          <input
            key={field}
            value={(form as any)[field]}
            onChange={(e) =>
              setForm((f) => ({ ...f, [field]: e.target.value }))
            }
            placeholder={field}
            className="w-full rounded-lg bg-slate-800 p-3 text-white"
          />
        ))}

        <button
          disabled={saving}
          onClick={() => updateUser({ id, ...form })}
          className="w-full mt-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
