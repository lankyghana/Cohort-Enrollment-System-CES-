import { useEffect, useState } from 'react'
// Card, Link, Button are not used in the redesigned dashboard

import { useAuthStore } from '@/store/authStore'
import AnimatedMetricCard from '@/components/ui/AnimatedMetricCard'
import Tabs from '@/components/ui/Tabs'
import UpcomingSessionCard from '@/components/ui/UpcomingSessionCard'
import ResourcesTable from '@/components/ui/ResourcesTable'
import useInView from '@/hooks/useInView'
import apiClient from '@/services/apiClient'

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
  const { user, appUser } = useAuthStore()
  const [summary, setSummary] = useState<Summary>({ totalEnrolled: 0, totalCompleted: 0, overallProgress: 0 })
  const [upcoming, setUpcoming] = useState<UpcomingSession[]>([])
  const [resources, setResources] = useState<ResourceRow[]>([])
  const { ref: heroRef, inView: heroInView } = useInView<HTMLDivElement>({ threshold: 0.1 })
  const { ref: metricsRef, inView: metricsInView } = useInView<HTMLDivElement>({ threshold: 0.2 })

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
        <div className="gradient-shell overflow-hidden px-8 py-10 text-white">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1">
              <div className="pill bg-white/20 text-white/90">Student Dashboard</div>
              <div className="mt-3 text-3xl font-bold leading-tight">
                Welcome back, {appUser?.full_name || user?.email}
              </div>
              <p className="mt-2 text-sm text-white/80">
                Track progress, upcoming live sessions, and recent resources from a single glass panel.
              </p>

              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm text-white/80">
                  <span>Overall progress</span>
                  <span>{summary.overallProgress}%</span>
                </div>
                <div className="h-3 w-full max-w-xl overflow-hidden rounded-full bg-white/25">
                  <div
                    className="progress-animated h-full rounded-full bg-white"
                    style={{ width: `${summary.overallProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="grid gap-4 sm:grid-cols-2">
                {upcoming.slice(0, 2).map((u) => (
                  <div key={u.id} className="rounded-[28px] border border-white/20 bg-white/10 p-3">
                    <UpcomingSessionCard title={u.title} time={u.time} course={u.course} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref={metricsRef} className={`container-custom fade-in ${metricsInView ? 'in-view' : ''}`}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AnimatedMetricCard title="Courses" value={summary.totalEnrolled} accent="from-primary to-indigo-500" />
          <AnimatedMetricCard title="Certificates" value={summary.totalCompleted} accent="from-emerald-400 to-primary" />
          <AnimatedMetricCard title="Progress %" value={`${summary.overallProgress}%`} accent="from-amber-400 to-primary" />
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
                <ResourcesTable resources={resources} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard


