import { ReactNode, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loading } from '@/components/ui/Loading'

interface InstructorRouteProps {
  children: ReactNode
}

export const InstructorRoute = ({ children }: InstructorRouteProps) => {
  const { user, loading, isInstructor, initialized, initialize } = useAuth()

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized, initialize])

  if (loading || !initialized) {
    return <Loading fullScreen text="Loading..." />
  }

  if (!user) {
    return <Navigate to="/instructor-login" replace />
  }

  if (!isInstructor) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default InstructorRoute

