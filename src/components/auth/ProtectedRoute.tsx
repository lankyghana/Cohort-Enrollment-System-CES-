import { ReactNode, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loading } from '@/components/ui/Loading'

interface ProtectedRouteProps {
  children: ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, initialized, initialize, isStudent, isAdmin, isInstructor } = useAuth()

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized, initialize])

  if (loading || !initialized) {
    return <Loading fullScreen text="Loading..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Ensure only student-role users access student routes
  if (!isStudent) {
    // Redirect authenticated admin/instructor users to their dashboard
    if (isAdmin) return <Navigate to="/admin" replace />
    if (isInstructor) return <Navigate to="/instructor" replace />
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

