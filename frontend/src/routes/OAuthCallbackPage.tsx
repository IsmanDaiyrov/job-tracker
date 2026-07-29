import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(false)
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    const token = searchParams.get('token')
    if (!token) {
      setError(true)
      return
    }
    loginWithToken(token)
      .then(() => navigate('/app/table', { replace: true }))
      .catch(() => setError(true))
  }, [searchParams, loginWithToken, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center">
      {error ? (
        <p className="text-coral">Sign-in failed. Please try again.</p>
      ) : (
        <p className="text-ink/50">Signing you in…</p>
      )}
    </div>
  )
}
