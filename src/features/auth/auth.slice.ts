import { createSlice } from '@reduxjs/toolkit'
import type { User } from '@/api/api'
import type { PayloadAction } from '@reduxjs/toolkit'

// type AuthState = {
//   token: string | null
//   refreshToken: string | null
//   user: User | null
// }

// const initialState: AuthState = {
//   token: null,
//   refreshToken: null,
//   user: null,
// }

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     setAuth(state, action: PayloadAction<AuthState>) {
//       state.token = action.payload.token
//       state.refreshToken = action.payload.refreshToken
//       state.user = action.payload.user
//     },
//     logout(state) {
//       state.token = null
//       state.refreshToken = null
//       state.user = null
//     },
//   },
// })

// export const { setAuth, logout } = authSlice.actions
// export default authSlice.reducer

// // features/auth/auth.slice.ts
// import { createSlice, PayloadAction } from '@reduxjs/toolkit'
// import type { User } from '@/api/api'

type AuthState = {
  accessToken: string | null
  user: User | null
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ accessToken: string; user: User }>) {
      console.log(action.payload.accessToken)

      state.accessToken = action.payload.accessToken
      state.user = action.payload.user
    },
    logout(state) {
      state.accessToken = null
      state.user = null
    },
  },
})

export const { setAuth, logout } = authSlice.actions
export default authSlice.reducer
