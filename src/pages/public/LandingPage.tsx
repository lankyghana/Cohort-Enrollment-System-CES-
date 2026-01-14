import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import apiClient from '@/services/apiClient'
import { publicAssetUrl } from '@/utils/assets'

type Course = {
  id: string
  title: string
  short_description: string
  category: string
  thumbnail_url?: string | null
}

const HeroSlideshow = ({ containerClassName }: { containerClassName?: string }) => {
  const slides = useMemo(() => [publicAssetUrl('hero-vr.jpg'), publicAssetUrl('hero-vr-2.jpg')], [])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => window.clearInterval(id)
  }, [slides.length])

  const container = containerClassName ? `relative ${containerClassName}` : 'relative aspect-[4/3]'

  return (
    <div className={container}>
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
      <div className="grid gap-10 lg:grid-cols-[1.05fr,_0.95fr] lg:items-center xl:grid-cols-[1.1fr,_0.9fr] xl:gap-14">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-3xl lg:text-left">
          <p className="eyebrow">SkillTech Cohort 2026</p>

          <h1 className="mt-4 text-3xl font-heading font-bold leading-tight tracking-tight text-slate-950 max-[360px]:text-[1.9rem] sm:text-4xl lg:text-5xl">
            Let`s think Digital.
            <span className="text-primary">.</span>
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">
            A structured cohort experience that prepares learners with industry-ready tech skills, project-based learning, mentorship, and certification upon successful completion.
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
              <div className="pointer-events-none absolute inset-0 z-0 bg-slate-950/10" />

              <div className="absolute bottom-4 left-1/2 z-20 w-[calc(100%-2rem)] max-w-[22rem] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-lg sm:bottom-auto sm:left-6 sm:top-6 sm:w-auto sm:max-w-[16rem] sm:translate-x-0 xl:left-8 xl:top-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-primary/80 sm:text-[11px]">
                  Program
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">Cohort sprint</p>
                <p className="mt-1 text-xs text-text-light line-clamp-1 sm:line-clamp-2">
                  Live support + tasks + accountability
                </p>
              </div>

              {/* stat pill */}
              <div className="absolute right-4 top-4 z-20 rounded-full border border-slate-200 bg-white/90 px-3 py-2 shadow-lg sm:right-6 sm:top-6 xl:right-8 xl:top-8">
                <p className="text-[11px] font-semibold leading-tight text-slate-900">5000 slots</p>
                <p className="text-[10px] leading-tight text-text-light">Per cohort</p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[{ v: '5000', l: 'Slots' }, { v: '4 months', l: 'Duration' }, { v: 'Mentorship', l: 'Support' }].map((s) => (
              <Card
                key={s.l}
                variant="outlined"
                padding="none"
                className="rounded-2xl border-slate-200/90 bg-white/95 shadow-soft ring-1 ring-slate-200/70"
              >
                <div className="flex min-h-[72px] flex-col items-center justify-center px-3 py-3 text-center sm:min-h-[80px] sm:px-4 sm:py-4">
                  <p className="text-lg font-semibold leading-none tracking-tight text-slate-900 sm:text-xl">{s.v}</p>
                  <p className="mt-1 text-[11px] leading-tight text-text-light sm:text-xs">{s.l}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
)

const HeroMobile = () => (
  <section className="bg-slate-50 pb-6 pt-6">
    <div className="container-custom space-y-4">
      <div className="space-y-3 text-center">
        <h1 className="text-[28px] font-heading font-bold leading-tight tracking-tight text-slate-950">
          Let&apos;s think Digital<span className="text-primary">.</span>
        </h1>
        <p className="mx-auto max-w-[28rem] text-[15px] leading-relaxed text-slate-700">
          A structured cohort experience with mentorship, projects, and certification.
        </p>
      </div>

      <div className="grid gap-3">
        <Button asChild size="lg" className="w-full rounded-full">
          <Link to="/register">Sign up</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full rounded-full border-slate-300 text-slate-900">
          <Link to="/courses">Browse Tech Programs</Link>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[{ k: 'Structured' }, { k: 'Certificate' }, { k: 'Mentorship' }].map((item) => (
          <div key={item.k} className="rounded-2xl border border-slate-200 bg-white px-2 py-3">
            <p className="text-[12px] font-semibold text-slate-900">{item.k}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
        <div className="relative">
          <HeroSlideshow containerClassName="h-48" />
          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-slate-900">
            5000 slots per cohort
          </div>
        </div>
        <div className="space-y-1 px-4 py-4">
          <p className="text-sm font-semibold text-slate-900">Cohort sprint</p>
          <p className="text-[13px] leading-relaxed text-slate-700">Live support + tasks + accountability</p>
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

      <div className="grid gap-6 md:grid-cols-3 xl:gap-8">
        {[
          'You want to work on ambitious goals and need a clear plan to get there.',
          'You want to learn how to access opportunities and get interview requests.',
          'You want to learn how to ace technical interviews and land offers.',
        ].map((copy, index) => (
          <div key={copy} className="relative">
            <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 xl:hidden">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                <span className="text-base font-bold">{index + 1}</span>
                <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-primary/40" />
              </div>
            </div>
            <Card className="h-full bg-white pt-10 text-center xl:pt-8 xl:text-left">
              <p className="mx-auto max-w-[18rem] text-base font-medium leading-relaxed text-slate-900 xl:mx-0 xl:max-w-none">{copy}</p>
            </Card>
          </div>
        ))}
      </div>
    </div>
  </section>
)

const WhoItsForMobile = () => (
  <section id="guidelines" className="bg-slate-50 py-6">
    <div className="container-custom space-y-4">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Who is this for?</p>
        <h2 className="mt-2 text-[24px] font-heading font-bold leading-tight text-slate-950">Who is this cohort for?</h2>
      </div>
      <div className="space-y-3">
        {[
          'You want structure, feedback, and a clear plan.',
          'You want guidance to access real opportunities.',
          'You want to improve interviews and land offers.',
        ].map((copy) => (
          <Card
            key={copy}
            padding="none"
            className="bg-white border-slate-200 shadow-none hover:shadow-none hover:translate-y-0 backdrop-blur-none"
          >
            <div className="px-5 py-4">
              <p className="text-[15px] leading-relaxed text-slate-900">{copy}</p>
            </div>
          </Card>
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
            <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 xl:hidden">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                <span className="text-base font-bold">{m.num}</span>
                <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-primary/40" />
              </div>
            </div>
            <Card className="bg-white pt-10 text-center xl:pt-8 xl:text-left">
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

const WhatToExpectMobile = () => (
  <section className="bg-slate-50 py-6">
    <div className="container-custom space-y-4">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">What to expect</p>
        <h2 className="mt-2 text-[24px] font-heading font-bold leading-tight text-slate-950">What to expect</h2>
      </div>

      <div className="space-y-3">
        {[{
          title: 'Crafting a standout resume and portfolio',
          desc: 'Create a resume + portfolio that sells your strengths.',
          foot: 'Templates and resources',
        }, {
          title: 'Applying for jobs and getting referrals',
          desc: 'Find roles, apply smartly, and reach out effectively.',
          foot: 'Tasks and assessments',
        }, {
          title: 'Preparing for technical interviews',
          desc: 'Practice what matters and build confident delivery.',
          foot: 'Interview practice',
        }, {
          title: 'Landing offers & making negotiations',
          desc: 'Evaluate offers and negotiate with clarity.',
          foot: 'Offer strategy',
        }].map((m) => (
          <Card
            key={m.title}
            variant="outlined"
            padding="none"
            className="bg-white border-slate-200 shadow-none hover:shadow-none hover:translate-y-0 backdrop-blur-none"
          >
            <details className="group px-5 py-4">
              <summary className="cursor-pointer list-none">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{m.title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-700">{m.desc}</p>
                  </div>
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="text-lg leading-none group-open:hidden">+</span>
                    <span className="text-lg leading-none hidden group-open:inline">–</span>
                  </div>
                </div>
              </summary>
              <div className="mt-3 text-[13px] text-text-light">
                <div className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>{m.foot}</span>
                </div>
              </div>
            </details>
          </Card>
        ))}
      </div>
    </div>
  </section>
)

const TemplatesResourcesMobile = () => (
  <section className="bg-slate-50 py-6">
    <div className="container-custom">
      <Card padding="none" className="bg-white border-slate-200 shadow-none hover:shadow-none hover:translate-y-0 backdrop-blur-none">
        <div className="px-5 py-5">
          <p className="text-sm font-semibold text-slate-900">Templates & resources</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-slate-700">
            <li>Tasks and assessments</li>
            <li>Project showcase guidance</li>
            <li>Reusable templates</li>
          </ul>
        </div>
      </Card>
    </div>
  </section>
)


const CourseCard = ({ title, cat, desc, id, thumbnailUrl }: { title: string; cat: string; desc: string; id: string; thumbnailUrl?: string | null }) => (
  <div className="surface-card h-full overflow-hidden shadow-none ring-1 ring-slate-200/80">
    <div className="h-48 overflow-hidden rounded-[24px] bg-card-glow">
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt={title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
      ) : null}
    </div>
    <div className="mt-6 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">{cat}</p>
      <h3 className="text-xl font-semibold text-text">{title}</h3>
      <p className="text-sm text-text-soft">{desc}</p>
      <Link to={`/courses/${id}`} className="text-sm font-semibold text-primary hover:underline">View course →</Link>
    </div>
  </div>
)

const CourseCardMobile = ({ title, cat, desc, id, thumbnailUrl }: { title: string; cat: string; desc: string; id: string; thumbnailUrl?: string | null }) => (
  <Link
    to={`/courses/${id}`}
    className="block overflow-hidden rounded-[24px] border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
    aria-label={`View course: ${title}`}
  >
    <div className="h-36 w-full bg-slate-100">
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt={title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
      ) : null}
    </div>
    <div className="space-y-2 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">{cat}</p>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-[13px] leading-relaxed text-slate-700 line-clamp-2">{desc}</p>
      <p className="pt-1 text-sm font-semibold text-primary">View course →</p>
    </div>
  </Link>
)

const ChooseProgramMobile = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      try {
        const { data } = await apiClient.get('/api/courses', {
          params: {
            enrollable: true,
            pageSize: 6,
          },
        })
        const list = Array.isArray(data) ? data : (data?.data ?? [])
        setCourses(list.slice(0, 3))
      } catch (error) {
        console.error('Failed to fetch cohorts', error)
        setCourses([])
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  return (
    <section className="bg-slate-50 py-6">
      <div className="container-custom space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[24px] font-heading font-bold leading-tight text-slate-950">Choose a program</h2>
          <Link to="/courses" className="text-sm font-semibold text-primary hover:underline">All →</Link>
        </div>

        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
                <div className="h-36 w-full bg-slate-100" />
                <div className="space-y-3 px-5 py-4">
                  <div className="h-3 w-24 rounded bg-slate-100" />
                  <div className="h-4 w-2/3 rounded bg-slate-100" />
                  <div className="h-3 w-full rounded bg-slate-100" />
                </div>
              </div>
            ))
          ) : courses.length ? (
            courses.map((c) => (
              <CourseCardMobile
                key={c.id}
                id={c.id}
                title={c.title}
                cat={c.category}
                desc={c.short_description}
                thumbnailUrl={c.thumbnail_url}
              />
            ))
          ) : (
            <Card padding="none" className="bg-white border-slate-200 shadow-none hover:shadow-none hover:translate-y-0 backdrop-blur-none text-center">
              <div className="px-5 py-6">
                <p className="text-sm font-semibold text-slate-900">No published cohorts yet</p>
                <p className="mt-1 text-[13px] text-text-light">Check back soon.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}
const FeaturedCourses = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [mobileIndex, setMobileIndex] = useState(0)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await apiClient.get('/api/courses', {
          params: {
            enrollable: true,
            pageSize: 12,
          },
        })
        const list = Array.isArray(data) ? data : (data?.data ?? [])
        setCourses(list)
      } catch (error) {
        console.error('Failed to fetch featured courses', error)
      }
    }
    fetchCourses()
  }, [])

  useEffect(() => {
    setMobileIndex(0)
  }, [courses.length])

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1280px)')
    const apply = () => setIsDesktop(mql.matches)
    apply()
    mql.addEventListener('change', apply)
    return () => mql.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (courses.length <= 1) return
    const id = window.setInterval(() => {
      setMobileIndex((prev) => (prev + 1) % courses.length)
    }, 10000)
    return () => window.clearInterval(id)
  }, [courses.length])

  const mobileCourse = courses[mobileIndex]
  const desktopCourses = isDesktop ? courses.slice(0, 3) : courses

  return (
    <section className="py-10 sm:py-12 lg:py-16">
      <div className="container-custom space-y-8">
        <div className="flex flex-col gap-3 text-center md:text-left">
          <p className="pill bg-primary/10 text-primary">Join a cohort</p>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="section-heading">Choose a program to start</h2>
            <Link to="/courses" className="text-sm font-semibold text-primary hover:underline">View all cohorts →</Link>
          </div>
          <p className="section-subtitle mx-auto max-w-2xl md:mx-0">Pick a cohort and follow a clear, weekly plan.</p>
        </div>

        {/* Mobile: auto-slide every 10 seconds */}
        <div className="md:hidden">
          {mobileCourse ? (
            <CourseCard
              id={mobileCourse.id}
              title={mobileCourse.title}
              cat={mobileCourse.category}
              desc={mobileCourse.short_description}
              thumbnailUrl={mobileCourse.thumbnail_url}
            />
          ) : (
            <Card className="bg-white text-center">
              <p className="text-sm text-text-light">Loading cohorts…</p>
            </Card>
          )}
        </div>

        {/* Desktop/tablet: grid up to 4 wide */}
        <div className="hidden grid-cols-1 gap-6 md:grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-3">
          {desktopCourses.map((c) => (
            <CourseCard
              key={c.id}
              id={c.id}
              title={c.title}
              cat={c.category}
              desc={c.short_description}
              thumbnailUrl={c.thumbnail_url}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// Testimonials
const testimonials: { name: string; quote: string; avatar: string }[] = [
  {
    name: 'Amina',
    quote: 'Transformative course — I landed a new job within months.',
    avatar: publicAssetUrl('circled-user-icon-user-pro-icon-11553397069rpnu1bqqup.png'),
  },
  {
    name: 'Kwame',
    quote: 'Practical, hands-on and well organized.',
    avatar: publicAssetUrl('circled-user-icon-user-pro-icon-11553397069rpnu1bqqup.png'),
  },
  {
    name: 'Sara',
    quote: 'Amazing instructors and community support.',
    avatar: publicAssetUrl('circled-user-icon-user-pro-icon-11553397069rpnu1bqqup.png'),
  },
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
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center lg:bg-white/80 lg:backdrop-blur-sm xl:bg-white xl:backdrop-blur-0 sm:px-10">
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

const TestimonialsMobile = () => {
  const dots = useMemo(() => testimonials.map((_, i) => i), [])
  return (
    <section id="testimonials" className="bg-slate-50 py-6">
      <div className="container-custom space-y-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Learner stories</p>
          <h2 className="mt-2 text-[24px] font-heading font-bold leading-tight text-slate-950">Learner stories</h2>
        </div>

        <div className="-mx-4 overflow-x-auto px-4" style={{ scrollSnapType: 'x mandatory' }}>
          <div className="flex gap-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="w-[85%] flex-none scroll-mx-4 rounded-[24px] border border-slate-200 bg-white px-5 py-5"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name + ' avatar'} className="h-12 w-12 rounded-full object-cover" loading="lazy" decoding="async" />
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                </div>
                <p className="mt-4 text-[13px] leading-relaxed text-slate-700">“{t.quote}”</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          {dots.map((i) => (
            <span key={i} className="h-2 w-2 rounded-full bg-text-soft/30" />
          ))}
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

const FAQMobile = () => (
  <section className="bg-slate-50 py-6">
    <div className="container-custom space-y-4">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">FAQ</p>
        <h2 className="mt-2 text-[24px] font-heading font-bold leading-tight text-slate-950">FAQ</h2>
      </div>

      <div className="space-y-3">
        {[{
          q: 'When does the next cohort start?',
          a: 'Dates depend on the cohort. View available cohorts and sign up when a seat opens.',
        }, {
          q: 'When are sessions held?',
          a: 'Each cohort has its own schedule. After you register, you’ll see session times inside your dashboard.',
        }, {
          q: 'What if I miss a live class?',
          a: 'Sessions are recorded and shared so you can catch up.',
        }, {
          q: 'Is there support between classes?',
          a: 'Yes. You’ll have a community space to ask questions and get feedback during the cohort.',
        }].map((item) => (
          <Card
            key={item.q}
            variant="outlined"
            padding="none"
            className="bg-white border-slate-200 shadow-none hover:shadow-none hover:translate-y-0 backdrop-blur-none"
          >
            <details className="group px-5 py-4">
              <summary className="cursor-pointer list-none">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-900">{item.q}</p>
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="text-lg leading-none group-open:hidden">+</span>
                    <span className="text-lg leading-none hidden group-open:inline">–</span>
                  </div>
                </div>
              </summary>
              <p className="mt-3 text-[13px] leading-relaxed text-slate-700">{item.a}</p>
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
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold leading-tight !text-white">Are you ready to start?</h3>
          <p className="mx-auto mt-4 max-w-2xl text-base !text-white">
            Select a cohort and gain access to tailored mentorship, resources, and a community of ambitious learners.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-full sm:px-10">
              <Link to="/register">Join a cohort</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 sm:px-10">
              <a href="mailto:support@skilltechcohort.com">Contact Us</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
)

const FinalCTAMobile = () => (
  <section className="bg-slate-50 py-8">
    <div className="container-custom">
      <div className="relative overflow-hidden rounded-[28px] bg-slate-900 px-5 py-8 text-white">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary" />
          <div className="absolute -right-28 top-6 h-72 w-72 rounded-full bg-primary/60" />
        </div>

        <div className="relative">
          <h3 className="text-[24px] font-heading font-bold leading-tight !text-white">Ready to start?</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-white/80">
          Join a cohort, learn with structure, and build outcomes.
          </p>
          <div className="mt-5 grid gap-3">
            <Button asChild size="lg" className="w-full rounded-full">
              <Link to="/register">Join a cohort</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20">
              <a href="mailto:support@skilltechcohort.com">Contact Us</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
)


const LandingPage = () => (
  <div className="space-y-0 bg-slate-50">
    <div className="lg:hidden">
      <HeroMobile />
      <section className="bg-slate-50 pb-6">
        <div className="container-custom">
          <div className="grid grid-cols-2 gap-3">
            <Card padding="none" className="bg-white border-slate-200 shadow-none hover:shadow-none hover:translate-y-0 backdrop-blur-none">
              <div className="px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">5000</p>
                <p className="mt-1 text-xs text-text-light">Slots</p>
              </div>
            </Card>
            <Card padding="none" className="bg-white border-slate-200 shadow-none hover:shadow-none hover:translate-y-0 backdrop-blur-none">
              <div className="px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">4 months</p>
                <p className="mt-1 text-xs text-text-light">Duration</p>
              </div>
            </Card>
            <Card padding="none" className="col-span-2 bg-white border-slate-200 shadow-none hover:shadow-none hover:translate-y-0 backdrop-blur-none">
              <div className="px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">Mentorship</p>
                <p className="mt-1 text-xs text-text-light">Support</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <WhoItsForMobile />
      <WhatToExpectMobile />
      <TemplatesResourcesMobile />
      <ChooseProgramMobile />
      <TestimonialsMobile />
      <FAQMobile />
      <FinalCTAMobile />
    </div>

    <div className="hidden lg:block">
      <HeroSection />
      <WhoItsFor />
      <Curriculum />
      <FeaturedCourses />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </div>
  </div>
)

export default LandingPage;
export { LandingPage };


