import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { fetchCurrentUser, logout as logoutApi, refresh, UnauthorizedError } from '../api/authApi'
import { AuthContext } from './authContextInstance'

const ACCESS_TOKEN_STORAGE_KEY = 'raiseTimeLineAccessToken'
const REFRESH_TOKEN_STORAGE_KEY = 'raiseTimeLineRefreshToken'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY),
  )
  const [user, setUser] = useState<Awaited<ReturnType<typeof fetchCurrentUser>> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const clearTokens = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
    setAccessToken(null)
    setUser(null)
  }, [])

  const loginWithTokens = useCallback(async (newAccessToken: string, newRefreshToken: string) => {
    const currentUser = await fetchCurrentUser(newAccessToken)
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, newAccessToken)
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, newRefreshToken)
    setAccessToken(newAccessToken)
    setUser(currentUser)
  }, [])

  const logout = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
    if (storedRefreshToken) {
      try {
        await logoutApi(storedRefreshToken)
      } catch {
        // サーバー側の失効に失敗しても、フロントエンドのログイン状態は破棄する
      }
    }
    clearTokens()
  }, [clearTokens])

  const hasVerifiedInitialSession = useRef(false)

  useEffect(() => {
    // StrictModeの開発時二重マウントで、ワンタイムのリフレッシュトークンを
    // 二重消費してしまわないようにするためのガード
    if (hasVerifiedInitialSession.current) {
      return
    }
    hasVerifiedInitialSession.current = true

    const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)

    if (!storedAccessToken || !storedRefreshToken) {
      setIsLoading(false)
      return
    }

    fetchCurrentUser(storedAccessToken)
      .then(setUser)
      .catch(async (err) => {
        if (!(err instanceof UnauthorizedError)) {
          clearTokens()
          return
        }

        try {
          const tokens = await refresh(storedRefreshToken)
          localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, tokens.accessToken)
          localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken)
          setAccessToken(tokens.accessToken)
          setUser(await fetchCurrentUser(tokens.accessToken))
        } catch {
          clearTokens()
        }
      })
      .finally(() => setIsLoading(false))
    // 初回マウント時のみトークンの有効性を検証する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthContext.Provider value={{ accessToken, user, isLoading, loginWithTokens, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
