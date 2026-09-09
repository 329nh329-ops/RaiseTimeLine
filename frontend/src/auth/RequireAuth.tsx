import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
