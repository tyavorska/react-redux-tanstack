import type { User } from '@/api/api'

export enum AuthStatus {
  Idle = 'idle',
  Loading = 'loading',
  Succeeded = 'succeeded',
  Failed = 'failed',
}

export interface AuthState {
  user: User | null
  token: string | null
  status: AuthStatus
  error: string | null
}
