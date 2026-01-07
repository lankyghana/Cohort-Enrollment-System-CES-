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
  const [showNotifications, setShowNotifications] = useState(false)

  const toggleNotifications = () => {
    setShowDropdown(false)
    setShowNotifications((v) => !v)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 bg-shell-light/80 backdrop-blur">
      <div className="px-3 py-2 sm:px-6 lg:px-10 lg:pt-6">
        <div className="glass-panel rounded-none px-3 py-2 sm:px-4 lg:rounded-[28px] lg:px-6 lg:py-4">
          {/* Mobile header */}
          <div className="grid grid-cols-3 items-center gap-2 lg:hidden">
            <div className="flex items-center">
              {onMenuClick ? (
                <button
                  type="button"
                  onClick={onMenuClick}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/80 text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </button>
              ) : null}
            </div>

            <Link to="/dashboard" className="text-center text-sm font-semibold text-text">
              My Dashboard
            </Link>

            <div className="flex items-center justify-end gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleNotifications}
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/80 text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label="Notifications"
                  aria-expanded={showNotifications}
                  aria-controls="student-notifications-menu"
                >
                  <Bell className="h-5 w-5" />
                  <span
                    className="absolute right-2 top-2 inline-flex h-2 w-2 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                </button>

                {showNotifications && (
                  <div
                    id="student-notifications-menu"
                    role="dialog"
                    aria-label="Notifications"
                    className="absolute right-0 mt-2 w-72 rounded-2xl border border-white/70 bg-white/95 p-3 text-sm shadow-2xl"
                  >
                    <div className="flex items-center justify-between">
                      <p className="px-1 text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">
                        Notifications
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowNotifications(false)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-white/80 text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        aria-label="Close notifications"
                      >
                        <span aria-hidden="true" className="text-lg leading-none">
                          ×
                        </span>
                      </button>
                    </div>
                    <div className="mt-3 rounded-xl bg-primary/5 px-3 py-3 text-text">
                      <p className="text-sm font-semibold">No notifications yet</p>
                      <p className="mt-1 text-xs text-text-soft">
                        Updates about your cohort will appear here.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false)
                    setShowDropdown((v) => !v)
                  }}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label="Account menu"
                  aria-expanded={showDropdown}
                >
                  {appUser?.avatar_url ? (
                    <img
                      src={appUser.avatar_url}
                      alt={appUser.full_name || 'User'}
                      className="h-9 w-9 rounded-full border-2 border-white/40"
                    />
                  ) : (
                    <User className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/70 bg-white/95 p-3 text-sm shadow-2xl">
                    <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Account</p>
                    <Link
                      to="/dashboard/profile"
                      className="block rounded-xl px-3 py-2 text-text hover:bg-primary/5"
                      onClick={() => setShowDropdown(false)}
                    >
                      Profile
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
                      className="mt-2 flex min-h-[44px] w-full items-center justify-between rounded-xl px-3 py-2 text-red-600 transition hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop header (existing) */}
          <div className="hidden items-center justify-between lg:flex">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Student Portal</span>
                <span className="text-2xl font-heading font-semibold text-slate-900">My Dashboard</span>
                <span className="text-sm text-text-soft">Central view for your cohort, live sessions, and deliverables.</span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleNotifications}
                  className="relative rounded-2xl border border-white/60 bg-white/80 p-2 text-text transition-colors hover:text-primary"
                  aria-label="Notifications"
                  aria-expanded={showNotifications}
                  aria-controls="student-notifications-menu-desktop"
                >
                  <Bell className="h-5 w-5" />
                  <span
                    className="absolute right-2 top-2 inline-flex h-2 w-2 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                </button>

                {showNotifications && (
                  <div
                    id="student-notifications-menu-desktop"
                    role="dialog"
                    aria-label="Notifications"
                    className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/70 bg-white/95 p-3 text-sm shadow-2xl"
                  >
                    <div className="flex items-center justify-between">
                      <p className="px-1 text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">
                        Notifications
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowNotifications(false)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-white/80 text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        aria-label="Close notifications"
                      >
                        <span aria-hidden="true" className="text-lg leading-none">
                          ×
                        </span>
                      </button>
                    </div>
                    <div className="mt-3 rounded-xl bg-primary/5 px-3 py-3 text-text">
                      <p className="text-sm font-semibold">No notifications yet</p>
                      <p className="mt-1 text-xs text-text-soft">
                        Updates about your cohort will appear here.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(false)
                    setShowDropdown(!showDropdown)
                  }}
                  className="flex items-center gap-2 rounded-2xl bg-primary px-3 py-2 text-sm font-medium text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-soft"
                  aria-expanded={showDropdown}
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
                  <span className="max-w-[160px] truncate">
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
        </div>
      </div>
    </header>
  )
}


