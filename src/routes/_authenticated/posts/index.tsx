import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getPosts } from '../../../api/api'
import type { Post } from '../../../api/api'

export const Route = createFileRoute('/_authenticated/posts/')({
  component: Posts,
})

export default function Posts() {
  const [posts, setPosts] = useState<Array<Post> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getPosts(20, 0)
      .then((res) => {
        if (mounted) setPosts(res.posts)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <div className="p-4">Loading posts…</div>

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Posts</h2>
      <ul className="space-y-2">
        {posts?.map((p) => (
          <li key={p.id} className="bg-slate-800 p-3 rounded">
            <h3 className="text-xl font-semibold">{p.title}</h3>
            <p className="text-sm text-slate-300">{p.body}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
