import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Bell, ExternalLink, Search, Sparkles, User } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { APP_NAME } from '@/config/app'

export const AdminHeader = () => {
  const navigate = useNavigate()
  const { user, appUser, signOut } = useAuthStore()
  const [showDropdown, setShowDropdown] = useState(false)

  const initials = useMemo(() => {
    if (appUser?.full_name) {
      return appUser.full_name
        .split(' ')
        .map((chunk) => chunk[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    }
    return user?.email?.[0]?.toUpperCase() ?? 'A'
  }, [appUser?.full_name, user?.email])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 px-4 pt-6 sm:px-6 lg:px-10">
      <div className="rounded-3xl border border-white/60 bg-white/80 px-6 py-4 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/admin" className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{APP_NAME} Admin</span>
            <span className="text-2xl font-heading font-semibold text-slate-900">Control Center</span>
            <span className="text-sm text-text-light">Monitor cohorts, revenue, and live sessions</span>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-3">
            <div className="relative hidden w-full max-w-sm flex-1 md:flex">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" size={18} />
              <input
                type="search"
                placeholder="Search courses, students or payments"
                className="w-full rounded-2xl border border-transparent bg-white/90 py-2 pl-11 pr-4 text-sm text-text shadow-inner shadow-slate-200/40 focus:border-primary focus:outline-none"
              />
            </div>

            <Button variant="ghost" size="sm" className="hidden lg:inline-flex gap-2 text-primary">
              <ExternalLink size={16} />
              View site
            </Button>
            <Button asChild size="sm" className="gap-2">
              <Link to="/admin/courses/new">
                <Sparkles size={16} />
                Create course
              </Link>
            </Button>

            <button className="relative rounded-2xl border border-transparent bg-white/80 p-2 text-text transition hover:border-primary/40 hover:text-primary">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 inline-flex h-2 w-2 rounded-full bg-accent" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 rounded-2xl bg-primary text-white px-3 py-2 text-sm font-medium shadow-lg shadow-primary/30 transition hover:bg-primary-dark"
              >
                {appUser?.avatar_url ? (
                  <img
                    src={appUser.avatar_url}
                    alt={appUser.full_name || 'Admin'}
                    className="h-8 w-8 rounded-full border-2 border-white/40"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
                    {initials}
                  </div>
                )}
                <span className="hidden md:block max-w-[160px] truncate">
                  {appUser?.full_name || user?.email}
                </span>
                <User className="h-4 w-4 opacity-70" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/70 bg-white/90 p-2 text-sm shadow-2xl backdrop-blur">
                  <Link
                    to="/admin"
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-text hover:bg-primary/10"
                    onClick={() => setShowDropdown(false)}
                  >
                    Dashboard overview
                    <User size={14} className="text-primary" />
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-red-600 transition hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

