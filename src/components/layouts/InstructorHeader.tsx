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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <Link to="/instructor" className="flex items-center space-x-2">
            <span className="text-xl font-heading font-bold text-primary">Instructor Dashboard</span>
          </Link>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-text hover:text-primary transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {appUser?.avatar_url ? (
                  <img src={appUser.avatar_url} alt={appUser.full_name || 'Instructor'} className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium text-text">{appUser?.full_name || user?.email}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link to="/instructor" className="block px-4 py-2 text-sm text-text hover:bg-gray-100" onClick={() => setShowDropdown(false)}>
                    Dashboard
                  </Link>
                  <hr className="my-1" />
                  <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
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
