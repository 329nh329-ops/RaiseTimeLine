export type UserResponse = {
  id: number
  email: string
  username: string
  bio: string | null
  iconImageUrl: string | null
}

export type TokenPair = {
  accessToken: string
  refreshToken: string
}

type AuthResponse = {
  accessToken: string
  refreshToken: string
}

type ErrorResponse = {
  message: string
}

export class ApiError extends Error {}

export class UnauthorizedError extends ApiError {}

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

export async function login(email: string, password: string): Promise<TokenPair> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response))
  }

  const body = (await response.json()) as AuthResponse
  return { accessToken: body.accessToken, refreshToken: body.refreshToken }
}

export async function refresh(refreshToken: string): Promise<TokenPair> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    throw new UnauthorizedError(await parseErrorMessage(response))
  }

  const body = (await response.json()) as AuthResponse
  return { accessToken: body.accessToken, refreshToken: body.refreshToken }
}

export async function logout(refreshToken: string): Promise<void> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response))
  }
}

export async function fetchCurrentUser(accessToken: string): Promise<UserResponse> {
  const response = await fetch('/api/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (response.status === 401) {
    throw new UnauthorizedError(await parseErrorMessage(response))
  }

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response))
  }

  return (await response.json()) as UserResponse
}
