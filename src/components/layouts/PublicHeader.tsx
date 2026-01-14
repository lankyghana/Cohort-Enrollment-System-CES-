import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export const PublicHeader = () => {
  const navigate = useNavigate()
  const { user, isAdmin, isInstructor } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null)
  const mobileCloseButtonRef = useRef<HTMLButtonElement | null>(null)
  const mobilePanelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!mobileMenuOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      mobileMenuButtonRef.current?.focus()
      setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileMenuOpen])

  useEffect(() => {
    if (!mobileMenuOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const root = mobilePanelRef.current
      if (!root) return

      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1)

      if (!focusables.length) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (e.shiftKey) {
        if (!active || active === first) {
          e.preventDefault()
          last.focus()
        }
        return
      }

      if (active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileMenuOpen])

  useEffect(() => {
    if (!mobileMenuOpen) return
    // Focus the close button when the panel opens.
    window.requestAnimationFrame(() => mobileCloseButtonRef.current?.focus())
  }, [mobileMenuOpen])

  const closeMobileMenu = () => {
    mobileMenuButtonRef.current?.focus()
    setMobileMenuOpen(false)
  }

  const headerZ = mobileMenuOpen ? 'z-[9999]' : 'z-50'

  // Fixed header, always visible
  return (
    <header
      className={`fixed top-0 left-0 w-full ${headerZ} border-b border-slate-200 bg-slate-50/95 backdrop-blur lg:border-b-0 lg:bg-transparent lg:px-10 lg:pt-5 xl:border-b xl:bg-white xl:backdrop-blur-0 xl:px-0 xl:pt-0`}
      style={{height: '64px', minHeight: '64px'}} // 16 * 4 = 64px, matches h-16
    >
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between lg:h-auto lg:rounded-3xl lg:border lg:border-slate-200 lg:bg-slate-50/80 lg:px-6 lg:py-4 lg:backdrop-blur-sm xl:h-16 xl:rounded-none xl:border-0 xl:bg-transparent xl:px-0 xl:py-0 xl:backdrop-blur-0">
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
            <Link
              to="/courses"
              className="rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-900/5 hover:text-slate-900"
            >
              Programs
            </Link>
            <a
              href="mailto:support@skilltechcohort.com"
              className="rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-900/5 hover:text-slate-900"
            >
              Contact Us
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              ref={mobileMenuButtonRef}
              size="sm"
              className="rounded-full px-4 lg:hidden"
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
                <Button
                  size="sm"
                  className="hidden rounded-full px-5 lg:inline-flex"
                  onClick={() => navigate('/register')}
                >
                  Join a cohort
                </Button>
              </>
            )}
          </div>
        </div>

        <div
          id="public-mobile-menu"
          className={`fixed left-0 top-0 h-[100vh] w-[100vw] lg:hidden ${mobileMenuOpen ? 'z-[9999]' : 'z-[9999] pointer-events-none'}`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div
            className={`absolute inset-0 bg-slate-950/30 transition-opacity ${
              mobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeMobileMenu}
          />

          <div
            ref={mobilePanelRef}
            className={`absolute inset-0 w-full bg-white transition-transform ${
              mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            } motion-reduce:transition-none motion-reduce:transform-none`}
          >
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">SKILLTECH</span>
              <Button
                ref={mobileCloseButtonRef}
                size="sm"
                variant="ghost"
                className="h-11 w-11 rounded-full p-0 text-slate-900"
                aria-label="Close menu"
                onClick={closeMobileMenu}
              >
                <span aria-hidden="true" className="text-xl leading-none">×</span>
              </Button>
            </div>

            <nav className="max-h-[calc(100vh-4rem)] overflow-y-auto px-4 py-4">
              <div className="space-y-2">
                <Link
                  to="/"
                  onClick={closeMobileMenu}
                  className="flex min-h-[44px] items-center rounded-2xl px-4 text-sm font-semibold text-slate-900 hover:bg-slate-900/5"
                >
                  Home
                </Link>
                <Link
                  to="/courses"
                  onClick={closeMobileMenu}
                  className="flex min-h-[44px] items-center rounded-2xl px-4 text-sm font-semibold text-slate-900 hover:bg-slate-900/5"
                >
                  Browse Programs
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu()
                    navigate('/register')
                  }}
                  className="flex min-h-[44px] w-full items-center rounded-2xl bg-primary px-4 text-left text-sm font-semibold text-white"
                >
                  Join a Cohort
                </button>
                <a
                  href="mailto:support@skilltechcohort.com"
                  onClick={closeMobileMenu}
                  className="flex min-h-[44px] items-center rounded-2xl px-4 text-sm font-semibold text-slate-900 hover:bg-slate-900/5"
                >
                  Contact
                </a>

                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu()
                      navigate(isAdmin ? '/admin' : isInstructor ? '/instructor' : '/dashboard')
                    }}
                    className="flex min-h-[44px] w-full items-center rounded-2xl px-4 text-left text-sm font-semibold text-slate-900 hover:bg-slate-900/5"
                  >
                    Dashboard
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu()
                      navigate('/login')
                    }}
                    className="flex min-h-[44px] w-full items-center rounded-2xl px-4 text-left text-sm font-semibold text-slate-900 hover:bg-slate-900/5"
                  >
                    Sign in
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}


