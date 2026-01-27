// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
// import type { User } from '@/api/api'

// export type LoginRequest = {
//   username: string
//   password: string
// }

// export type LoginResponse = {
//   accessToken: string
//   refreshToken: string
//   user: User
// }

// export const authApi = createApi({
//   reducerPath: 'authApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: 'https://dummyjson.com',
//   }),
//   endpoints: (builder) => ({
//     login: builder.mutation<LoginResponse, LoginRequest>({
//       query: (body) => ({
//         url: '/auth/login',
//         method: 'POST',
//         body,
//       }),
//     }),
//   }),
// })

// export const { useLoginMutation } = authApi
// features/auth/auth.api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { logout, setAuth } from './auth.slice'
import type { RootState } from '@/store'
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
    const token = (getState() as RootState).auth.accessToken
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const refresh = (await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions,
    )) as any

    if (refresh.data?.accessToken) {
      api.dispatch(
        setAuth({
          accessToken: refresh.data.accessToken,
          user: refresh.data.user,
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
  }),
})

export const { useLoginMutation, useGetMeQuery, useRefreshMutation } = authApi
