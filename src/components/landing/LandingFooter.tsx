import { Link } from 'react-router-dom'
import { APP_NAME } from '@/config/app'

export const LandingFooter = () => {
  return (
    <footer className="mt-20">
      <div className="container-custom">
        <div className="glass-panel flex flex-col gap-8 rounded-[32px] px-8 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="pill bg-primary/10 text-primary">Stay in sync</p>
            <h3 className="mt-3 text-3xl font-heading font-semibold text-text">{APP_NAME}</h3>
            <p className="mt-2 text-text-soft">Live cohorts, coaching, and certification workflows in one premium workspace.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-text-soft">
            <Link to="/courses" className="rounded-2xl px-4 py-2 hover:bg-primary/10 hover:text-primary">Courses</Link>
            <Link to="/about" className="rounded-2xl px-4 py-2 hover:bg-primary/10 hover:text-primary">About</Link>
            <Link to="/contact" className="rounded-2xl px-4 py-2 hover:bg-primary/10 hover:text-primary">Contact</Link>
          </div>
          <div className="flex gap-3 text-sm text-text-soft">
            <a href="#" className="rounded-full border border-white/60 px-4 py-2 hover:border-primary hover:text-primary">Twitter</a>
            <a href="#" className="rounded-full border border-white/60 px-4 py-2 hover:border-primary hover:text-primary">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default LandingFooter

