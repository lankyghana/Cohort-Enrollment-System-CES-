import { Outlet } from 'react-router-dom'
import { InstructorHeader } from '@/components/layouts/InstructorHeader'
import { InstructorSidebar } from '@/components/layouts/InstructorSidebar'

export const InstructorLayout = () => {
  return (
    <div className="min-h-screen bg-[color:var(--bg-muted,#F9FAFB)] font-sans text-[#111827]">
      <InstructorHeader />
      <div className="flex gap-6 p-6">
        <div className="shadow-lg shadow-gray-200 rounded-2xl bg-white border border-gray-100 overflow-hidden">
          <InstructorSidebar />
        </div>

        <main className="flex-1">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default InstructorLayout

