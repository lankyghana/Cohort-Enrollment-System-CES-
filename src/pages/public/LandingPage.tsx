import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import AnimatedMetricCard from '@/components/ui/AnimatedMetricCard'
import apiClient from '@/services/apiClient'

// HeroSection
const HeroSection = () => (
  <section className="relative overflow-hidden py-16">
    <div className="container-custom">
      <div className="gradient-shell px-8 py-12 rounded-3xl">
        <div className="flex flex-col items-center gap-12 lg:flex-row">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <p className="pill bg-primary/10 text-primary-dark">Cohort Operating System</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 leading-tight">Modern cohort learning for ambitious teams</h1>
            <p className="text-lg text-slate-700 max-w-xl">Fast, practical programs with live accountability, concierge onboarding, and verified credentials once you complete the capstone pathway.</p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="px-6">
                <Link to="/register">Get started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-6 border-slate-300 text-slate-800 hover:text-primary">
                <Link to="/courses">Browse cohorts</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start text-slate-700 text-sm">
              <div><p className="text-3xl font-semibold text-slate-900">2k+</p>Alumni professionals</div>
              <div><p className="text-3xl font-semibold text-slate-900">40+</p>Active cohorts</div>
              <div><p className="text-3xl font-semibold text-slate-900">95%</p>Completion rate</div>
            </div>
          </div>
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="glass-panel float-anim space-y-4 rounded-[32px] bg-white/70 text-slate-800 backdrop-blur-xl p-6 border border-slate-200 shadow-xl w-full max-w-md">
              <div className="rounded-3xl bg-slate-100 p-4">
                <iframe
                  width="100%"
                  height="220"
                  src="https://www.youtube.com/embed/vqAzq3wDXR4?autoplay=1&mute=1"
                  title="What are Cohort Courses and Why Make One?"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  style={{ borderRadius: '24px', background: '#fff' }}
                ></iframe>
              </div>
              <div className="rounded-3xl bg-slate-100 p-4">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Upcoming Cohort</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">SkillUp-Cohort26</p>
                <p className="text-sm text-slate-600">1st February, 2026 · 12:00 PM GMT</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)

// StatsSection
// Step component for HowItWorks
function Step({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="surface-card hover-lift h-full">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">{num}</div>
        <div>
          <p className="text-lg font-semibold text-text">{title}</p>
          <p className="mt-2 text-sm text-text-soft">{desc}</p>
        </div>
      </div>
    </div>
  );
}
const StatsSection = () => (
  <section className="py-16">
    <div className="container-custom space-y-10">
      <div className="text-center">
        <p className="pill mx-auto bg-primary/10 text-primary">Impact metrics</p>
        <h2 className="section-heading mt-4">Proof from thousands of alumni</h2>
        <p className="section-subtitle max-w-2xl mx-auto">Every stat is driven by real cohorts tracked inside the admin dashboard. We mirror the same reporting visuals for public pages.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatedMetricCard title="Students trained" value="2,430" />
        <AnimatedMetricCard title="Cohorts completed" value="20" accent="from-primary to-teal-500" />
        <AnimatedMetricCard title="Active learners" value="540" accent="from-fuchsia-500 to-primary" />
        <AnimatedMetricCard title="Avg. completion" value="92%" accent="from-primary to-emerald-400" />
      </div>
    </div>
  </section>
)

const HowItWorks = () => (
  <section className="py-16">
    <div className="container-custom space-y-10">

      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <p className="pill bg-primary/10 text-primary">How it works</p>

        <h2 className="section-heading text-slate-900">
          Same flow as the admin dashboard
        </h2>

        <p className="section-subtitle text-slate-700">
          Every learner enters the same orchestration pipeline: onboarding,
          live instruction, async deliverables, certification.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Step
          num={1}
          title="Browse courses"
          desc="Explore curated cohorts with detailed curriculum, session cadence, and prerequisites."
        />
        <Step
          num={2}
          title="Enroll & pay"
          desc="Secure checkout with instant confirmation and automatic seat reservation."
        />
        <Step
          num={3}
          title="Join live sessions"
          desc="Calendar invites, reminder emails, and synced dashboards with instructor tools."
        />
        <Step
          num={4}
          title="Earn certificate"
          desc="Complete your capstone and receive a verified credential upon instructor approval."
        />
      </div>

    </div>
  </section>
)


