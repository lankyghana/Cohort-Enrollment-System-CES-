import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { LayoutDashboard, BookOpen, Award, Settings, ClipboardList } from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/courses', label: 'My Courses', icon: BookOpen },
  { path: '/dashboard/assignments', label: 'Assignments', icon: ClipboardList },
  { path: '/dashboard/certificates', label: 'Certificates', icon: Award },
  { path: '/dashboard/profile', label: 'Profile', icon: Settings },
]

export const DashboardSidebar = () => {
  const location = useLocation()

  return (
    <aside className="w-full shrink-0 rounded-[32px] border border-white/70 bg-white/90 p-4 shadow-xl shadow-slate-200/60 backdrop-blur lg:w-72">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all',
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

