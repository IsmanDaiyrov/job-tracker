import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { api, tokenStorage } from '../lib/api'
import type { User } from '../types/user'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  loginWithToken: (token: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    const { data } = await api.get<User>('/auth/me')
    setUser(data)
    return data
  }, [])

  useEffect(() => {
    if (!tokenStorage.get()) {
      setIsLoading(false)
      return
    }
    fetchMe()
      .catch(() => tokenStorage.clear())
      .finally(() => setIsLoading(false))
  }, [fetchMe])

  const loginWithToken = useCallback(
    async (token: string) => {
      tokenStorage.set(token)
      await fetchMe()
    },
    [fetchMe],
  )

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post('/auth/login', { email, password })
      await loginWithToken(data.access_token)
    },
    [loginWithToken],
  )

  const register = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post('/auth/register', { email, password })
      await loginWithToken(data.access_token)
    },
    [loginWithToken],
  )

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
