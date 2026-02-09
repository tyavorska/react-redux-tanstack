import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  useAddPostMutation,
  usePostsQuery,
} from '../../../features/posts/posts.api'
import type { Post } from '../../../api/api'

export const Route = createFileRoute('/_authenticated/posts/')({
  component: PostsPage,
})

export default function PostsPage() {
  const limit = 10
  const [page, setPage] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPost, setNewPost] = useState<Partial<Post>>({
    title: '',
    body: '',
    userId: 1,
  })

  const { data, isLoading, isFetching, isError } = usePostsQuery(
    limit,
    page * limit,
  )
  const addPostMutation = useAddPostMutation()

  const handleAddPost = async () => {
    await addPostMutation.mutateAsync(newPost)
    setNewPost({ title: '', body: '', userId: 1 })
    setShowAddModal(false)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Posts</h1>
        <button
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
          onClick={() => setShowAddModal(true)}
        >
          + Add Post
        </button>
      </div>

      {/* Add Post Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-slate-900 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-white">Add New Post</h2>
            <input
              value={newPost.title}
              onChange={(e) =>
                setNewPost({ ...newPost, title: e.target.value })
              }
              placeholder="Title"
              className="mb-3 w-full p-3 rounded bg-slate-800 text-white placeholder-slate-400"
            />
            <textarea
              value={newPost.body}
              onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
              placeholder="Body"
              className="mb-3 w-full p-3 rounded bg-slate-800 text-white placeholder-slate-400"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500 text-white"
                onClick={handleAddPost}
                disabled={addPostMutation.isLoading}
              >
                {addPostMutation.isLoading ? 'Adding...' : 'Add Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-slate-400">Loading posts…</div>
        ) : isError ? (
          <div className="text-red-400">Error loading posts</div>
        ) : (
          data?.posts.map((p) => (
            <div
              key={p.id}
              className="bg-slate-800 p-4 rounded hover:bg-slate-700 cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-white">{p.title}</h3>
              <p className="text-sm text-slate-300">{p.body}</p>
            </div>
          ))
        )}
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
    </div>
  )
}
