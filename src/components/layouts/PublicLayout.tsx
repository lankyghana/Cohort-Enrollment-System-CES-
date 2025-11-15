import { Outlet } from 'react-router-dom'
import { PublicHeader } from '@/components/layouts/PublicHeader'
import { Footer } from '@/components/layouts/Footer'

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

