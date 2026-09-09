import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { fetchCurrentUser } from '../api/authApi'
import { AuthContext } from './authContextInstance'

const TOKEN_STORAGE_KEY = 'raiseTimeLineToken'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY))
  const [user, setUser] = useState<Awaited<ReturnType<typeof fetchCurrentUser>> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loginWithToken = useCallback(async (newToken: string) => {
    const currentUser = await fetchCurrentUser(newToken)
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken)
    setToken(newToken)
    setUser(currentUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    fetchCurrentUser(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setToken(null)
      })
      .finally(() => setIsLoading(false))
    // 初回マウント時のみトークンの有効性を検証する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, isLoading, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
