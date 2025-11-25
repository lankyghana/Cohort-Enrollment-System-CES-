import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Bell, User } from 'lucide-react'
import { useState } from 'react'

export const InstructorHeader = () => {
  const navigate = useNavigate()
  const { user, appUser, signOut } = useAuthStore()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-sm border-b border-gray-100">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          <Link to="/instructor" className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-[color:var(--primary,#2563EB)] flex items-center justify-center shadow-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L19 8.5V21H5V8.5L12 2Z" fill="white"/></svg>
            </div>
            <div>
              <span className="block text-lg font-semibold text-[#111827]">Instructor</span>
              <span className="block text-sm text-gray-500">Dashboard</span>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-[color:var(--primary,#2563EB)] transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-[color:var(--accent,#0E9F6E)] rounded-full shadow-sm"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 p-2 rounded-2xl hover:bg-gray-50 transition-all duration-300"
              >
                {appUser?.avatar_url ? (
                  <img src={appUser.avatar_url} alt={appUser.full_name || 'Instructor'} className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-[color:var(--primary,#2563EB)] flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium text-[#111827]">{appUser?.full_name || user?.email}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                  <Link to="/instructor" className="block px-4 py-2 text-sm text-[#111827] hover:bg-gray-50" onClick={() => setShowDropdown(false)}>
                    Dashboard
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default InstructorHeader

