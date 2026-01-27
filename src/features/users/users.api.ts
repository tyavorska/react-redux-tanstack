import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { User, UsersResponse } from './users.types'

type GetUsersArgs = {
  q?: string
  limit: number
  skip: number
}

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://dummyjson.com',
  }),
  tagTypes: ['Users', 'User'],
  endpoints: (builder) => ({
    // GET USERS
    getUsers: builder.query<UsersResponse, GetUsersArgs>({
      query: ({ q, limit, skip }) =>
        q
          ? `/users/search?q=${encodeURIComponent(q)}&limit=${limit}&skip=${skip}`
          : `/users?limit=${limit}&skip=${skip}`,
      providesTags: (result) =>
        result
          ? [
              ...result.users.map((u) => ({ type: 'User' as const, id: u.id })),
              { type: 'Users', id: 'LIST' },
            ]
          : [{ type: 'Users', id: 'LIST' }],
    }),

    // GET SINGLE USER
    getUserById: builder.query<User, number>({
      query: (id) => `/users/${id}`,
      providesTags: (_, __, id) => [{ type: 'User', id }],
    }),

    // ADD USER
    addUser: builder.mutation<User, Partial<User>>({
      query: (body) => ({
        url: '/users/add',
        method: 'POST',
        body,
      }),
      async onQueryStarted(newUser, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          usersApi.util.updateQueryData(
            'getUsers',
            { q: '', limit: 20, skip: 0 }, // update current list
            (draft) => {
              draft.users.unshift({
                id: Date.now(),
                ...newUser,
              } as User)
              draft.total += 1
            },
          ),
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),

    // UPDATE USER
    updateUser: builder.mutation<User, { id: number; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        // optimistic update
        const patch = dispatch(
          usersApi.util.updateQueryData(
            'getUsers',
            { q: '', limit: 20, skip: 0 },
            (draft) => {
              const index = draft.users.findIndex((u) => u.id === id)
              if (index !== -1) {
                draft.users[index] = { ...draft.users[index], ...data }
              }
            },
          ),
        )

        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
      invalidatesTags: (_, __, { id }) => [
        { type: 'User', id },
        { type: 'Users', id: 'LIST' },
      ],
    }),

    // DELETE USER
    deleteUser: builder.mutation<void, { id: number; args: GetUsersArgs }>({
      query: ({ id }) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted({ id, args }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          usersApi.util.updateQueryData('getUsers', args, (draft) => {
            draft.users = draft.users.filter((u) => u.id !== id)
            draft.total -= 1
          }),
        )

        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi
