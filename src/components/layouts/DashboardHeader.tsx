import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Bell, Menu, User } from 'lucide-react'
import { useState } from 'react'

interface Props {
  onMenuClick?: () => void
}

export const DashboardHeader = ({ onMenuClick }: Props) => {
  const navigate = useNavigate()
  const { user, appUser, signOut } = useAuthStore()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 px-4 pt-6 sm:px-6 lg:px-10">
      <div className="glass-panel flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {onMenuClick ? (
            <button
              type="button"
              onClick={onMenuClick}
              className="rounded-2xl border border-white/60 bg-white/80 p-2 text-text transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          ) : null}

          <Link to="/dashboard" className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Student Portal</span>
            <span className="text-2xl font-heading font-semibold text-slate-900">My Dashboard</span>
            <span className="text-sm text-text-soft">Central view for your cohort, live sessions, and deliverables.</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative rounded-2xl border border-white/60 bg-white/80 p-2 text-text transition hover:text-primary">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 inline-flex h-2 w-2 rounded-full bg-accent" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 rounded-2xl bg-primary text-white px-3 py-2 text-sm font-medium shadow-lg shadow-primary/30 transition hover:bg-primary-soft"
            >
              {appUser?.avatar_url ? (
                <img
                  src={appUser.avatar_url}
                  alt={appUser.full_name || 'User'}
                  className="h-8 w-8 rounded-full border-2 border-white/40"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <User className="h-5 w-5" />
                </div>
              )}
              <span className="hidden md:block max-w-[160px] truncate">
                {appUser?.full_name || user?.email}
              </span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/70 bg-white/95 p-3 text-sm shadow-2xl">
                <Link
                  to="/dashboard"
                  className="block rounded-xl px-3 py-2 text-text hover:bg-primary/5"
                  onClick={() => setShowDropdown(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/profile"
                  className="block rounded-xl px-3 py-2 text-text hover:bg-primary/5"
                  onClick={() => setShowDropdown(false)}
                >
                  Profile Settings
                </Link>
                <Link
                  to="/dashboard/certificates"
                  className="block rounded-xl px-3 py-2 text-text hover:bg-primary/5"
                  onClick={() => setShowDropdown(false)}
                >
                  Certificates
                </Link>
                <button
                  onClick={handleSignOut}
                  className="mt-2 flex w-full items-center justify-between rounded-xl px-3 py-2 text-red-600 transition hover:bg-red-50"
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


