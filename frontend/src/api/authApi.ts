export type UserResponse = {
  id: number
  email: string
  username: string
  bio: string | null
  iconImageUrl: string | null
}

type AuthResponse = {
  token: string
}

type ErrorResponse = {
  message: string
}

export class ApiError extends Error {}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ErrorResponse
    return body.message
  } catch {
    return `リクエストに失敗しました（HTTP ${response.status}）`
  }
}

export async function signup(email: string, password: string, username: string): Promise<UserResponse> {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, username }),
  })

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response))
  }

  return (await response.json()) as UserResponse
}

export async function login(email: string, password: string): Promise<string> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response))
  }

  const body = (await response.json()) as AuthResponse
  return body.token
}

export async function fetchCurrentUser(token: string): Promise<UserResponse> {
  const response = await fetch('/api/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response))
  }

  return (await response.json()) as UserResponse
}
