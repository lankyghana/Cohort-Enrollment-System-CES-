import { Outlet } from 'react-router-dom'
import { PublicHeader } from '@/components/layouts/PublicHeader'
import { Footer } from '@/components/layouts/Footer'

export const PublicLayout = () => {
  return (
    <div className="app-shell flex min-h-screen flex-col bg-hero-soft">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white/60 via-white/40 to-transparent" />
      <PublicHeader />
      <main className="relative z-10 flex-1 pb-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}


