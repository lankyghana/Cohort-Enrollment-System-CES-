import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'

export const useAuth = () => {
  const store = useAuthStore()
  const { user, appUser, loading, initialized, initialize } = store

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized, initialize])

  const role = appUser?.role || (typeof store.getUserRole === 'function' ? store.getUserRole() : null)

  return {
    user,
    appUser,
    loading,
    initialized,
    initialize,
    role,
    isAuthenticated: !!user,
    isAdmin: role === 'admin',
    isInstructor: role === 'instructor',
    isStudent: !role || role === 'student',
  }
}


