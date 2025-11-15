import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

export const PublicHeader = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

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
              <Button onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

