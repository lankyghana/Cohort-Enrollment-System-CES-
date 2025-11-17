import { ReactNode, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loading } from '@/components/ui/Loading'

interface Props { children: ReactNode }

export const ProtectedInstructorRoute = ({ children }: Props) => {
  const { user, loading, initialized, initialize, isAdmin, isInstructor } = useAuth()

  useEffect(() => {
    if (!initialized) initialize()
  }, [initialized, initialize])

  if (loading || !initialized) return <Loading fullScreen text="Loading..." />
  if (!user) return <Navigate to="/instructor-login" replace />
  if (!(isInstructor || isAdmin)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default ProtectedInstructorRoute
