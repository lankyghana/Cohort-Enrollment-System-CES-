import { useAdminMetrics } from '@/hooks/useAdminMetrics'

export const AdminDashboard = () => {
  const { metrics, trend, topCourses, recentEnrollments, loading, error } = useAdminMetrics(6)

  const maxEnroll = trend.length ? Math.max(...trend.map((p) => p.enrollments)) : 0

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Admin Dashboard</h1>

      {loading && <p>Loading metrics…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white rounded-md shadow">
            <div className="text-sm text-gray-500">Total students</div>
            <div className="text-2xl font-bold">{metrics.total_students}</div>
          </div>
          <div className="p-4 bg-white rounded-md shadow">
            <div className="text-sm text-gray-500">Published courses</div>
            <div className="text-2xl font-bold">{metrics.total_courses}</div>
          </div>
          <div className="p-4 bg-white rounded-md shadow">
            <div className="text-sm text-gray-500">Active enrollments</div>
            <div className="text-2xl font-bold">{metrics.total_enrollments}</div>
          </div>
          <div className="p-4 bg-white rounded-md shadow">
            <div className="text-sm text-gray-500">Total revenue</div>
            <div className="text-2xl font-bold">₦{Number(metrics.total_revenue).toFixed(2)}</div>
          </div>
          <div className="p-4 bg-white rounded-md shadow">
            <div className="text-sm text-gray-500">Courses accepting students</div>
            <div className="text-2xl font-bold">{metrics.active_courses}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-md shadow col-span-2">
          <h2 className="text-lg font-semibold mb-3">Enrollments (last 6 months)</h2>
          {trend.length === 0 && <div className="text-gray-500">No enrollment data</div>}
          {trend.length > 0 && (
            <div className="flex items-end gap-2 h-40">
              {trend.map((p) => {
                const height = maxEnroll > 0 ? (p.enrollments / maxEnroll) * 100 : 0
                return (
                  <div key={`${p.year}-${p.month_index}`} className="flex-1 text-center">
                    <div
                      style={{ height: `${height}%` }}
                      className="bg-indigo-500 rounded-t-md transition-all"
                    />
                    <div className="text-xs mt-2">{p.month}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="p-4 bg-white rounded-md shadow">
          <h2 className="text-lg font-semibold mb-3">Top Courses</h2>
          {topCourses.length === 0 && <div className="text-gray-500">No course data</div>}
          {topCourses.length > 0 && (
            <ol className="space-y-2">
              {topCourses.map((c, i) => (
                <li key={c.id} className="flex items-center justify-between">
                  <div className="text-sm">{i + 1}. {c.title}</div>
                  <div className="text-xs text-gray-500">{c.enrollment_count} enrollments</div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="mt-4 p-4 bg-white rounded-md shadow">
        <h2 className="text-lg font-semibold mb-3">Recent Enrollments</h2>
        {recentEnrollments.length === 0 && <div className="text-gray-500">No recent enrollments</div>}
        {recentEnrollments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-gray-500">
                  <th className="p-2">Student</th>
                  <th className="p-2">Course</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {recentEnrollments.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-2">{r.student_name || r.student_email || r.student_id}</td>
                    <td className="p-2">{r.course_title || r.course_id}</td>
                    <td className="p-2 text-xs text-gray-600">{r.payment_status}</td>
                    <td className="p-2 text-xs text-gray-600">{new Date(r.enrolled_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

