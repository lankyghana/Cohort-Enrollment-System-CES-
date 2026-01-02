import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import apiClient from '@/services/apiClient'

const HeroSlideshow = () => {
  const slides = useMemo(() => ['/hero-vr.jpg', '/hero-vr-2.jpg'], [])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => window.clearInterval(id)
  }, [slides.length])

  return (
    <div className="relative aspect-[4/3]">
      {slides.map((src, index) => (
        <img
          key={src}
          src={src}
          alt="Cohort learning"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />
      ))}
    </div>
  )
}

const HeroSection = () => (
  <section className="bg-slate-50 py-10 sm:py-12 lg:py-16">
    <div className="container-custom">
      <div className="grid gap-10 lg:grid-cols-[1.05fr,_0.95fr] lg:items-center">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-3xl lg:text-left">
          <p className="eyebrow">SkillTech Cohort 2026</p>

          <h1 className="mt-4 text-3xl font-heading font-bold leading-tight tracking-tight text-slate-950 max-[360px]:text-[1.9rem] sm:text-4xl lg:text-5xl">
            Let`s think Digital.
            <span className="text-primary">.</span>
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">
            A focused cohort designed to equip you with the skills, habits, and support you need to reach your next milestone.
          </p>

          <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap sm:justify-center lg:justify-start">
            <Button asChild size="lg" className="w-full rounded-full sm:w-auto sm:px-10">
              <Link to="/register">Sign up</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full rounded-full border-slate-300 text-slate-900 hover:text-primary sm:w-auto sm:px-10">
              <Link to="/courses">Browse Tech Programs</Link>
            </Button>
          </div>

          <div className="mt-4">
            <Link to="/login" className="text-sm font-semibold text-primary hover:underline">
              Already enrolled? Sign in
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-[44px] border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <div className="relative">
              <HeroSlideshow />
              <div className="absolute inset-0 bg-slate-950/10" />

              <div className="absolute left-6 top-6 rounded-3xl border border-white/60 bg-white/80 px-5 py-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">Program</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">Cohort sprint</p>
                <p className="mt-1 text-sm text-text-light">Live support + tasks + accountability</p>
              </div>

              {/* stat pill */}
              <div className="absolute bottom-8 right-8 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-lg">
                <p className="text-xs font-semibold text-slate-900">5000 slots</p>
                <p className="text-xs text-text-light">Per cohort</p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[{ v: '5000', l: 'Slots' }, { v: '4 months', l: 'Duration' }, { v: 'Mentorship', l: 'Support' }].map((s) => (
              <Card key={s.l} variant="outlined" padding="sm" className="shadow-none bg-white">
                <p className="text-base font-semibold text-slate-900">{s.v}</p>
                <p className="mt-1 text-xs text-text-light">{s.l}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
)

const WhoItsFor = () => (
  <section id="guidelines" className="bg-slate-50 py-10 sm:py-12 lg:py-16">
    <div className="container-custom space-y-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Knowing the right fit</p>
        <h2 className="mt-3 text-3xl font-heading font-bold leading-tight text-slate-950 sm:text-4xl">Who is this cohort for?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-700 sm:text-lg">
          If you want structure, feedback, and a clear weekly plan, you’ll feel at home here.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          'You want to work on ambitious goals and need a clear plan to get there.',
          'You want to learn how to access opportunities and get interview requests.',
          'You want to learn how to ace technical interviews and land offers.',
        ].map((copy, index) => (
          <div key={copy} className="relative">
            <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                <span className="text-base font-bold">{index + 1}</span>
                <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-primary/40" />
              </div>
            </div>
            <Card className="h-full bg-white pt-10 text-center">
              <p className="mx-auto max-w-[18rem] text-base font-medium leading-relaxed text-slate-900">{copy}</p>
            </Card>
          </div>
        ))}
      </div>
    </div>
  </section>
)

const Curriculum = () => (
  <section className="bg-slate-50 py-10 sm:py-12 lg:py-16">
    <div className="container-custom space-y-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">What to expect</p>
        <h2 className="mt-3 text-3xl font-heading font-bold leading-tight text-slate-950 sm:text-4xl">What to expect</h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-700 sm:text-lg">
          Four clear modules designed to build confidence and results.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[
          {
            num: 1,
            title: 'Crafting a standout resume and portfolio',
            desc: 'Learn how to create resumes and portfolios that showcase your skills and achievements.',
            foot: 'Templates and resources',
          },
          {
            num: 2,
            title: 'Applying for jobs and getting referrals',
            desc: 'Learn how to find opportunities, navigate application systems, and reach out effectively.',
            foot: 'Tasks and assessments',
          },
          {
            num: 3,
            title: 'Preparing for technical interviews',
            desc: 'Learn how companies hire and how to show confidence during problem solving and interview rounds.',
            foot: 'Interview practice',
          },
          {
            num: 4,
            title: 'Landing offers & making negotiations',
            desc: 'Learn how to evaluate offers, negotiate effectively, and secure the best terms for your growth.',
            foot: 'Offer strategy',
          },
        ].map((m) => (
          <div key={m.num} className="relative">
            <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                <span className="text-base font-bold">{m.num}</span>
                <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-primary/40" />
              </div>
            </div>
            <Card className="bg-white pt-10 text-center">
              <p className="text-xl font-semibold text-slate-900">{m.title}</p>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-text-light">{m.desc}</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm text-text-light">
                <span className="h-4 w-4 rounded bg-primary/10 ring-1 ring-primary/20" />
                <span>{m.foot}</span>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <Card variant="outlined" className="shadow-none">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-lg font-semibold text-slate-900">Templates and resources</p>
            <p className="mt-2 text-sm text-text-light">Everything you need to move faster each week.</p>
          </div>
          <ul className="space-y-2 text-sm text-text-light">
            <li className="flex gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-primary" />Tasks and assessments</li>
            <li className="flex gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-primary" />Project showcase guidance</li>
            <li className="flex gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-primary" />Reusable templates</li>
          </ul>
        </div>
      </Card>
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
  <div className="surface-card h-full overflow-hidden shadow-none ring-1 ring-slate-200/80">
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
    <section className="py-10 sm:py-12 lg:py-16">
      <div className="container-custom space-y-8">
        <div className="flex flex-col gap-3 text-center md:text-left">
          <p className="pill bg-primary/10 text-primary">Join a cohort</p>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="section-heading">Choose a cohort to start</h2>
            <Link to="/courses" className="text-sm font-semibold text-primary hover:underline">View all cohorts →</Link>
          </div>
          <p className="section-subtitle mx-auto max-w-2xl md:mx-0">Pick a cohort and follow a clear, weekly plan.</p>
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
  const dots = useMemo(() => testimonials.map((_, i) => i), [])
  return (
    <section id="testimonials" className="py-16">
      <div className="container-custom space-y-8">
        <div className="text-center">
          <p className="pill mx-auto bg-primary/10 text-primary">Learner stories</p>
          <h2 className="section-heading mt-4">What learners say</h2>
          <p className="section-subtitle mx-auto max-w-2xl">Short reflections from people who completed a cohort journey.</p>
        </div>
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center lg:bg-white/80 lg:backdrop-blur-sm sm:px-10">
          <img src={t.avatar} alt={t.name + ' avatar'} className="mx-auto mb-4 h-16 w-16 rounded-full object-cover" />
          <p className="text-xl font-semibold text-text">{t.name}</p>
          <p className="mt-4 text-lg leading-relaxed text-slate-700">“{t.quote}”</p>
          <div className="mt-6 flex items-center justify-center gap-2">
            {dots.map((i) => (
              <span key={i} className={`h-2 w-2 rounded-full ${i === idx ? 'bg-primary' : 'bg-text-soft/30'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const FAQ = () => (
  <section className="py-10 sm:py-12 lg:py-16">
    <div className="container-custom space-y-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="pill mx-auto bg-primary/10 text-primary">Frequently asked questions</p>
        <h2 className="mt-3 text-3xl font-heading font-bold leading-tight text-slate-950 sm:text-4xl">Would you like to know more?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-700 sm:text-lg">
          Quick answers about timing, format, and what happens if you miss a session.
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-3">
        {[{
          q: 'When does the next cohort start?',
          a: 'Dates depend on the cohort. You can view available cohorts on the cohorts page and sign up when a seat opens.',
        }, {
          q: 'When are sessions held?',
          a: 'Each cohort has its own schedule. After you register, you’ll see the live session schedule inside your dashboard.',
        }, {
          q: 'What if I miss a live class?',
          a: 'No stress—sessions are recorded and shared so you can catch up.',
        }, {
          q: 'Is there support between classes?',
          a: 'Yes. You’ll have a community space to ask questions, share progress, and get feedback during the cohort.',
        }].map((item) => (
          <Card key={item.q} variant="outlined" padding="none" className="shadow-none">
            <details className="group px-6 py-4">
              <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">
                <div className="flex items-center justify-between gap-4">
                  <span>{item.q}</span>
                  <span className="pill bg-primary/10 text-primary group-open:hidden">+</span>
                  <span className="pill bg-primary/10 text-primary hidden group-open:inline">–</span>
                </div>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-text-light">{item.a}</p>
            </details>
          </Card>
        ))}
      </div>
    </div>
  </section>
)

// FinalCTA
const FinalCTA = () => (
  <section className="bg-slate-50 py-12 sm:py-16">
    <div className="container-custom">
      <div className="relative overflow-hidden rounded-[44px] border border-slate-200 bg-slate-900">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary" />
          <div className="absolute -right-40 top-10 h-96 w-96 rounded-full bg-primary/60" />
        </div>

        <div className="relative px-6 py-14 text-center text-white sm:px-10">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold leading-tight">Are you ready to start?</h3>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80">
            Select a cohort and gain access to tailored mentorship, resources, and a community of ambitious learners.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-full sm:px-10">
              <Link to="/register">Join a cohort</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 sm:px-10">
              <a href="mailto:support@joincohorts.org">Contact Us</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
)


const LandingPage = () => (
  <div className="space-y-0 bg-slate-50">
    <HeroSection />
    <WhoItsFor />
    <Curriculum />
    <FeaturedCourses />
    <Testimonials />
    <FAQ />
    <FinalCTA />
  </div>
)

export default LandingPage;
export { LandingPage };


