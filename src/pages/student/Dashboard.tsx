import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import { Link } from 'react-router-dom'

import { useAuthStore } from '@/store/authStore'
import Tabs from '@/components/ui/Tabs'
import UpcomingSessionCard from '@/components/ui/UpcomingSessionCard'
import ResourcesTable from '@/components/ui/ResourcesTable'
import useInView from '@/hooks/useInView'
import apiClient from '@/services/apiClient'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Award, BookOpen, TrendingUp } from 'lucide-react'

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
  course_title?: string;
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
type UpcomingSession = { id: string; title: string; time: string; course: string; courseId: string; scheduledAt: string }

export const StudentDashboard = () => {
  const { user } = useAuthStore()
  const [summary, setSummary] = useState<Summary>({ totalEnrolled: 0, totalCompleted: 0, overallProgress: 0 })
  const [upcoming, setUpcoming] = useState<UpcomingSession[]>([])
  const [resources, setResources] = useState<ResourceRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'sessions'>('overview')
  const tabsRef = useRef<HTMLDivElement | null>(null)
  const [firstCourseId, setFirstCourseId] = useState<string | null>(null)
  const { ref: heroRef, inView: heroInView } = useInView<HTMLDivElement>({ threshold: 0.1 })
  const { ref: metricsRef, inView: metricsInView } = useInView<HTMLDivElement>({ threshold: 0.2 })

  const hasEnrollments = summary.totalEnrolled > 0

  const firstName = useMemo(() => {
    const raw = user?.full_name
    if (!raw) return null
    const first = raw.trim().split(/\s+/)[0]
    return first || null
  }, [user?.full_name])

  const hasResources = resources.length > 0
  const hasSessions = upcoming.length > 0

  const todaySession = useMemo(() => {
    const today = new Date().toDateString()
    return (
      upcoming.find((s) => {
        const d = new Date(s.scheduledAt)
        return !Number.isNaN(d.getTime()) && d.toDateString() === today
      }) ?? null
    )
  }, [upcoming])

  const mobilePrimaryAction = useMemo(() => {
    if (!hasEnrollments) {
      return { kind: 'link' as const, label: 'Choose a program', to: '/courses' }
    }

    if (todaySession) {
      return {
        kind: 'link' as const,
        label: 'Go to today’s session',
        to: `/dashboard/courses/${todaySession.courseId}/session/${todaySession.id}`,
      }
    }

    if (hasResources) {
      return { kind: 'button' as const, label: 'View resources', tab: 'resources' as const }
    }

    if (hasSessions) {
      return { kind: 'button' as const, label: 'View sessions', tab: 'sessions' as const }
    }

    return {
      kind: 'link' as const,
      label: 'View my course',
      to: firstCourseId ? `/dashboard/courses/${firstCourseId}` : '/dashboard/courses',
    }
  }, [firstCourseId, hasEnrollments, hasResources, hasSessions, todaySession])

  const desktopPrimaryCta = useMemo(() => {
    if (hasEnrollments) return { label: 'View my courses', to: '/dashboard/courses' }
    return { label: 'Browse courses', to: '/courses' }
  }, [hasEnrollments])

  useEffect(() => {
    if (!user) return

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const { data } = await apiClient.get('/api/student/dashboard')
        
        const { enrollments, sessions, resources } = data

        const list = (enrollments || []) as EnrollmentRow[]
        const totalEnrolled = list.length
        const totalCompleted = list.filter((e) => !!e.completed_at).length
        const overallProgress = list.length ? Math.round(list.reduce((s, e) => s + (e.progress_percentage || 0), 0) / list.length) : 0

        setSummary({ totalEnrolled, totalCompleted, overallProgress })
        setFirstCourseId(list[0]?.course_id ?? null)

        const upcomingList = (sessions || []).map((s: CourseSessionRow) => ({
          id: s.id,
          title: s.title,
          time: new Date(s.scheduled_at).toLocaleString(),
          course: (s.course_title && String(s.course_title).trim()) ? String(s.course_title) : s.course_id,
          courseId: s.course_id,
          scheduledAt: s.scheduled_at,
        }))
        setUpcoming(upcomingList)

        setResources(resources || [])
      } catch (err) {
        // swallow — keep UI friendly
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'resources', label: 'Resources' },
    { key: 'sessions', label: 'Sessions' },
  ]

  const handleViewSessions = () => {
    if (!upcoming.length) return
    setActiveTab('sessions')
    tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleMobilePrimary = () => {
    if (mobilePrimaryAction.kind !== 'button') return
    setActiveTab(mobilePrimaryAction.tab)
    tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const StatCard = ({
    icon: Icon,
    value,
    label,
    description,
    to,
  }: {
    icon: ComponentType<{ className?: string }>
    value: React.ReactNode
    label: string
    description?: string
    to: string
  }) => (
    <Link
      to={to}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Card className="h-full" variant="default" padding="md">
        <div className="flex h-full flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">{label}</p>
              <div className="mt-2 text-3xl font-bold text-text">{value}</div>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          {description ? <p className="text-sm text-text-soft">{description}</p> : <span className="sr-only">&nbsp;</span>}
        </div>
      </Card>
    </Link>
  )

  return (
    <div className="pb-2">
      {/* Mobile-first dashboard (mobile only) */}
      <div className="lg:hidden">
        <div className="container-custom space-y-4">
          <Card variant="default" padding="md">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Status</p>
                <h1 className="mt-2 text-xl font-heading font-semibold text-text">
                  Welcome back{firstName ? `, ${firstName}` : ''}
                </h1>
                <p className="mt-1 text-sm text-text-soft">
                  {isLoading ? (
                    <span className="inline-block h-4 w-40 animate-pulse rounded bg-slate-200/70" aria-hidden="true" />
                  ) : hasEnrollments ? (
                    `Enrolled in ${summary.totalEnrolled} course${summary.totalEnrolled === 1 ? '' : 's'}`
                  ) : (
                    'No active enrollment'
                  )}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm text-text-soft">
                  <span>Overall progress</span>
                  {isLoading ? (
                    <span className="inline-block h-5 w-12 animate-pulse rounded bg-slate-200/70" aria-hidden="true" />
                  ) : (
                    <span className="font-semibold text-text">{summary.overallProgress}%</span>
                  )}
                </div>
                <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-primary/10">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${summary.overallProgress}%` }} aria-hidden="true" />
                </div>
                {!hasEnrollments ? (
                  <p className="mt-2 text-xs text-text-muted">Progress starts after enrolling in a course.</p>
                ) : null}
              </div>
            </div>
          </Card>

          <div ref={tabsRef}>
            <Card variant="default" padding="md">
              <h2 className="text-base font-semibold text-text">Resources & sessions</h2>
              <p className="mt-1 text-sm text-text-soft">Check what’s available and jump to your next task.</p>

              <div className="mt-4">
                <Tabs
                  id="student-dashboard-mobile"
                  ariaLabel="Dashboard sections"
                  tabs={tabs}
                  value={activeTab}
                  onChange={(k) => setActiveTab(k as typeof activeTab)}
                />
              </div>

              <div className="mt-4">
                {activeTab === 'overview' ? (
                  <div
                    id="student-dashboard-mobile-panel-overview"
                    role="tabpanel"
                    aria-labelledby="student-dashboard-mobile-tab-overview"
                    tabIndex={0}
                    className="space-y-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-text">Next session</p>
                      <p className="mt-1 text-sm text-text-soft">
                        Sessions appear after enrollment and when your instructor schedules them.
                      </p>
                      <div className="mt-3">
                        {isLoading ? (
                          <div className="h-24 animate-pulse rounded-[20px] border border-white/70 bg-white/70" />
                        ) : upcoming.length ? (
                          <div className="rounded-[20px] border border-white/70 bg-white/80 p-3">
                            <UpcomingSessionCard title={upcoming[0]!.title} time={upcoming[0]!.time} course={upcoming[0]!.course} />
                          </div>
                        ) : (
                          <div className="rounded-[20px] border border-white/70 bg-white/70 p-4">
                            <p className="text-sm font-semibold text-text">No sessions yet</p>
                            <p className="mt-1 text-sm text-text-soft">
                              No problem — this updates automatically when sessions are scheduled.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-text">Recent resources</p>
                      <p className="mt-1 text-sm text-text-soft">Resources will appear once your instructor uploads materials.</p>
                      <div className="mt-3">
                        {isLoading ? (
                          <div className="h-28 animate-pulse rounded-[20px] border border-white/70 bg-white/70" />
                        ) : resources.length ? (
                          <ResourcesTable resources={resources.slice(0, 5)} />
                        ) : (
                          <div className="rounded-[20px] border border-white/70 bg-white/70 p-4">
                            <p className="text-sm font-semibold text-text">No resources yet</p>
                            <p className="mt-1 text-sm text-text-soft">Once materials are uploaded, you’ll find them here.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                {activeTab === 'sessions' ? (
                  <div
                    id="student-dashboard-mobile-panel-sessions"
                    role="tabpanel"
                    aria-labelledby="student-dashboard-mobile-tab-sessions"
                    tabIndex={0}
                  >
                    <p className="text-sm font-semibold text-text">Sessions</p>
                    <p className="mt-1 text-sm text-text-soft">Your scheduled live sessions will appear here.</p>
                    <div className="mt-3">
                      {isLoading ? (
                        <div className="space-y-3">
                          <div className="h-24 animate-pulse rounded-[20px] border border-white/70 bg-white/70" />
                          <div className="h-24 animate-pulse rounded-[20px] border border-white/70 bg-white/70" />
                        </div>
                      ) : upcoming.length === 0 ? (
                        <div className="rounded-[20px] border border-white/70 bg-white/70 p-4">
                          <p className="text-sm font-semibold text-text">No sessions yet</p>
                          <p className="mt-1 text-sm text-text-soft">
                            Sessions appear after enrollment and when your instructor schedules them.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {upcoming.map((u) => (
                            <div key={u.id} className="rounded-[20px] border border-white/70 bg-white/80 p-3">
                              <UpcomingSessionCard title={u.title} time={u.time} course={u.course} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {activeTab === 'resources' ? (
                  <div
                    id="student-dashboard-mobile-panel-resources"
                    role="tabpanel"
                    aria-labelledby="student-dashboard-mobile-tab-resources"
                    tabIndex={0}
                  >
                    <p className="text-sm font-semibold text-text">Resources</p>
                    <p className="mt-1 text-sm text-text-soft">Download course materials and references shared by your instructor.</p>
                    <div className="mt-3">
                      {isLoading ? (
                        <div className="h-40 animate-pulse rounded-[20px] border border-white/70 bg-white/70" />
                      ) : resources.length === 0 ? (
                        <div className="rounded-[20px] border border-white/70 bg-white/70 p-4">
                          <p className="text-sm font-semibold text-text">No resources yet</p>
                          <p className="mt-1 text-sm text-text-soft">
                            Resources will appear once your instructor uploads materials.
                          </p>
                        </div>
                      ) : (
                        <ResourcesTable resources={resources} />
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </Card>
          </div>

          <Card variant="outlined" padding="md">
            <h2 className="text-base font-semibold text-text">Progress & stats</h2>
            <p className="mt-1 text-sm text-text-soft">A quick snapshot of your learning.</p>
            <div className="mt-4 flex flex-col gap-3">
              <StatCard
                icon={BookOpen}
                label="Courses enrolled"
                value={
                  isLoading ? <span className="inline-block h-8 w-12 animate-pulse rounded bg-slate-200/70" aria-hidden="true" /> : summary.totalEnrolled
                }
                to="/dashboard/courses"
              />
              <StatCard
                icon={Award}
                label="Certificates earned"
                value={
                  isLoading ? <span className="inline-block h-8 w-12 animate-pulse rounded bg-slate-200/70" aria-hidden="true" /> : summary.totalCompleted
                }
                to="/dashboard/certificates"
              />
              <StatCard
                icon={TrendingUp}
                label="Progress %"
                value={
                  isLoading ? <span className="inline-block h-8 w-16 animate-pulse rounded bg-slate-200/70" aria-hidden="true" /> : `${summary.overallProgress}%`
                }
                to="/dashboard/courses"
              />
            </div>
          </Card>
        </div>

        {/* Sticky primary action (single CTA) */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/70 bg-white/95 px-4 py-3 backdrop-blur">
          {mobilePrimaryAction.kind === 'link' ? (
            <Button asChild className="w-full">
              <Link to={mobilePrimaryAction.to}>{mobilePrimaryAction.label}</Link>
            </Button>
          ) : (
            <Button type="button" className="w-full" onClick={handleMobilePrimary}>
              {mobilePrimaryAction.label}
            </Button>
          )}
        </div>
      </div>

      {/* Desktop dashboard (existing, lg+) */}
      <div className="hidden lg:block">
        <div className="space-y-10 pb-16">
          <div ref={heroRef} className={`container-custom fade-in pt-2 ${heroInView ? 'in-view' : ''}`}>
            <Card padding="none" variant="default">
              <div className="px-6 py-6 sm:px-8 sm:py-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-2xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">Dashboard</p>
                      <h1 className="mt-3 text-3xl font-heading font-semibold leading-tight text-text">
                        Welcome back{user?.full_name ? `, ${user.full_name}` : ''}
                      </h1>
                      <p className="mt-2 text-sm text-text-soft">
                        {hasEnrollments
                          ? 'Updates appear here as you learn: your overall progress, upcoming sessions, and new resources.'
                          : 'You’re not enrolled yet. Once you join a cohort, this space will track your progress and show your sessions and resources.'}
                      </p>
                    </div>

                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                      <Button asChild className="w-full sm:w-auto">
                        <Link to={desktopPrimaryCta.to}>{hasEnrollments ? 'Continue learning' : desktopPrimaryCta.label}</Link>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={handleViewSessions}
                        disabled={!upcoming.length}
                      >
                        View sessions
                      </Button>
                    </div>
                  </div>

                  <div className="max-w-2xl">
                    <div className="flex items-center justify-between text-sm text-text-soft">
                      <span>Overall progress</span>
                      {isLoading ? (
                        <span className="inline-block h-5 w-12 animate-pulse rounded bg-slate-200/70" aria-hidden="true" />
                      ) : (
                        <span className="font-semibold text-text">{summary.overallProgress}%</span>
                      )}
                    </div>
                    <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-primary/10">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${summary.overallProgress}%` }} aria-hidden="true" />
                    </div>
                    {!hasEnrollments ? (
                      <p className="mt-2 text-xs text-text-muted">Progress starts after enrolling in a course.</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div ref={metricsRef} className={`container-custom fade-in ${metricsInView ? 'in-view' : ''}`}>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <StatCard
                icon={BookOpen}
                label="Courses"
                value={
                  isLoading ? <span className="inline-block h-8 w-12 animate-pulse rounded bg-slate-200/70" aria-hidden="true" /> : summary.totalEnrolled
                }
                description={
                  summary.totalEnrolled === 0
                    ? 'No courses yet — start by browsing the catalog.'
                    : 'Review your enrolled courses and continue learning.'
                }
                to="/dashboard/courses"
              />
              <StatCard
                icon={Award}
                label="Certificates"
                value={
                  isLoading ? <span className="inline-block h-8 w-12 animate-pulse rounded bg-slate-200/70" aria-hidden="true" /> : summary.totalCompleted
                }
                description={
                  summary.totalCompleted === 0
                    ? 'Complete a course to earn your first certificate.'
                    : 'View and download your certificates.'
                }
                to="/dashboard/certificates"
              />
              <StatCard
                icon={TrendingUp}
                label="Progress"
                value={
                  isLoading ? <span className="inline-block h-8 w-16 animate-pulse rounded bg-slate-200/70" aria-hidden="true" /> : `${summary.overallProgress}%`
                }
                description={!hasEnrollments ? 'Progress starts after enrolling.' : 'Keep going — every lesson counts.'}
                to="/dashboard/courses"
              />
            </div>

            <div ref={tabsRef} className="mt-8">
              <Card variant="default" padding="lg">
                <div>
                  <h2 className="text-xl font-semibold text-text">Resources & Sessions</h2>
                  <p className="mt-1 text-sm text-text-soft">Use tabs to focus on what you need right now.</p>
                </div>

                <div className="mt-5">
                  <Tabs
                    id="student-dashboard"
                    ariaLabel="Resources and sessions"
                    tabs={tabs}
                    value={activeTab}
                    onChange={(k) => setActiveTab(k as typeof activeTab)}
                  />
                </div>

                <div className="mt-6">
                  {activeTab === 'overview' ? (
                    <div
                      id="student-dashboard-panel-overview"
                      role="tabpanel"
                      aria-labelledby="student-dashboard-tab-overview"
                      tabIndex={0}
                      className="grid gap-4 lg:grid-cols-2"
                    >
                      <div>
                        <h3 className="text-base font-semibold text-text">Next session</h3>
                        <p className="mt-1 text-sm text-text-soft">Sessions appear after enrollment and when your instructor schedules them.</p>
                        <div className="mt-3">
                          {isLoading ? (
                            <div className="h-24 animate-pulse rounded-[20px] border border-white/70 bg-white/70" />
                          ) : upcoming.length ? (
                            <div className="rounded-[20px] border border-white/70 bg-white/80 p-3">
                              <UpcomingSessionCard title={upcoming[0]!.title} time={upcoming[0]!.time} course={upcoming[0]!.course} />
                            </div>
                          ) : (
                            <div className="rounded-[20px] border border-white/70 bg-white/70 p-4">
                              <p className="text-sm font-semibold text-text">No sessions yet</p>
                              <p className="mt-1 text-sm text-text-soft">No problem — this will update automatically once sessions are scheduled.</p>
                              <div className="mt-4">
                                <Button asChild variant="outline" size="sm">
                                  <Link to={hasEnrollments ? '/dashboard/courses' : '/courses'}>
                                    {hasEnrollments ? 'View my courses' : 'Browse courses'}
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-semibold text-text">Recent resources</h3>
                        <p className="mt-1 text-sm text-text-soft">Resources show up after you enroll and your instructor uploads materials.</p>
                        <div className="mt-3">
                          {isLoading ? (
                            <div className="h-32 animate-pulse rounded-[20px] border border-white/70 bg-white/70" />
                          ) : resources.length ? (
                            <ResourcesTable resources={resources.slice(0, 5)} />
                          ) : (
                            <div className="rounded-[20px] border border-white/70 bg-white/70 p-4">
                              <p className="text-sm font-semibold text-text">No resources yet</p>
                              <p className="mt-1 text-sm text-text-soft">Once materials are uploaded, you’ll find them here.</p>
                              <div className="mt-4">
                                <Button asChild variant="outline" size="sm">
                                  <Link to={hasEnrollments ? '/dashboard/courses' : '/courses'}>
                                    {hasEnrollments ? 'Go to my courses' : 'Browse courses'}
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {activeTab === 'resources' ? (
                    <div
                      id="student-dashboard-panel-resources"
                      role="tabpanel"
                      aria-labelledby="student-dashboard-tab-resources"
                      tabIndex={0}
                    >
                      <h3 className="text-base font-semibold text-text">Resources</h3>
                      <p className="mt-1 text-sm text-text-soft">Download course materials and references shared by your instructor.</p>
                      <div className="mt-3">
                        {isLoading ? (
                          <div className="h-40 animate-pulse rounded-[20px] border border-white/70 bg-white/70" />
                        ) : resources.length === 0 ? (
                          <div className="rounded-[20px] border border-white/70 bg-white/70 p-4">
                            <p className="text-sm font-semibold text-text">No resources yet</p>
                            <p className="mt-1 text-sm text-text-soft">
                              Resources appear after enrollment and when your instructor uploads materials.
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
                  ) : null}

                  {activeTab === 'sessions' ? (
                    <div
                      id="student-dashboard-panel-sessions"
                      role="tabpanel"
                      aria-labelledby="student-dashboard-tab-sessions"
                      tabIndex={0}
                    >
                      <h3 className="text-base font-semibold text-text">Sessions</h3>
                      <p className="mt-1 text-sm text-text-soft">Your scheduled live sessions will appear here.</p>
                      <div className="mt-3">
                        {isLoading ? (
                          <div className="grid gap-3 lg:grid-cols-2">
                            <div className="h-24 animate-pulse rounded-[20px] border border-white/70 bg-white/70" />
                            <div className="h-24 animate-pulse rounded-[20px] border border-white/70 bg-white/70" />
                          </div>
                        ) : upcoming.length === 0 ? (
                          <div className="rounded-[20px] border border-white/70 bg-white/70 p-4">
                            <p className="text-sm font-semibold text-text">No sessions yet</p>
                            <p className="mt-1 text-sm text-text-soft">
                              Sessions appear after enrollment and when your instructor schedules them.
                            </p>
                            <div className="mt-4">
                              <Button asChild variant="outline" size="sm">
                                <Link to={hasEnrollments ? '/dashboard/courses' : '/courses'}>
                                  {hasEnrollments ? 'View my courses' : 'Browse courses'}
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid gap-3 lg:grid-cols-2">
                            {upcoming.map((u) => (
                              <div key={u.id} className="rounded-[20px] border border-white/70 bg-white/80 p-3">
                                <UpcomingSessionCard title={u.title} time={u.time} course={u.course} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard


