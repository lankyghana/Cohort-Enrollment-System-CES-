import { Outlet } from 'react-router-dom'
import { DashboardHeader } from '@/components/layouts/DashboardHeader'
import { DashboardSidebar } from '@/components/layouts/DashboardSidebar'

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

