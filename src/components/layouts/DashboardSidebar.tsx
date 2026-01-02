import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { LayoutDashboard, BookOpen, Award, Settings, ClipboardList } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useEffect, useMemo, useState } from 'react'
import apiClient from '@/services/apiClient'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/courses', label: 'My Courses', icon: BookOpen },
  { path: '/dashboard/assignments', label: 'Assignments', icon: ClipboardList },
  { path: '/dashboard/certificates', label: 'Certificates', icon: Award },
  { path: '/dashboard/profile', label: 'Profile', icon: Settings },
]

interface Props {
  variant?: 'sidebar' | 'drawer'
  onNavigate?: () => void
}

export const DashboardSidebar = ({ variant = 'sidebar', onNavigate }: Props) => {
  const location = useLocation()

  const { user, appUser } = useAuthStore()
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

  return (
    <aside
      className={clsx(
        'w-full shrink-0 rounded-[32px] border border-white/70 bg-white/90 p-4 shadow-xl shadow-slate-200/60 backdrop-blur',
        variant === 'drawer' ? 'max-h-[calc(100vh-2rem)] overflow-auto' : 'lg:w-72'
      )}
    >
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

      <nav className="mt-4 space-y-2">
        {navItems.map((item) => {
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
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-text-soft hover:bg-primary/10 hover:text-primary'
              )}
            >
              <Icon className={clsx('h-5 w-5', isActive ? 'text-white' : 'text-primary')} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}


