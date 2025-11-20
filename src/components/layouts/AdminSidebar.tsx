import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  Calendar,
  Award,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/courses', label: 'Courses', icon: BookOpen },
  { path: '/admin/students', label: 'Students', icon: Users },
  { path: '/admin/payments', label: 'Payments', icon: CreditCard },
  { path: '/admin/schedule', label: 'Schedule', icon: Calendar },
  { path: '/admin/certificates', label: 'Certificates', icon: Award },
]

export const AdminSidebar = () => {
  const location = useLocation()

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="sticky top-32 space-y-6">
        <div className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-xl shadow-slate-200/60 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Command</p>
          <p className="mt-1 text-lg font-heading font-semibold text-slate-900">Operations suite</p>
          <p className="mt-2 text-sm text-text-light">Quick links to keep cohorts, payments, and certificates in sync.</p>
        </div>

        <nav className="rounded-3xl border border-white/60 bg-white/90 p-3 shadow-xl shadow-slate-200/60 backdrop-blur">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={clsx(
                      'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : 'text-text/70 hover:bg-primary/10 hover:text-primary'
                    )}
                  >
                    <Icon className={clsx('h-5 w-5', isActive ? 'text-white' : 'text-primary')} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-5 text-white shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white/20 p-2">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Need a status report?</p>
              <p className="text-xs text-white/80">Export payments, enrollments, or certificate logs in one click.</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="mt-4 w-full bg-white/20 text-white hover:bg-white/30">
            Generate report
          </Button>
        </div>
      </div>
    </aside>
  )
}

