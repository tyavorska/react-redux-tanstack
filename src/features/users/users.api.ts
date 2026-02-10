import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { createEntityAdapter } from '@reduxjs/toolkit'
import type { EntityState } from '@reduxjs/toolkit'
import type { User } from './users.types'

const usersAdapter = createEntityAdapter<User>({
  selectId: (user) => user.id,
  sortComparer: (a, b) => a.firstName.localeCompare(b.firstName),
})

type UsersState = EntityState<User> & {
  total: number
}

export const usersApi = createApi({
  reducerPath: 'usersApi',

  baseQuery: fetchBaseQuery({
    baseUrl: 'https://dummyjson.com',
  }),

  tagTypes: ['Users', 'User'],

  keepUnusedDataFor: 120, // longer cache retention
  refetchOnFocus: false, // avoid aggressive refetch
  refetchOnReconnect: true,

  endpoints: (builder) => ({
    getUsers: builder.query<
      UsersState,
      { q?: string; limit: number; skip: number }
    >({
      query: ({ q, limit, skip }) =>
        q
          ? `/users/search?q=${encodeURIComponent(q)}&limit=${limit}&skip=${skip}`
          : `/users?limit=${limit}&skip=${skip}`,

      transformResponse: (response: { users: Array<User>; total: number }) => {
        const normalized = usersAdapter.setAll(
          usersAdapter.getInitialState({
            total: response.total,
          }),
          response.users,
        )
        return normalized
      },

      providesTags: (result) =>
        result
          ? [
              ...result.ids.map((id) => ({
                type: 'User' as const,
                id,
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
        const tempId = Date.now()

        // Patch LIST only (not every query manually)
        const patch = dispatch(
          usersApi.util.updateQueryData(
            'getUsers',
            { q: undefined, limit: 10, skip: 0 }, // adjust if needed
            (draft) => {
              usersAdapter.addOne(draft, {
                ...(newUser as User),
                id: tempId,
              })
              draft.total += 1
            },
          ),
        )

        try {
          const { data: createdUser } = await queryFulfilled

          // Replace temp ID with real ID
          dispatch(
            usersApi.util.updateQueryData(
              'getUsers',
              { q: undefined, limit: 10, skip: 0 },
              (draft) => {
                usersAdapter.removeOne(draft, tempId)
                usersAdapter.addOne(draft, createdUser)
              },
            ),
          )
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

      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          usersApi.util.updateQueryData(
            'getUsers',
            { q: undefined, limit: 10, skip: 0 },
            (draft) => {
              usersAdapter.updateOne(draft, {
                id,
                changes: data,
              })
            },
          ),
        )

        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },

      invalidatesTags: (_, __, { id }) => [{ type: 'User', id }],
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
            { q: undefined, limit: 10, skip: 0 },
            (draft) => {
              usersAdapter.removeOne(draft, id)
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

      invalidatesTags: (_, __, id) => [{ type: 'User', id }],
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
