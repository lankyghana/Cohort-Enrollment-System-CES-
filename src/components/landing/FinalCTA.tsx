import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export const FinalCTA = () => {
  return (
    <section className="py-20">
      <div className="container-custom">
        <div className="gradient-shell text-center px-10 py-14">
          <p className="pill mx-auto bg-white/20 text-white/80">Join the cohort</p>
          <h3 className="mt-4 text-4xl font-heading font-semibold text-white">Ready to join a live cohort?</h3>
          <p className="mt-4 text-lg text-white/85">
            Start learning with peers, finish projects, and unlock verifiable credentials tracked in the admin dashboard.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/register">Join now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 text-white">
              <Link to="/courses">Browse catalog</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FinalCTA
