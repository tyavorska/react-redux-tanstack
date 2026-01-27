import React from 'react'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { getPosts, getUsers } from '../../api/api'

export const Route = createFileRoute('/_authenticated/')({
  ssr: false,
  loader: async () => {
    const [postsRes, usersRes] = await Promise.all([getPosts(), getUsers()])
    return { posts: postsRes.posts, users: usersRes.users }
  },
  component: Home,
})

export default function Home() {
  const { posts, users } = useLoaderData({ from: Route.id })

  const totalPosts = posts.length
  const totalUsers = users.length

  const postsPerUser = React.useMemo(() => {
    const map = new Map<number | string, number>()
    for (const p of posts) {
      const uid = p.userId ?? 'unknown'
      map.set(uid, (map.get(uid) ?? 0) + 1)
    }
    const arr = Array.from(map.entries()).map(([id, count]) => ({ id, count }))
    arr.sort((a, b) => b.count - a.count)
    return arr.slice(0, 6)
  }, [posts])

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <header className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-2">
          KeepIt — Demo Dashboard
        </h1>
        <p className="text-slate-300 mb-6">
          A small demo site showcasing user & post data powered by dummyjson.
          Use this UI to explore posts and users, sign in to access the admin
          panel, and see quick insights about content distribution.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard title="Total posts" value={totalPosts} />
          <StatCard title="Total users" value={totalUsers} />
          <StatCard
            title="Average posts / user"
            value={totalUsers ? (totalPosts / totalUsers).toFixed(2) : '0'}
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <section className="bg-slate-800 rounded-md p-4 mb-6">
          <h2 className="text-2xl font-semibold mb-3">Posts by user (top)</h2>
          {postsPerUser.length === 0 ? (
            <div className="text-slate-300">No posts available</div>
          ) : (
            <BarChart data={postsPerUser} />
          )}
        </section>
        <div className="bg-slate-800 rounded-md p-4">
          <h3 className="text-xl font-medium mb-2">Notes</h3>
          <p className="text-slate-300 text-sm">
            Data is fetched from dummyjson.com. This demo stores authenticated
            user info in Redux so other pages (admin, posts) can access user
            details after sign-in.
          </p>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-slate-800 rounded-md p-4 flex flex-col">
      <div className="text-sm text-slate-400">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}

function BarChart({
  data,
}: {
  data: Array<{ id: number | string; count: number }>
}) {
  const max = Math.max(...data.map((d) => d.count), 1)
  const barHeight = 28
  const gap = 10
  const height = data.length * (barHeight + gap)
  const width = 640

  return (
    <div className="overflow-x-auto">
      <svg width={Math.min(width, 800)} height={height} className="block">
        {data.map((d, i) => {
          const y = i * (barHeight + gap)
          const barWidth = (d.count / max) * (width - 160)
          return (
            <g key={String(d.id)} transform={`translate(0, ${y})`}>
              <text
                x={0}
                y={barHeight / 2}
                dy="0.35em"
                className="text-slate-300"
                fill="#cbd5e1"
                fontSize={12}
              >
                {String(d.id)}
              </text>
              <rect
                x={120}
                y={0}
                rx={6}
                ry={6}
                width={barWidth}
                height={barHeight}
                fill="#38bdf8"
              />
              <text
                x={120 + barWidth + 8}
                y={barHeight / 2}
                dy="0.35em"
                className="text-slate-300"
                fill="#e2e8f0"
                fontSize={12}
              >
                {d.count}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="mt-3 text-sm text-slate-400">
        Bars show number of posts per user (top users)
      </div>
    </div>
  )
}
