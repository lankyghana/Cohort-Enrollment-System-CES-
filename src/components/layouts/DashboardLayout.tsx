import { Outlet } from 'react-router-dom'
import { DashboardHeader } from '@/components/layouts/DashboardHeader'
import { DashboardSidebar } from '@/components/layouts/DashboardSidebar'
import { useCallback, useState } from 'react'

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const openSidebar = useCallback(() => setSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  return (
    <div className="app-shell min-h-screen bg-shell-light">
      <DashboardHeader onMenuClick={openSidebar} />
      <div className="container-custom flex flex-col gap-6 pb-16 pt-8 lg:flex-row">
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>
        <main className="flex-1 space-y-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile drawer */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" aria-hidden={!sidebarOpen}>
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-text/40 backdrop-blur-sm"
            onClick={closeSidebar}
          />
          <div className="absolute left-4 top-4 w-[min(22rem,85vw)]">
            <DashboardSidebar variant="drawer" onNavigate={closeSidebar} />
          </div>
        </div>
      ) : null}
    </div>
  )
}


