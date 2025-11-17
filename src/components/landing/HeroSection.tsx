import { Link } from 'react-router-dom'

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="container-custom py-20">
        <div className="bg-gradient-to-r from-blue-600 via-purple-500 to-green-500 rounded-2xl p-12 text-white relative shadow-xl">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-heading font-extrabold leading-tight text-white">Modern cohort learning for ambitious teams</h1>
              <p className="mt-4 text-lg text-white/90 fade-in">Fast, practical programs — live sessions, projects, and verified certificates to accelerate careers.</p>

              <div className="mt-6 flex flex-wrap gap-4">
                <Link to="/register" className="inline-block bg-[#0E9F6E] hover:scale-105 transform transition-all duration-300 text-white px-6 py-3 rounded-xl shadow-md">Get Started</Link>
                <Link to="/courses" className="inline-block border border-white/40 hover:border-[#2563EB] text-white px-5 py-3 rounded-xl">Browse Courses</Link>
              </div>
            </div>

            <div className="flex-1 hidden md:flex justify-center">
              <div className="w-full max-w-md bg-white bg-opacity-10 p-6 rounded-2xl float-anim">
                <div className="h-40 bg-white/10 rounded-lg mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-white/20 rounded-full w-3/4" />
                  <div className="h-3 bg-white/20 rounded-full w-1/2" />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute right-8 bottom-6">
            <div className="scroll-indicator">
              <div className="scroll-dot" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
