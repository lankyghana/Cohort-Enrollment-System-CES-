import { Outlet } from 'react-router-dom'
import { AdminHeader } from '@/components/layouts/AdminHeader'
import { AdminSidebar } from '@/components/layouts/AdminSidebar'

export const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef2ff] via-[#fdf2f8] to-[#f8fafc] text-text">
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-primary/15 blur-[140px]" />
          <div className="absolute bottom-0 -left-24 h-96 w-96 rounded-full bg-accent/20 blur-[160px]" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col">
          <AdminHeader />
          <div className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-6 sm:px-6 lg:flex-row lg:px-10">
            <AdminSidebar />
            <main className="flex-1">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}


