export type User = {
  id: number
  firstName: string
  lastName: string
  email: string
  username?: string
  role?: string
  address?: {
    city?: string
  }
  company?: {
    name?: string
  }
  [key: string]: any
}

export type UsersResponse = {
  users: Array<User>
  total: number
  skip: number
  limit: number
}
