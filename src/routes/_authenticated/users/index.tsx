import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { User } from '@/api/api'
import {
  useAddUserMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from '@/features/users/users.api'

export const Route = createFileRoute('/_authenticated/users/')({
  component: UsersPage,
})

//Debounce Hook
function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}

export function UsersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [modalUser, setModalUser] = useState<User | null>(null)

  const limit = 10
  const debouncedSearch = useDebounce(search, 400)

  const queryArgs = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      limit,
      skip: page * limit,
    }),
    [debouncedSearch, page],
  )

  const { data, isLoading, isFetching } = useGetUsersQuery(queryArgs)

  const [deleteUser] = useDeleteUserMutation()
  const [updateUser] = useUpdateUserMutation()
  const [addUser] = useAddUserMutation()

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteUser({ id, args: queryArgs }).unwrap()
      } catch (err) {
        console.error(err)
      }
    },
    [deleteUser, queryArgs],
  )

  const handleEdit = useCallback((user: User) => {
    setModalUser(user)
  }, [])

  const handleSave = useCallback(async () => {
    if (!modalUser) return

    try {
      if (modalUser.id) {
        await updateUser({
          id: modalUser.id,
          data: modalUser,
        }).unwrap()
      } else {
        await addUser(modalUser).unwrap()
      }

      setModalUser(null)
    } catch (err) {
      console.error(err)
    }
  }, [modalUser, updateUser, addUser])

  const totalPages = useMemo(() => {
    if (!data?.total) return 1
    return Math.ceil(data.total / limit)
  }, [data?.total])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Header
        onAdd={() =>
          setModalUser({
            id: 0,
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
          } as User)
        }
      />
      <SearchInput
        value={search}
        onChange={(val) => {
          setPage(0)
          setSearch(val)
        }}
      />
      <UsersTable
        users={Object.values(data?.entities ?? {})}
        isLoading={isLoading}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => p - 1)}
        onNext={() => setPage((p) => p + 1)}
      />

      {isFetching && (
        <div className="mt-2 text-sm text-slate-500">Updating…</div>
      )}

      {modalUser && (
        <UserModal
          user={modalUser}
          onChange={setModalUser}
          onClose={() => setModalUser(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

// Header
const Header = memo(function Header({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold text-white">Users</h1>
      <button
        onClick={onAdd}
        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
      >
        + Add user
      </button>
    </div>
  )
})

// Search

const SearchInput = memo(function SearchInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search users..."
      className="mb-4 w-full rounded-lg bg-slate-800 p-3 text-white"
    />
  )
})

const UsersTable = memo(function UsersTable({
  users,
  isLoading,
  onDelete,
  onEdit,
}: {
  users: User[]
  isLoading: boolean
  onDelete: (id: number) => void
  onEdit: (user: User) => void
}) {
  console.log(users)

  return (
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
          ) : users.length ? (
            users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onDelete={onDelete}
                onEdit={onEdit}
              />
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
  )
})

const UserRow = memo(function UserRow({
  user,
  onDelete,
  onEdit,
}: {
  user: User
  onDelete: (id: number) => void
  onEdit: (user: User) => void
}) {
  return (
    <tr className="hover:bg-slate-800">
      <td className="p-4 text-white font-medium">
        {user.firstName} {user.lastName}
      </td>
      <td className="p-4 text-slate-300">{user.email}</td>
      <td className="p-4 text-slate-300">{user.company?.name ?? '—'}</td>
      <td className="p-4 text-right">
        <button
          onClick={() => onDelete(user.id)}
          className="text-red-400 hover:text-red-300"
        >
          Delete
        </button>
        <button
          onClick={() => onEdit(user)}
          className="ml-3 text-blue-400 hover:text-blue-300"
        >
          Edit
        </button>
      </td>
    </tr>
  )
})

const Pagination = memo(function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex justify-between mt-4 text-slate-400">
      <span>
        Page {page + 1} / {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          disabled={page === 0}
          onClick={onPrev}
          className="px-3 py-1 bg-slate-800 rounded disabled:opacity-40"
        >
          Prev
        </button>
        <button
          disabled={page + 1 >= totalPages}
          onClick={onNext}
          className="px-3 py-1 bg-slate-800 rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
})

function UserModal({
  user,
  onChange,
  onClose,
  onSave,
}: {
  user: User
  onChange: (u: User) => void
  onClose: () => void
  onSave: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 p-6 rounded-lg w-96">
        <h2 className="text-xl text-white mb-4">
          {user.id ? 'Edit User' : 'Add User'}
        </h2>

        <Input
          value={user.firstName}
          placeholder="First Name"
          onChange={(v) => onChange({ ...user, firstName: v })}
        />

        <Input
          value={user.lastName}
          placeholder="Last Name"
          onChange={(v) => onChange({ ...user, lastName: v })}
        />

        <Input
          value={user.email}
          placeholder="Email"
          onChange={(v) => onChange({ ...user, email: v })}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1 bg-gray-600 rounded">
            Cancel
          </button>
          <button onClick={onSave} className="px-3 py-1 bg-blue-600 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function Input({
  value,
  placeholder,
  onChange,
}: {
  value: string
  placeholder: string
  onChange: (v: string) => void
}) {
  return (
    <input
      className="w-full p-2 mb-2 rounded bg-slate-800 text-white"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
