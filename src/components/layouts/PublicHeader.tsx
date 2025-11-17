import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export const PublicHeader = () => {
  const navigate = useNavigate()
  const { user, isAdmin, isInstructor, role, appUser } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-heading font-bold text-primary">
              Cohort Enrollment
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/courses"
              className="text-text hover:text-primary transition-colors font-medium"
            >
              Courses
            </Link>
            <Link
              to="/about"
              className="text-text hover:text-primary transition-colors font-medium"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button onClick={() => navigate(isAdmin ? '/admin' : isInstructor ? '/instructor' : '/dashboard')}>
                  Dashboard
                </Button>
                {isAdmin && (
                  <Button variant="ghost" onClick={() => navigate('/admin')}>
                    Admin
                  </Button>
                )}
              </>
            ) : (
              <>
                {/* Primary, obvious actions remain: single Login + Sign Up */}
                <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
                <Button onClick={() => navigate('/register')}>Sign Up</Button>

                {/* Manual routes deliberately omitted from the header UI */}
              </>
            )}
            {/* Dev-only diagnostic: shows what the app sees for email and role */}
            {import.meta.env.DEV && (
              <div className="ml-4 text-xs text-gray-600">
                <div className="whitespace-nowrap">
                  <span className="font-medium">{user?.email ?? appUser?.email ?? '—'}</span>
                  <span className="ml-2 text-gray-500">role: {role ?? '—'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

