import { Outlet } from 'react-router-dom'
import { DashboardHeader } from '@/components/layouts/DashboardHeader'
import { DashboardSidebar } from '@/components/layouts/DashboardSidebar'

export const DashboardLayout = () => {
  return (
    <div className="app-shell min-h-screen bg-shell-light">
      <DashboardHeader />
      <div className="container-custom flex flex-col gap-6 pb-16 pt-8 lg:flex-row">
        <DashboardSidebar />
        <main className="flex-1 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}


