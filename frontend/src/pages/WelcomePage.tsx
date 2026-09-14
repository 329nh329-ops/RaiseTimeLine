import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

/**
 * 認証フローの疎通確認用の暫定ページ。
 * 本来のタイムライン画面（Issue化して別途実装予定）に置き換わるまでの仮画面。
 */
export function WelcomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          ようこそ、{user?.username}さん
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          認証APIとの疎通確認用の仮画面です。タイムライン画面は今後実装します。
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-sky-500 px-6 py-2 text-sm font-bold text-sky-500 hover:bg-sky-50"
        >
          ログアウト
        </button>
      </div>
    </div>
  )
}
