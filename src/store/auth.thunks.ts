import { createAsyncThunk } from '@reduxjs/toolkit'
import { login } from '../api/api'
import type { User } from '../api/api'

type SignInArgs = {
  username: string
  password: string
}

type SignInResult = {
  token: string
  user: User
}

export const signIn = createAsyncThunk<
  SignInResult,
  SignInArgs,
  { rejectValue: string }
>('auth/signIn', async ({ username, password }, { rejectWithValue }) => {
  try {
    const res = await login(username, password)
    return {
      token: res.accessToken,
      user: res,
    }
  } catch {
    return rejectWithValue('Invalid username or password')
  }
})
