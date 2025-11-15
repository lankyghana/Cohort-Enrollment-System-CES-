import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  CreditCard,
  Calendar,
  Award,
} from 'lucide-react'

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
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-text hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

