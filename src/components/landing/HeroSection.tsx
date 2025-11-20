import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-16">
      <div className="container-custom">
        <div className="gradient-shell px-10 py-12">
          <div className="flex flex-col items-center gap-10 lg:flex-row">
            <div className="flex-1 space-y-5">
              <p className="pill bg-white/20 text-white/90">Cohort Operating System</p>
              <h1 className="text-4xl md:text-5xl font-heading font-semibold text-white">
                Modern cohort learning for ambitious teams
              </h1>
              <p className="text-lg text-white/80">
                Fast, practical programs with live accountability, concierge onboarding, and verified credentials once you complete the capstone pathway.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link to="/register">Get started</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/40 text-white hover:text-primary">
                  <Link to="/courses">Browse cohorts</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-white/80">
                <div>
                  <p className="text-2xl font-semibold text-white">12k+</p>
                  Alumni professionals
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">40+</p>
                  Active cohorts
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">92%</p>
                  Completion rate
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="glass-panel float-anim space-y-4 rounded-[32px] bg-white/10 p-6 text-white">
                <div className="rounded-3xl bg-white/10 p-4">
                  <div className="mb-4 h-32 rounded-2xl bg-gradient-to-r from-white/20 to-transparent" />
                  <div className="space-y-3">
                    <div className="h-3 w-3/4 rounded-full bg-white/30" />
                    <div className="h-3 w-1/2 rounded-full bg-white/20" />
                  </div>
                </div>
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-sm uppercase tracking-[0.35em] text-white/60">Upcoming live session</p>
                  <p className="mt-2 text-xl font-semibold">Product Analytics Canvas</p>
                  <p className="text-sm text-white/80">Today · 7:00 PM WAT</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
