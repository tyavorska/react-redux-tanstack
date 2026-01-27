import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/auth.slice'
import { authApi } from '@/features/auth/auth.api'
import { usersApi } from '@/features/users/users.api'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(usersApi.middleware),

  devTools: import.meta.env.DEV,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
