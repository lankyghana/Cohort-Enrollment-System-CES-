import { useAdminMetrics } from '@/hooks/useAdminMetrics'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Calendar, Download, TrendingUp } from 'lucide-react'

export const AdminDashboard = () => {
  const { metrics, trend, topCourses, recentEnrollments, loading, error } = useAdminMetrics(6)

  const maxEnroll = trend.length ? Math.max(...trend.map((p) => p.enrollments)) : 0

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Overview</p>
          <h1 className="mt-2 text-3xl font-heading font-semibold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-text-light">Real-time snapshot of cohort enrollment, performance, and revenue.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" className="gap-2 text-primary">
            <Calendar size={16} />
            Last 6 months
          </Button>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export data
          </Button>
        </div>
      </div>

      {loading && <p>Loading metrics…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {metrics && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[{
            label: 'Total students',
            value: metrics.total_students,
            sub: '+18% vs last cohort',
          }, {
            label: 'Published courses',
            value: metrics.total_courses,
            sub: 'Classroom + async',
          }, {
            label: 'Active enrollments',
            value: metrics.total_enrollments,
            sub: 'Paid & in-progress',
          }, {
            label: 'Total revenue',
            value: `₦${Number(metrics.total_revenue).toFixed(2)}`,
            sub: 'Cleared payments',
          }].map((metric) => (
            <Card key={metric.label} className="metric-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-text-light">{metric.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{metric.value}</p>
                </div>
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-3 text-xs text-text-light">{metric.sub}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Enrollments (last 6 months)</h2>
            <span className="pill">Live sync</span>
          </div>
          {trend.length === 0 && <div className="text-gray-500">No enrollment data</div>}
          {trend.length > 0 && (
            <div className="flex items-end gap-2 h-40">
              {trend.map((p) => {
                const height = maxEnroll > 0 ? (p.enrollments / maxEnroll) * 100 : 0
                return (
                  <div key={`${p.year}-${p.month_index}`} className="flex-1 text-center">
                    <div
                      style={{ height: `${height}%` }}
                      className="mx-auto w-8 rounded-t-2xl bg-gradient-to-t from-primary to-primary-light shadow-md"
                    />
                    <div className="text-xs mt-2">{p.month}</div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Top Courses</h2>
          {topCourses.length === 0 && <div className="text-gray-500">No course data</div>}
          {topCourses.length > 0 && (
            <ol className="mt-4 space-y-3">
              {topCourses.map((c, i) => (
                <li key={c.id} className="flex items-center justify-between rounded-2xl bg-slate-50/80 px-3 py-2 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="pill bg-white/80 text-primary">{i + 1}</span>
                    <span className="font-medium text-slate-900">{c.title}</span>
                  </div>
                  <div className="text-xs text-text-light">{c.enrollment_count} enrollments</div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Enrollments</h2>
          <Button variant="ghost" size="sm" className="text-primary">View all</Button>
        </div>
        {recentEnrollments.length === 0 && <div className="text-gray-500">No recent enrollments</div>}
        {recentEnrollments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-text-light">
                  <th className="p-2 font-semibold">Student</th>
                  <th className="p-2 font-semibold">Course</th>
                  <th className="p-2 font-semibold">Status</th>
                  <th className="p-2 font-semibold">Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {recentEnrollments.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 text-sm">
                    <td className="p-2 font-medium text-slate-900">{r.student_name || r.student_email || r.student_id}</td>
                    <td className="p-2 text-text-light">{r.course_title || r.course_id}</td>
                    <td className="p-2">
                      <span className="pill bg-emerald-50 text-emerald-600">{r.payment_status}</span>
                    </td>
                    <td className="p-2 text-xs text-text-light">{new Date(r.enrolled_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

