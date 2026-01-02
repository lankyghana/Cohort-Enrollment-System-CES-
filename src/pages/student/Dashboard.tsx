import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuthStore } from '@/store/authStore'
import AnimatedMetricCard from '@/components/ui/AnimatedMetricCard'
import Tabs from '@/components/ui/Tabs'
import UpcomingSessionCard from '@/components/ui/UpcomingSessionCard'
import ResourcesTable from '@/components/ui/ResourcesTable'
import useInView from '@/hooks/useInView'
import apiClient from '@/services/apiClient'
import { Button } from '@/components/ui/Button'

type Summary = {
  totalEnrolled: number
  totalCompleted: number
  overallProgress: number
}

interface Enrollment {
  id: string;
  progress_percentage: number;
  completed_at: string;
  course_id: string;
}

interface CourseSession {
  id: string;
  title: string;
  scheduled_at: string;
  course_id: string;
}

interface Resource {
  id: string;
  title: string;
  file_type: string;
  created_at: string;
}

type EnrollmentRow = Enrollment
type CourseSessionRow = CourseSession
type ResourceRow = Resource
type UpcomingSession = { id: string; title: string; time: string; course: string }

export const StudentDashboard = () => {
  const { user } = useAuthStore()
  const [summary, setSummary] = useState<Summary>({ totalEnrolled: 0, totalCompleted: 0, overallProgress: 0 })
  const [upcoming, setUpcoming] = useState<UpcomingSession[]>([])
  const [resources, setResources] = useState<ResourceRow[]>([])
  const { ref: heroRef, inView: heroInView } = useInView<HTMLDivElement>({ threshold: 0.1 })
  const { ref: metricsRef, inView: metricsInView } = useInView<HTMLDivElement>({ threshold: 0.2 })

  const hasEnrollments = summary.totalEnrolled > 0
  const primaryCta = useMemo(() => {
    if (hasEnrollments) {
      return { label: 'View my courses', to: '/dashboard/courses' }
    }

    return { label: 'Browse courses', to: '/courses' }
  }, [hasEnrollments])

  useEffect(() => {
    if (!user) return

    const fetchDashboardData = async () => {
      try {
        const { data } = await apiClient.get('/api/student/dashboard')
        
        const { enrollments, sessions, resources } = data

        const list = (enrollments || []) as EnrollmentRow[]
        const totalEnrolled = list.length
        const totalCompleted = list.filter((e) => !!e.completed_at).length
        const overallProgress = list.length ? Math.round(list.reduce((s, e) => s + (e.progress_percentage || 0), 0) / list.length) : 0

        setSummary({ totalEnrolled, totalCompleted, overallProgress })

        const upcomingList = (sessions || []).map((s: CourseSessionRow) => ({
          id: s.id,
          title: s.title,
          time: new Date(s.scheduled_at).toLocaleString(),
          course: s.course_id,
        }))
        setUpcoming(upcomingList)

        setResources(resources || [])
      } catch (err) {
        // swallow — keep UI friendly
      }
    }

    fetchDashboardData()
  }, [user])

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'resources', label: 'Resources' },
    { key: 'sessions', label: 'Sessions' },
  ]

  return (
    <div className="space-y-10 pb-16">
      <div ref={heroRef} className={`container-custom fade-in pt-4 ${heroInView ? 'in-view' : ''}`}>
        <div className="glass-panel px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex-1">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="pill bg-primary/10 text-primary">Student dashboard</div>
                  <div className="mt-3 text-2xl font-heading font-semibold leading-tight text-text sm:text-3xl">
                    Welcome back{user?.full_name ? `, ${user.full_name}` : ''}
                  </div>
                  <p className="mt-2 text-sm text-text-soft">
                    {hasEnrollments
                      ? 'Pick up where you left off — your next sessions and resources show up here.'
                      : 'You’re not enrolled yet. Start by joining your first cohort.'}
                  </p>
                </div>

                <Button asChild className="w-full sm:w-auto">
                  <Link to={primaryCta.to}>{primaryCta.label}</Link>
                </Button>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm text-text-soft">
                  <span>Overall progress</span>
                  <span className="font-semibold text-text">{summary.overallProgress}%</span>
                </div>
                <div className="h-3 w-full max-w-xl overflow-hidden rounded-full bg-primary/10">
                  <div
                    className="progress-animated h-full rounded-full bg-primary"
                    style={{ width: `${summary.overallProgress}%` }}
                  />
                </div>
                {!hasEnrollments ? (
                  <p className="text-xs text-text-muted">Progress starts after enrolling in a course.</p>
                ) : null}
              </div>
            </div>

            <div className="flex-1">
              <div className="grid gap-4 sm:grid-cols-2">
                {upcoming.slice(0, 2).map((u) => (
                  <div key={u.id} className="rounded-[28px] border border-white/70 bg-white/80 p-3">
                    <UpcomingSessionCard title={u.title} time={u.time} course={u.course} />
                  </div>
                ))}

                {upcoming.length === 0 ? (
                  <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 sm:col-span-2">
                    <p className="text-sm font-semibold text-text">No upcoming sessions yet</p>
                    <p className="mt-1 text-sm text-text-soft">
                      Sessions appear after you enroll and an instructor schedules them.
                    </p>
                    <div className="mt-4">
                      <Button asChild variant="outline" size="sm">
                        <Link to={hasEnrollments ? '/dashboard/courses' : '/courses'}>
                          {hasEnrollments ? 'View my courses' : 'Browse courses'}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref={metricsRef} className={`container-custom fade-in ${metricsInView ? 'in-view' : ''}`}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            to="/dashboard/courses"
            className="group block rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <AnimatedMetricCard
              title="Courses"
              value={summary.totalEnrolled}
              accent="from-primary to-indigo-500"
              className="transition-transform group-hover:-translate-y-0.5 group-hover:shadow-shell"
              description={
                summary.totalEnrolled === 0 ? (
                  'No courses yet — start by browsing the catalog.'
                ) : (
                  'See what you’re enrolled in.'
                )
              }
            />
          </Link>

          <Link
            to="/dashboard/certificates"
            className="group block rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <AnimatedMetricCard
              title="Certificates"
              value={summary.totalCompleted}
              accent="from-emerald-400 to-primary"
              className="transition-transform group-hover:-translate-y-0.5 group-hover:shadow-shell"
              description={
                summary.totalCompleted === 0
                  ? 'Complete a course to earn your first certificate.'
                  : 'View and download your certificates.'
              }
            />
          </Link>

          <Link
            to="/dashboard/courses"
            className="group block rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <AnimatedMetricCard
              title="Progress %"
              value={`${summary.overallProgress}%`}
              accent="from-amber-400 to-primary"
              className="transition-transform group-hover:-translate-y-0.5 group-hover:shadow-shell"
              description={!hasEnrollments ? 'Progress starts after enrolling.' : 'Keep going — every lesson counts.'}
            />
          </Link>
        </div>

        <div className="mt-8 space-y-6">
          <div className="glass-panel px-6 py-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Resources & Sessions</h3>
                <p className="text-sm text-slate-500">Switch tabs to jump between highlights.</p>
              </div>
              <div className="pill bg-white/40 text-text">Live cohort</div>
            </div>
            <div className="mt-4">
              <Tabs tabs={tabs} onChange={() => { /* placeholder for future view state */ }} />
            </div>
            <div className="mt-6">
              <h4 className="text-base font-semibold">Latest Resources</h4>
              <p className="text-sm text-slate-500">Auto-syncs from backend storage.</p>
              <div className="mt-3">
                {resources.length === 0 ? (
                  <div className="rounded-[20px] border border-white/70 bg-white/70 p-4">
                    <p className="text-sm font-semibold text-text">No resources yet</p>
                    <p className="mt-1 text-sm text-text-soft">
                      Resources show up after you enroll and your instructor uploads materials.
                    </p>
                    <div className="mt-4">
                      <Button asChild variant="outline" size="sm">
                        <Link to={hasEnrollments ? '/dashboard/courses' : '/courses'}>
                          {hasEnrollments ? 'Go to my courses' : 'Browse courses'}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <ResourcesTable resources={resources} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard


