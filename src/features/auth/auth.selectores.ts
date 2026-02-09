import { authApi } from './auth.api'
import { store } from '@/store/redux'

export const checkAuthStatus = async () => {
  const state = store.getState()

  // 1. If the store already has the user (normal navigation), we are done.
  if (state.auth.user) return true

  // 2. If the store is empty (JUST REFRESHED), we "refill" it by calling the API.
  try {
    // We manually trigger the 'getMe' endpoint logic.
    // This will send your cookies/token to the server.
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
