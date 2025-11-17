import { useEffect, useState } from 'react'
// Card, Link, Button are not used in the redesigned dashboard
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/store/authStore'
import AnimatedMetricCard from '@/components/ui/AnimatedMetricCard'
import Tabs from '@/components/ui/Tabs'
import UpcomingSessionCard from '@/components/ui/UpcomingSessionCard'
import ResourcesTable from '@/components/ui/ResourcesTable'
import useInView from '@/hooks/useInView'

type Summary = {
  totalEnrolled: number
  totalCompleted: number
  overallProgress: number
}

export const StudentDashboard = () => {
  const { user, appUser } = useAuthStore()
  const [summary, setSummary] = useState<Summary>({ totalEnrolled: 0, totalCompleted: 0, overallProgress: 0 })
  const [upcoming, setUpcoming] = useState<Array<{ id: string; title: string; time: string; course: string }>>([])
  const [resources, setResources] = useState<Array<{ id: string; title: string; file_type: string; created_at?: string }>>([])
  const { ref: heroRef, inView: heroInView } = useInView<HTMLDivElement>({ threshold: 0.1 })
  const { ref: metricsRef, inView: metricsInView } = useInView<HTMLDivElement>({ threshold: 0.2 })

  useEffect(() => {
    if (!user) return

    const fetch = async () => {
      try {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('id, progress_percentage, completed_at, course_id')
          .eq('student_id', user.id)

        const list = (enrollments || []) as Array<any>
        const totalEnrolled = list.length
        const totalCompleted = list.filter((e) => !!e.completed_at).length
        const overallProgress = list.length ? Math.round(list.reduce((s, e) => s + (e.progress_percentage || 0), 0) / list.length) : 0

        setSummary({ totalEnrolled, totalCompleted, overallProgress })

        const { data: sessions } = await supabase
          .from('course_sessions')
          .select('id, title, scheduled_at, course_id')
          .order('scheduled_at', { ascending: true })
          .limit(4)

        const upcomingList = (sessions || []).map((s: any) => ({
          id: s.id,
          title: s.title,
          time: new Date(s.scheduled_at).toLocaleString(),
          course: s.course_id,
        }))
        setUpcoming(upcomingList)

        const { data: res } = await supabase
          .from('resources')
          .select('id, title, file_type, created_at')
          .order('created_at', { ascending: false })
          .limit(6)

        setResources(res || [])
      } catch (err) {
        // swallow — keep UI friendly
      }
    }

    fetch()
  }, [user])

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'resources', label: 'Resources' },
    { key: 'sessions', label: 'Sessions' },
  ]

  return (
    <div>
      <div ref={heroRef} className={`container-custom mb-6 fade-in ${heroInView ? 'in-view' : ''}`}>
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl p-8 relative overflow-hidden">
          <div className="flex items-center justify-between gap-6">
            <div>
              <div className="text-sm opacity-90">Welcome back,</div>
              <div className="text-3xl font-bold mt-1">{appUser?.full_name || user?.email}</div>
              <div className="mt-2 text-sm opacity-90">Overall progress: {summary.overallProgress}%</div>

              <div className="mt-4 w-full max-w-xl bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 bg-white rounded-full progress-animated`} 
                  style={{ width: `${summary.overallProgress}%` }}
                />
              </div>
            </div>

            <div className="hidden md:block relative">
              <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white opacity-10" />
              <div className="absolute -right-24 top-12 w-72">
                {upcoming.slice(0, 3).map((u) => (
                  <div key={u.id} className="mb-3">
                    <UpcomingSessionCard title={u.title} time={u.time} course={u.course} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref={metricsRef} className={`container-custom fade-in ${metricsInView ? 'in-view' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <AnimatedMetricCard title="Courses" value={summary.totalEnrolled} accent="bg-indigo-600" />
          <AnimatedMetricCard title="Certificates" value={summary.totalCompleted} accent="bg-green-600" />
          <AnimatedMetricCard title="Progress %" value={`${summary.overallProgress}%`} accent="bg-yellow-500" />
        </div>

        <div className="bg-white rounded-xl p-4 shadow">
          <Tabs tabs={tabs} onChange={(_k) => { /* could set view state */ }} />

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Resources</h3>
            <ResourcesTable resources={resources} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard

