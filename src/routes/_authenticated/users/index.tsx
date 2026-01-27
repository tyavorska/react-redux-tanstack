import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { User } from '@/api/api'
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from '@/features/users/users.api'

export const Route = createFileRoute('/_authenticated/users/')({
  component: UsersPage,
})

export function UsersPage() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const limit = 10

  const args = { q, limit, skip: page * limit }

  const { data, isLoading, isFetching } = useGetUsersQuery(args)
  const [deleteUser] = useDeleteUserMutation()
  const [updateUser] = useUpdateUserMutation()

  const handleDelete = (id: number) => deleteUser({ id, args })

  const handleUpdate = async () => {
    if (!editingUser) return
    await updateUser({ id: editingUser.id, data: editingUser })
    setEditingUser(null)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Users</h1>
        <button
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
          onClick={() =>
            setEditingUser({
              id: 0,
              firstName: '',
              lastName: '',
              email: '',
              phoneNumber: '',
            })
          }
        >
          + Add user
        </button>
      </div>

      {/* Search */}
      <input
        value={q}
        onChange={(e) => {
          setPage(0)
          setQ(e.target.value)
        }}
        placeholder="Search users..."
        className="mb-4 w-full rounded-lg bg-slate-800 p-3 text-white placeholder-slate-400"
      />

      {/* Users table */}
      <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
        <table className="w-full">
          <thead className="bg-slate-800 text-slate-400 text-sm">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Company</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-400">
                  Loading users…
                </td>
              </tr>
            ) : data?.users.length ? (
              data.users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-slate-800 cursor-pointer"
                  onClick={() => navigate({ to: `/users/${u.id}` })}
                >
                  <td className="p-4 text-white font-medium">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="p-4 text-slate-300">{u.email}</td>
                  <td className="p-4 text-slate-300">
                    {u.company?.name ?? '—'}
                  </td>
                  <td
                    className="p-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="text-red-400 hover:text-red-300"
                      onClick={() => handleDelete(u.id)}
                    >
                      Delete
                    </button>
                    <button
                      className="ml-2 text-blue-400 hover:text-blue-300"
                      onClick={() => setEditingUser(u)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4 text-slate-400">
        <span>
          Page {page + 1} / {Math.ceil((data?.total ?? 1) / limit)}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 bg-slate-800 rounded disabled:opacity-40"
          >
            Prev
          </button>
          <button
            disabled={data && (page + 1) * limit >= data.total}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 bg-slate-800 rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {isFetching && (
        <div className="mt-2 text-sm text-slate-500">Updating…</div>
      )}

      {/* Edit modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-6 rounded-lg w-96">
            <h2 className="text-xl text-white mb-4">
              {editingUser.id === 0 ? 'Add User' : 'Edit User'}
            </h2>
            <input
              className="w-full p-2 mb-2 rounded bg-slate-800 text-white"
              placeholder="First Name"
              value={editingUser.firstName}
              onChange={(e) =>
                setEditingUser({ ...editingUser, firstName: e.target.value })
              }
            />
            <input
              className="w-full p-2 mb-2 rounded bg-slate-800 text-white"
              placeholder="Last Name"
              value={editingUser.lastName}
              onChange={(e) =>
                setEditingUser({ ...editingUser, lastName: e.target.value })
              }
            />
            <input
              className="w-full p-2 mb-2 rounded bg-slate-800 text-white"
              placeholder="Email"
              value={editingUser.email}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-500"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500"
                onClick={handleUpdate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
