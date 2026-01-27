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
    // ======================
    // LIST USERS
    // ======================
    getUsers: builder.query<UsersResponse, GetUsersArgs>({
      query: ({ q, limit, skip }) =>
        q
          ? `/users/search?q=${q}&limit=${limit}&skip=${skip}`
          : `/users?limit=${limit}&skip=${skip}`,
      providesTags: (result) =>
        result
          ? [
              ...result.users.map((u) => ({
                type: 'User' as const,
                id: u.id,
              })),
              { type: 'Users', id: 'LIST' },
            ]
          : [{ type: 'Users', id: 'LIST' }],
    }),

    getUserById: builder.query<User, number>({
      query: (id) => `/users/${id}`,
      providesTags: (_, __, id) => [{ type: 'User', id }],
    }),

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
            { q: undefined, limit: 20, skip: 0 },
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
    updateUser: builder.mutation<User, { id: number; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'User', id },
        { type: 'Users', id: 'LIST' },
      ],
    }),

    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          usersApi.util.updateQueryData(
            'getUsers',
            { q: undefined, limit: 20, skip: 0 },
            (draft) => {
              draft.users = draft.users.filter((u) => u.id !== id)
              draft.total -= 1
            },
          ),
        )

        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
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
