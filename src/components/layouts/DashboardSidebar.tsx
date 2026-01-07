import { Link, useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { LayoutDashboard, BookOpen, Award, Settings, ClipboardList } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useEffect, useMemo, useState } from 'react'
import apiClient from '@/services/apiClient'

const navGroups = [
  {
    label: 'Learning',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/dashboard/courses', label: 'My Courses', icon: BookOpen },
    ],
  },
  {
    label: 'Work',
    items: [
      { path: '/dashboard/assignments', label: 'Assignments', icon: ClipboardList },
      { path: '/dashboard/certificates', label: 'Certificates', icon: Award },
    ],
  },
  {
    label: 'Account',
    items: [{ path: '/dashboard/profile', label: 'Profile', icon: Settings }],
  },
] as const

interface Props {
  variant?: 'sidebar' | 'drawer'
  onNavigate?: () => void
}

export const DashboardSidebar = ({ variant = 'sidebar', onNavigate }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { user, appUser, signOut } = useAuthStore()
  const [progress, setProgress] = useState(0)
  const [courseCount, setCourseCount] = useState(0)

  const displayName = useMemo(() => {
    return appUser?.full_name || user?.email || 'Student'
  }, [appUser?.full_name, user?.email])

  useEffect(() => {
    if (!user) return

    let cancelled = false
    apiClient
      .get('/api/student/dashboard')
      .then(({ data }) => {
        if (cancelled) return
        const enrollments = (data?.enrollments || []) as Array<{ progress_percentage?: number }>
        const count = enrollments.length
        const avg = count
          ? Math.round(
              enrollments.reduce((sum, e) => sum + (Number(e.progress_percentage) || 0), 0) / count
            )
          : 0

        setCourseCount(count)
        setProgress(avg)
      })
      .catch(() => {
        if (cancelled) return
        setCourseCount(0)
        setProgress(0)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  const handleLogout = async () => {
    await signOut()
    onNavigate?.()
    navigate('/login')
  }

  return (
    <aside
      className={clsx(
        variant === 'drawer'
          ? 'w-full'
          : 'w-full shrink-0 rounded-[32px] border border-white/70 bg-white/90 p-4 shadow-card backdrop-blur lg:w-72 lg:sticky lg:top-28'
      )}
    >
      {variant === 'drawer' ? null : (
        <div className="rounded-[28px] border border-white/70 bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Signed in as</p>
          <p className="mt-2 truncate text-sm font-semibold text-text">{displayName}</p>
          <p className="mt-1 text-sm text-text-soft">
            {courseCount > 0 ? `Enrolled in ${courseCount} course${courseCount === 1 ? '' : 's'}` : 'No cohort yet'}
          </p>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-text-soft">
              <span>Progress</span>
              <span className="font-semibold text-text">{progress}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-primary/10">
              <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
            {courseCount === 0 ? (
              <p className="mt-2 text-xs text-text-muted">Progress starts after enrolling.</p>
            ) : null}
          </div>
        </div>
      )}

      <nav className="mt-5 space-y-5" aria-label="Student navigation">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">{group.label}</p>
            <div className="mt-2 space-y-2">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/dashboard' && location.pathname.startsWith(`${item.path}/`))

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => onNavigate?.()}
                    className={clsx(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-soft hover:bg-primary/5 hover:text-primary'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={clsx('h-5 w-5', isActive ? 'text-primary' : 'text-primary/80')} />
                    <span className="flex-1">{item.label}</span>
                    {isActive ? <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" /> : null}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {variant === 'drawer' ? (
        <div className="mt-6 border-t border-slate-200/70 pt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-[44px] w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:bg-red-50"
          >
            Logout
            <span className="text-red-400" aria-hidden="true">→</span>
          </button>
        </div>
      ) : null}
    </aside>
  )
}


