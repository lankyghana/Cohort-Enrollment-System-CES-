import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Calendar,
  Award,
  ClipboardList,
} from 'lucide-react'

const navItems = [
  { path: '/instructor', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/instructor/courses', label: 'Courses', icon: BookOpen },
  { path: '/instructor/students', label: 'Students', icon: Users },
  { path: '/instructor/assignments', label: 'Assignments', icon: ClipboardList },
  { path: '/instructor/schedule', label: 'Schedule', icon: Calendar },
  { path: '/instructor/certificates', label: 'Certificates', icon: Award },
]

export const InstructorSidebar = () => {
  const location = useLocation()

  return (
    <aside className="w-72 bg-transparent">
      <nav className="p-6 space-y-3 w-64">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 transform',
                isActive
                  ? 'bg-[color:var(--primary,#2563EB)] text-white shadow-md'
                  : 'text-[#374151] hover:bg-white hover:shadow hover:scale-[1.01]'
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

export default InstructorSidebar

