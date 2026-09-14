import { createContext } from 'react'
import type { UserResponse } from '../api/authApi'

export type AuthContextValue = {
  accessToken: string | null
  user: UserResponse | null
  isLoading: boolean
  loginWithTokens: (accessToken: string, refreshToken: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
