import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export const PublicHeader = () => {
  const navigate = useNavigate()
  const { user, isAdmin, isInstructor, role, appUser } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-slate-50/95 backdrop-blur lg:border-b-0 lg:bg-transparent lg:px-10 lg:pt-5">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between lg:h-auto lg:rounded-3xl lg:border lg:border-slate-200 lg:bg-slate-50/80 lg:px-6 lg:py-4 lg:backdrop-blur-sm">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-sm font-semibold uppercase tracking-[0.35em] text-primary/80 lg:text-xs">
              SKILLTECH
            </span>
            <span className="hidden text-lg font-heading font-semibold text-slate-900 lg:block">Learning Collective</span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">
            <Link
              to="/"
              className="rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-900/5 hover:text-slate-900"
            >
              Home
            </Link>
            <a
              href="/#guidelines"
              className="rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-900/5 hover:text-slate-900"
            >
              Guidelines
            </a>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-900/5 hover:text-slate-900"
            >
              Join a cohort
            </button>
            <a
              href="mailto:support@joincohorts.org"
              className="rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-900/5 hover:text-slate-900"
            >
              Contact Us
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="px-4 rounded-full lg:hidden"
              aria-expanded={mobileMenuOpen}
              aria-controls="public-mobile-menu"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              Menu
            </Button>

            {user ? (
              <>
                <Button size="sm" onClick={() => navigate(isAdmin ? '/admin' : isInstructor ? '/instructor' : '/dashboard')}>
                  Dashboard
                </Button>
                {isAdmin && (
                  <Button size="sm" variant="outline" className="hidden lg:inline-flex" onClick={() => navigate('/admin')}>
                    Admin Control
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="hidden px-2 text-slate-700 hover:text-slate-900 lg:inline-flex"
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </Button>
              </>
            )}

            {import.meta.env.DEV && (
              <div className="ml-2 hidden rounded-2xl bg-white/60 px-3 py-2 text-xs text-text-soft lg:block">
                <span className="font-medium">{user?.email ?? appUser?.email ?? '—'}</span>
                <span className="ml-2">role: {role ?? '—'}</span>
              </div>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div id="public-mobile-menu" className="lg:hidden">
            <nav className="mt-3 rounded-3xl border border-slate-200 bg-slate-50/95 p-2 backdrop-blur">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-900/5 hover:text-slate-900"
              >
                Home
              </Link>
              <a
                href="/#guidelines"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-900/5 hover:text-slate-900"
              >
                Guidelines
              </a>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  navigate('/register')
                }}
                className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-900/5 hover:text-slate-900"
              >
                Join a cohort
              </button>
              <a
                href="mailto:support@joincohorts.org"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-900/5 hover:text-slate-900"
              >
                Contact Us
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}


