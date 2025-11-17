const Step = ({ num, title, desc }: { num: number; title: string; desc: string }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold">{num}</div>
      <div>
        <div className="font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-500 mt-1">{desc}</div>
      </div>
    </div>
  </div>
)

export const HowItWorks = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-2xl font-heading font-bold mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Step num={1} title="Browse Courses" desc="Explore curated cohorts and pick the one that fits your goals." />
          <Step num={2} title="Enroll & Pay" desc="Secure checkout with multiple payment options and receipts." />
          <Step num={3} title="Join Live Sessions" desc="Attend interactive classes and get feedback from instructors." />
          <Step num={4} title="Earn Certificate" desc="Complete projects and earn a verified certificate." />
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
