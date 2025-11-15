import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'

export const useAuth = () => {
  const { user, appUser, loading, initialized, initialize } = useAuthStore()

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized, initialize])

  return {
    user,
    appUser,
    loading,
    isAuthenticated: !!user,
    isAdmin: appUser?.role === 'admin',
    isInstructor: appUser?.role === 'instructor',
    isStudent: appUser?.role === 'student' || !appUser?.role,
  }
}

