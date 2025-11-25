import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { APP_NAME } from '@/config/app'
import { env } from '@/config/env'

export const PublicHeader = () => {
  const navigate = useNavigate()
  const { user, isAdmin, isInstructor, role, appUser } = useAuth()

  return (
    <header className="sticky top-0 z-40 px-4 pt-6 sm:px-6 lg:px-10">
      <div className="glass-panel flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">{APP_NAME}</span>
          <span className="text-2xl font-heading font-semibold text-slate-900">Learning Collective</span>
          <span className="text-sm text-text-soft">Cohort journeys with concierge support</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-3 md:flex">
          {[
            { label: 'Courses', path: '/courses' },
            { label: 'About', path: '/about' },
            { label: 'Testimonials', path: '/#testimonials' },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="rounded-2xl px-4 py-2 text-sm font-semibold text-text-soft transition hover:bg-primary/10 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button size="sm" onClick={() => navigate(isAdmin ? '/admin' : isInstructor ? '/instructor' : '/dashboard')}>
                Go to dashboard
              </Button>
              {isAdmin && (
                <Button size="sm" variant="outline" onClick={() => navigate('/admin')}>
                  Admin Control
                </Button>
              )}
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Join cohort
              </Button>
            </>
          )}

          {env.DEV && (
            <div className="ml-3 rounded-2xl bg-white/60 px-3 py-2 text-xs text-text-soft">
              <span className="font-medium">{user?.email ?? appUser?.email ?? '—'}</span>
              <span className="ml-2">role: {role ?? '—'}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}


