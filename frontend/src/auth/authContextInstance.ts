import { createContext } from 'react'
import type { UserResponse } from '../api/authApi'

export type AuthContextValue = {
  token: string | null
  user: UserResponse | null
  isLoading: boolean
  loginWithToken: (token: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
