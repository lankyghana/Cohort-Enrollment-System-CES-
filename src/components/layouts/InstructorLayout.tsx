import { Outlet } from 'react-router-dom'
import { InstructorHeader } from '@/components/layouts/InstructorHeader'
import { InstructorSidebar } from '@/components/layouts/InstructorSidebar'

export const InstructorLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <InstructorHeader />
      <div className="flex">
        <InstructorSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default InstructorLayout
