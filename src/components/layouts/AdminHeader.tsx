import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

const navItems = [
  { path: '/admin', label: 'Dashboard' },
  { path: '/admin/courses', label: 'Courses' },
  { path: '/admin/students', label: 'Students' },
  { path: '/admin/users', label: 'User Management' },
  { path: '/admin/payments', label: 'Payments' },
  { path: '/admin/payment-gateway', label: 'Payment Gateway' },
  { path: '/admin/schedule', label: 'Schedule' },
  { path: '/admin/certificates', label: 'Certificates' },
] as const

export const AdminHeader = () => {
  const navigate = useNavigate()
  const { signOut } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-slate-50/95 backdrop-blur lg:border-b-0 lg:bg-transparent lg:px-10 lg:pt-5">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between lg:h-auto lg:rounded-3xl lg:border lg:border-slate-200 lg:bg-slate-50/80 lg:px-6 lg:py-4 lg:backdrop-blur-sm">
          <Link to="/admin" className="flex items-center gap-3">
            <span className="text-sm font-semibold uppercase tracking-[0.35em] text-primary/80 lg:text-xs">SKILLTECH</span>
          </Link>

          <div className="relative flex items-center gap-2">
            <Button
              size="sm"
              className="px-4 rounded-full lg:hidden"
              aria-expanded={mobileMenuOpen}
              aria-controls="admin-mobile-menu"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              Menu
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="hidden lg:inline-flex rounded-full"
              onClick={handleSignOut}
            >
              Logout
            </Button>

            {mobileMenuOpen && (
              <div
                id="admin-mobile-menu"
                className="absolute right-0 top-full mt-2 w-48 rounded-3xl border border-slate-200 bg-slate-50/95 p-2 text-sm shadow-xl backdrop-blur"
              >
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="block rounded-2xl px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-900/5 hover:text-slate-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-1 block w-full rounded-2xl px-4 py-3 text-left font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}


