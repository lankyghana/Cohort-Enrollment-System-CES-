 

const StatCard = ({ title, value, accent }: { title: string; value: string; accent: string }) => (
  <div className="bg-white rounded-2xl shadow-md p-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${accent}`}>
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M12 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{title}</div>
      </div>
    </div>
  </div>
)

export const StatsSection = () => {
  return (
    <section className="py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard title="Students Trained" value="12,430" accent="bg-gradient-to-r from-[#2563EB] to-[#A855F7]" />
          <StatCard title="Cohorts Completed" value="128" accent="bg-gradient-to-r from-[#0E9F6E] to-[#2563EB]" />
          <StatCard title="Active Learners" value="3,540" accent="bg-gradient-to-r from-[#A855F7] to-[#0E9F6E]" />
          <StatCard title="Avg. Completion" value="92%" accent="bg-gradient-to-r from-[#2563EB] to-[#0E9F6E]" />
        </div>
      </div>
    </section>
  )
}

export default StatsSection
