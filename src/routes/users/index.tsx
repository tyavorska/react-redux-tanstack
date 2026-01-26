import { useEffect, useState } from 'react'
import {
  createFileRoute,
  useLoaderData,
  useNavigate,
} from '@tanstack/react-router'
import { getUsers } from '../../api/api'
import type { User } from '../../api/api'

const PAGINATION_USERS_PER_PAGE = 20

export const Route = createFileRoute('/users/')({
  ssr: false,
  loader: async () => {
    const res = await getUsers(PAGINATION_USERS_PER_PAGE, 0)
    return { users: res.users, total: res.total }
  },
  component: Users,
})

export default function Users() {
  const loader = useLoaderData({ from: Route.id })
  const navigate = useNavigate()

  const [users, setUsers] = useState<Array<User>>(loader.users)
  const [total, setTotal] = useState<number>(loader.total)
  const [loading, setLoading] = useState(false)

  // query / filter / select / pagination state
  const [query, setQuery] = useState('')
  const [filterKey, setFilterKey] = useState('')
  const [filterValue, setFilterValue] = useState('')
  const [select, setSelect] = useState('')
  const [limit, setLimit] = useState<number>(20)
  const [skip, setSkip] = useState<number>(0)

  useEffect(() => {
    const t = setTimeout(() => {
      fetchPage({ q: query, filterKey, filterValue, select, limit, skip: 0 })
      setSkip(0)
    }, 350)

    return () => clearTimeout(t)
  }, [query, filterKey, filterValue, select, limit])

  async function fetchPage({
    q,
    filterKey,
    filterValue,
    select,
    limit,
    skip,
  }: {
    q?: string
    filterKey?: string
    filterValue?: string
    select?: string
    limit: number
    skip: number
  }) {
    setLoading(true)
    try {
      let url: string
      const base = 'https://dummyjson.com/users'

      if (q && q.trim().length > 0) {
        // search endpoint (supports limit/skip)
        url = `${base}/search?q=${encodeURIComponent(q)}&limit=${limit}&skip=${skip}`
        if (select) url += `&select=${encodeURIComponent(select)}`
      } else if (filterKey && filterValue) {
        // filter endpoint
        url = `${base}/filter?key=${encodeURIComponent(filterKey)}&value=${encodeURIComponent(
          filterValue,
        )}&limit=${limit}&skip=${skip}`
        if (select) url += `&select=${encodeURIComponent(select)}`
      } else {
        // normal list with limit/skip and optional select
        url = `${base}?limit=${limit}&skip=${skip}`
        if (select) url += `&select=${encodeURIComponent(select)}`
      }

      const res = await fetch(url)
      const json = await res.json()
      // dummyjson returns { users, total, skip, limit } for these endpoints
      const got: Array<User> = json.users ?? json.usersList ?? []
      setUsers(got)
      setTotal(typeof json.total === 'number' ? json.total : got.length)
    } catch (err) {
      console.error('Failed to fetch users', err)
      setUsers([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  function goToPage(page: number) {
    const newSkip = Math.max(0, page * limit)
    setSkip(newSkip)
    fetchPage({
      q: query,
      filterKey,
      filterValue,
      select,
      limit,
      skip: newSkip,
    })
  }

  const pageCount = Math.max(1, Math.ceil(total / Math.max(1, limit)))
  const currentPage = Math.floor(skip / Math.max(1, limit))

  useEffect(() => {
    // keep initial loader data if user hasn't triggered anything
    if (!users.length && loader.users.length) {
      setUsers(loader.users)
      setTotal(loader.total)
    }
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Users</h2>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search (server) — name, email, username..."
            className="w-full rounded p-2 bg-slate-800 text-slate-100 placeholder-slate-400"
          />
        </div>

        <div className="flex gap-2">
          <input
            value={filterKey}
            onChange={(e) => setFilterKey(e.target.value)}
            placeholder="filter key (e.g. hair.color)"
            className="rounded p-2 bg-slate-800 text-slate-100 w-40"
          />
          <input
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            placeholder="filter value (e.g. Brown)"
            className="rounded p-2 bg-slate-800 text-slate-100 w-40"
          />
        </div>

        <div>
          <input
            value={select}
            onChange={(e) => setSelect(e.target.value)}
            placeholder="select (comma separated)"
            className="rounded p-2 bg-slate-800 text-slate-100 w-44"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={limit}
            onChange={(e) => {
              const v = Number(e.target.value) || 20
              setLimit(v)
            }}
            className="rounded p-2 bg-slate-800 text-slate-100"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={0}>All</option>
          </select>
          <button
            onClick={() => {
              // manual fetch with current params
              const usedLimit = limit === 0 ? 0 : limit
              setSkip(0)
              fetchPage({
                q: query,
                filterKey,
                filterValue,
                select,
                limit: usedLimit,
                skip: 0,
              })
            }}
            className="rounded px-3 py-2 bg-slate-700 text-slate-200"
          >
            Search / Apply
          </button>
          <button
            onClick={() => {
              setQuery('')
              setFilterKey('')
              setFilterValue('')
              setSelect('')
              setLimit(20)
              setSkip(0)
              fetchPage({
                q: '',
                filterKey: '',
                filterValue: '',
                select: '',
                limit: 20,
                skip: 0,
              })
            }}
            className="rounded px-3 py-2 bg-slate-700 text-slate-200"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <div className="bg-slate-800 rounded-md overflow-auto">
            <table className="w-full text-left min-w-[720px]">
              <thead className="text-slate-400 text-sm">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">City</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-slate-400">
                      Loading…
                    </td>
                  </tr>
                ) : users.length ? (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => navigate({ to: `/users/${u.id}` })}
                      className="cursor-pointer hover:bg-slate-700 even:bg-slate-900"
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold">
                          {u.firstName} {u.lastName}{' '}
                          <span className="text-sm text-slate-400">
                            {u.username ? `(${u.username})` : ''}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {u.birthDate ?? ''}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-slate-300">
                        {u.email}
                      </td>
                      <td className="px-4 py-3 align-top text-slate-300">
                        {u.company?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 align-top text-slate-300">
                        {u.role ?? 'user'}
                      </td>
                      <td className="px-4 py-3 align-top text-slate-300">
                        {u.address?.city ?? '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-slate-400">
                      No users match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
            <div>
              Showing {users.length} of {total} users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(Math.max(0, currentPage - 1))}
                disabled={currentPage <= 0 || loading}
                className="px-3 py-1 rounded bg-slate-700 disabled:opacity-50"
              >
                Prev
              </button>
              <div>
                Page {currentPage + 1} / {pageCount}
              </div>
              <button
                onClick={() =>
                  goToPage(Math.min(pageCount - 1, currentPage + 1))
                }
                disabled={currentPage >= pageCount - 1 || loading}
                className="px-3 py-1 rounded bg-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* <aside className="w-96">
          <Outlet />
          <div className="mt-2 text-slate-500 text-sm">
            Select a user to see details
          </div>
        </aside> */}
      </div>
    </div>
  )
}
