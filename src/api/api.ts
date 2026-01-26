export type Post = {
  id: number
  title: string
  body?: string
  userId?: number
  [key: string]: any
}

export type User = {
  // id: number
  firstName?: string
  lastName?: string
  username?: string
  email?: string
  [key: string]: any
}

export type AuthResponse = {
  token: string
  refreshToken?: string
  expiresIn?: number
  user?: User
  [key: string]: any
}

const BASE = 'https://dummyjson.com'

async function fetchJson<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return (await res.json()) as T
}

/** Posts */
export async function getPosts(
  limit = 10,
  skip = 0,
): Promise<{ posts: Array<Post>; total: number; skip: number; limit: number }> {
  return fetchJson(`${BASE}/posts?limit=${limit}&skip=${skip}`)
}

export async function getPost(id: number): Promise<Post> {
  return fetchJson(`${BASE}/posts/${id}`)
}

/** Users */
export async function getUsers(
  limit = 10,
  skip = 0,
): Promise<{ users: Array<User>; total: number; skip: number; limit: number }> {
  return fetchJson(`${BASE}/users?limit=${limit}&skip=${skip}`)
}

export async function getUser(id: number): Promise<User> {
  return fetchJson(`${BASE}/users/${id}`)
}

export async function searchUsers(
  q: string,
  limit = 10,
  skip = 0,
): Promise<{ users: Array<User>; total: number; skip: number; limit: number }> {
  return fetchJson(
    `${BASE}/users/search?q=${encodeURIComponent(q)}&limit=${limit}&skip=${skip}`,
  )
}

export async function filterUsers(
  filters: Record<string, string | number>,
): Promise<{ users: Array<User>; total?: number }> {
  const qs = Object.entries(filters)
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join('&')
  return fetchJson(`${BASE}/users/filter?${qs}`)
}

/** Auth */
export async function login(
  username: string,
  password: string,
): Promise<AuthResponse> {
  return fetchJson(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
}

export async function me(token: string): Promise<User> {
  return fetchJson(`${BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

/** small helper wrapper to persist auth in localStorage for app usage */
const AUTH_KEY = 'dummyjson_auth'

export const mockAuth = {
  async signIn(username: string, password: string) {
    const data = await login(username, password)
    const payload = { token: data.token, user: data.user ?? null }
    if (payload.token) localStorage.setItem(AUTH_KEY, JSON.stringify(payload))
    return payload
  },

  signOut() {
    localStorage.removeItem(AUTH_KEY)
  },

  getToken(): string | null {
    try {
      const raw = localStorage.getItem(AUTH_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      return parsed?.token ?? null
    } catch {
      return null
    }
  },

  getUser(): User | null {
    try {
      const raw = localStorage.getItem(AUTH_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      return parsed?.user ?? null
    } catch {
      return null
    }
  },

  isSignedIn(): boolean {
    return !!this.getToken()
  },

  async refreshMeIfSignedIn() {
    const token = this.getToken()
    if (!token) return null
    try {
      const user = await me(token)
      const raw = localStorage.getItem(AUTH_KEY)
      const parsed = raw ? JSON.parse(raw) : {}
      parsed.user = user
      localStorage.setItem(AUTH_KEY, JSON.stringify(parsed))
      return user
    } catch {
      this.signOut()
      return null
    }
  },
}
