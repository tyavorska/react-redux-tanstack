import { createSlice } from '@reduxjs/toolkit'
import { authApi } from './auth.api'
import type { User } from '@/api/api'
import type { PayloadAction } from '@reduxjs/toolkit'

type AuthState = {
  user: User | null
}

const initialState: AuthState = {
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ user: User }>) {
      state.user = action.payload.user
    },
    logout(state) {
      state.user = null
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.getMe.matchFulfilled,
      (state, { payload }) => {
        state.user = payload
      },
    )
  },
})

export const { setAuth, logout } = authSlice.actions
export default authSlice.reducer
