const Step = ({ num, title, desc }: { num: number; title: string; desc: string }) => (
  <div className="surface-card hover-lift h-full">
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
        {num}
      </div>
      <div>
        <p className="text-lg font-semibold text-text">{title}</p>
        <p className="mt-2 text-sm text-text-soft">{desc}</p>
      </div>
    </div>
  </div>
)

export const HowItWorks = () => {
  return (
    <section className="py-16">
      <div className="container-custom space-y-8">
        <div className="text-center">
          <p className="pill bg-primary/10 text-primary">How it works</p>
          <h2 className="section-heading mt-4">Same flow as the admin dashboard</h2>
          <p className="section-subtitle">Every learner enters the same orchestration pipeline: onboarding, live instruction, async deliverables, certification.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Step num={1} title="Browse courses" desc="Explore curated cohorts with transparent curriculum, session cadence, and certificate requirements." />
          <Step num={2} title="Enroll & pay" desc="Secure checkout, instant receipts, and automatic seat reservation inside the admin console." />
          <Step num={3} title="Join live sessions" desc="Calendar invites, reminder emails, and dashboards synced with our instructor tools." />
          <Step num={4} title="Earn certificate" desc="Submit your capstone, pass instructor review, and receive a verifiable credential." />
        </div>
      </div>
    </section>
  )
}

export default HowItWorks

