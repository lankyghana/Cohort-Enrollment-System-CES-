import AnimatedMetricCard from '@/components/ui/AnimatedMetricCard'

export const StatsSection = () => {
  return (
    <section className="py-16">
      <div className="container-custom space-y-10">
        <div className="text-center">
          <p className="pill mx-auto bg-primary/10 text-primary">Impact metrics</p>
          <h2 className="section-heading mt-4">Proof from thousands of alumni</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Every stat is driven by real cohorts tracked inside the admin dashboard. We mirror the same reporting visuals for public pages.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatedMetricCard title="Students trained" value="12,430" />
          <AnimatedMetricCard title="Cohorts completed" value="128" accent="from-primary to-teal-500" />
          <AnimatedMetricCard title="Active learners" value="3,540" accent="from-fuchsia-500 to-primary" />
          <AnimatedMetricCard title="Avg. completion" value="92%" accent="from-primary to-emerald-400" />
        </div>
      </div>
    </section>
  )
}

export default StatsSection
