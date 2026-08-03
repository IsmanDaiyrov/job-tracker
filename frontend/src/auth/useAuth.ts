import { useContext } from 'react'
import { AuthContext } from './AuthContext'

export function useAuth() {
  // Get the context value from AuthContext
  const authContext = useContext(AuthContext)
  if (!authContext) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return authContext
}
