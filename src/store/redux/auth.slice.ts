import { createSlice } from '@reduxjs/toolkit'
import { signIn } from './auth.thunks'
import { authStorage } from './auth.storage'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AuthState } from '@/types/auth.types'
import { AuthStatus } from '@/types/auth.types'

const initialState: AuthState = {
  user: null,
  token: null,
  status: AuthStatus.Idle,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signOut(state) {
      state.user = null
      state.token = null
      state.status = AuthStatus.Idle
      state.error = null
      authStorage.clear()
    },

    restoreSession(state, action: PayloadAction<AuthState>) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.status = AuthStatus.Succeeded
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.status = AuthStatus.Loading
        state.error = null
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.status = AuthStatus.Succeeded
        state.token = action.payload.token
        state.user = action.payload.user
        authStorage.save(action.payload)
      })
      .addCase(signIn.rejected, (state, action) => {
        state.status = AuthStatus.Failed
        state.error = action.payload ?? 'Sign in failed'
      })
  },
})

export const { signOut, restoreSession } = authSlice.actions
export default authSlice.reducer