// FeaturedCourses
type Course = {
  id: string;
  title: string;
  short_description: string;
  category: string;
};

const CourseCard = ({ title, cat, desc, id }: { title: string; cat: string; desc: string; id: string }) => (
  <div className="surface-card hover-lift h-full overflow-hidden">
    <div className="h-48 rounded-[24px] bg-card-glow" />
    <div className="mt-6 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">{cat}</p>
      <h3 className="text-xl font-semibold text-text">{title}</h3>
      <p className="text-sm text-text-soft">{desc}</p>
      <Link to={`/courses/${id}`} className="text-sm font-semibold text-primary hover:underline">View course →</Link>
    </div>
  </div>
)
const FeaturedCourses = () => {
  const [courses, setCourses] = useState<Course[]>([])
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await apiClient.get('/api/courses/featured')
        setCourses(data.data || [])
      } catch (error) {
        console.error('Failed to fetch featured courses', error)
      }
    }
    fetchCourses()
  }, [])
  return (
    <section className="py-16">
      <div className="container-custom space-y-8">
        <div className="flex flex-col gap-4 text-center md:text-left">
          <p className="pill bg-primary/10 text-primary">Featured programs</p>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="section-heading">Course Marketplace</h2>
            <Link to="/courses" className="text-sm font-semibold text-primary hover:underline">View full catalog →</Link>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} id={c.id} title={c.title} cat={c.category} desc={c.short_description} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Testimonials
const testimonials: { name: string; quote: string; avatar: string }[] = [
  { name: 'Amina', quote: 'Transformative course — I landed a new job within months.', avatar: '/circled-user-icon-user-pro-icon-11553397069rpnu1bqqup.png' },
  { name: 'Kwame', quote: 'Practical, hands-on and well organized.', avatar: '/circled-user-icon-user-pro-icon-11553397069rpnu1bqqup.png' },
  { name: 'Sara', quote: 'Amazing instructors and community support.', avatar: '/circled-user-icon-user-pro-icon-11553397069rpnu1bqqup.png' },
]
const Testimonials = () => {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % testimonials.length), 6000)
    return () => clearInterval(t)
  }, [])
  const t = testimonials[idx]
  return (
    <section id="testimonials" className="py-16">
      <div className="container-custom space-y-8">
        <div className="text-center">
          <p className="pill mx-auto bg-primary/10 text-primary">Testimonials</p>
          <h2 className="section-heading mt-4">Loved by learners across Africa and beyond</h2>
        </div>
        <div className="glass-panel mx-auto max-w-3xl px-10 py-12 text-center">
          <img src={t.avatar} alt={t.name + ' avatar'} className="mx-auto mb-4 h-16 w-16 rounded-full object-cover" />
          <p className="text-xl font-semibold text-text">{t.name}</p>
          <p className="mt-4 text-lg text-text-soft">“{t.quote}”</p>
          <div className="mt-6 flex items-center justify-center gap-2">
            {testimonials.map((_, i) => (
              <span key={i} className={`h-2 w-2 rounded-full ${i === idx ? 'bg-primary' : 'bg-text-soft/30'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// FinalCTA
const FinalCTA = () => (
  <section className="py-20">
    <div className="container-custom">
      <div className="gradient-shell text-center px-10 py-14">
        <p className="pill bg-primary/10 text-primary-dark">Join the cohort</p>
        <h3 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 leading-tight">Ready to join a live cohort?</h3>
        <p className="section-subtitle max-w-2xl mx-auto">Start learning with peers, finish projects, and unlock verifiable credentials tracked in the admin dashboard.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/register">Join now</Link>
          </Button>
              <Button asChild size="lg" variant="outline" className="px-6 border-slate-300 text-slate-800 hover:text-primary">
            <Link to="/courses">Browse catalog</Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
)


const LandingPage = () => (
  <div className="space-y-4">
    <HeroSection />
    <StatsSection />
    <HowItWorks />
    <FeaturedCourses />
    <Testimonials />
    <FinalCTA />
  </div>
)

export default LandingPage;
export { LandingPage };


