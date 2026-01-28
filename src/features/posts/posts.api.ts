import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Post } from '@/api/api'

const BASE = 'https://dummyjson.com'

export async function getPosts(
  limit = 10,
  skip = 0,
): Promise<{ posts: Array<Post>; total: number; skip: number; limit: number }> {
  const res = await fetch(`${BASE}/posts?limit=${limit}&skip=${skip}`)
  if (!res.ok) throw new Error('Failed to add post')
  return res.json()
}

export async function getPost(id: number): Promise<Post> {
  const res = await fetch(`${BASE}/posts/${id}`)
  if (!res.ok) throw new Error('Failed to add post')
  return res.json()
}

export async function addPost(post: Partial<Post>): Promise<Post> {
  const res = await fetch(`${BASE}/posts/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  })
  if (!res.ok) throw new Error('Failed to add post')
  return res.json()
}

export const usePostsQuery = (limit = 10, skip = 0) =>
  useQuery({
    queryKey: ['posts', limit, skip],
    queryFn: () => getPosts(limit, skip),
    // keepPreviousData: true,
    staleTime: 1000 * 60,
  })

export const useAddPostMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addPost,
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] })
      const previousData = queryClient.getQueryData(['posts', 10, 0])

      if (previousData) {
        queryClient.setQueryData(['posts', 10, 0], {
          ...previousData,
          posts: [
            { id: Date.now(), ...newPost } as Post,
            ...previousData.posts,
          ],
          total: previousData.total + 1,
        })
      }

      return { previousData }
    },
    onError: (err, newPost, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(['posts', 10, 0], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
