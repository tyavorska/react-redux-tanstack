import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { logout, setAuth } from './auth.slice'
import type { RootState } from '@/store/redux'
import type { User } from '@/api/api'

export type LoginRequest = { username: string; password: string }
export type LoginResponse = {
  accessToken: string
  user: User
}

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.user
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const refresh = (await baseQuery(
      { url: '/auth/refresh', method: 'POST', body: { expiresInMins: 30 } },
      api,
      extraOptions,
    )) as any

    if (refresh.data?.accessToken) {
      api.dispatch(
        setAuth({
          user: refresh.data,
        }),
      )
      result = await baseQuery(args, api, extraOptions)
    } else {
      api.dispatch(logout())
    }
  }

  return result
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    getMe: builder.query<User, void>({
      query: () => ({ url: '/auth/me' }),
    }),
    refresh: builder.mutation<LoginResponse, void>({
      query: (body) => ({ url: '/auth/refresh', method: 'POST', body }),
    }),
    performLogout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(logout())
          // Clear any local cache if needed
          dispatch(authApi.util.resetApiState())
        } catch {
          dispatch(logout())
        }
      },
    }),
  }),
})

export const {
  useLoginMutation,
  useGetMeQuery,
  useRefreshMutation,
  usePerformLogoutMutation,
} = authApi
