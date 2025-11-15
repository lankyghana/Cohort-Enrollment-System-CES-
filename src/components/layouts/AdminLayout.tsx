import { Outlet } from 'react-router-dom'
import { AdminHeader } from '@/components/layouts/AdminHeader'
import { AdminSidebar } from '@/components/layouts/AdminSidebar'

export const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

