import { Link } from 'react-router-dom'

export const FinalCTA = () => {
  return (
    <section className="py-16 mt-8">
      <div className="container-custom">
        <div className="bg-gradient-to-r from-[#2563EB] to-[#A855F7] rounded-2xl p-12 text-white text-center shadow-2xl">
          <h3 className="text-3xl font-bold">Ready to join a cohort?</h3>
          <p className="mt-3 text-white/90">Start learning with peers, finish projects, and earn recognized certificates.</p>
          <div className="mt-6">
            <Link to="/register" className="inline-block bg-[#0E9F6E] px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-300">Join Now</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FinalCTA
