import { authApi } from './auth.api'
import { store } from '@/store/redux'

export const checkAuthStatus = async () => {
  const state = store.getState()

  if (state.auth.user) return true

  // If the store is empty (JUST REFRESHED)
  try {
    // We manually trigger the 'getMe' endpoint logic.
    const result = await store
      .dispatch(authApi.endpoints.getMe.initiate())
      .unwrap()

    // If the call succeeds, 'result' is the user data.
    return !!result
  } catch (error) {
    // If the server returns 401, the user is not logged in.
    return false
  }
}
