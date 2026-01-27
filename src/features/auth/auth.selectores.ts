import { store } from '@/store'

export const getAuthState = () => store.getState().auth

export const isAuthenticated = () => Boolean(getAuthState().accessToken)
