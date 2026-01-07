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
      <div className="container-custom flex flex-col gap-6 pb-28 pt-3 lg:flex-row lg:pb-16 lg:pt-8">
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>
        <main className="flex-1 space-y-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile menu (side drawer) */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" aria-hidden={!sidebarOpen}>
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-text/40 backdrop-blur-sm"
            onClick={closeSidebar}
          />
          <div className="absolute left-0 top-0 h-full w-[22rem] max-w-[90vw] overflow-auto rounded-r-[32px] border-r border-white/70 bg-white/95 p-4 shadow-shell">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Menu</p>
              <button
                type="button"
                onClick={closeSidebar}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/80 text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Close menu"
              >
                <span aria-hidden="true" className="text-xl leading-none">×</span>
              </button>
            </div>
            <div className="mt-3">
              <DashboardSidebar variant="drawer" onNavigate={closeSidebar} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}


