import { useAdminMetrics } from '@/hooks/useAdminMetrics'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Link } from 'react-router-dom'

export const InstructorDashboard = () => {
  const { metrics, loading, error } = useAdminMetrics(6)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Instructor Dashboard</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <Link to="/instructor/courses"><Button variant="ghost">Manage Courses</Button></Link>
          <Link to="/instructor/courses/create"><Button>Create Course</Button></Link>
          <Link to="/instructor/assignments"><Button variant="ghost">Assignments</Button></Link>
          <Link to="/instructor/assignments/new"><Button>Create Assignment</Button></Link>
        </div>
      </div>

      {loading && <p>Loading metrics…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-6 bg-white rounded-2xl shadow-lg shadow-gray-200 transition-all duration-300 hover:shadow-2xl">
            <div className="text-sm text-gray-500">Total Courses</div>
            <div className="text-2xl font-bold">{metrics.total_courses}</div>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-lg shadow-gray-200 transition-all duration-300 hover:shadow-2xl">
            <div className="text-sm text-gray-500">Total Students</div>
            <div className="text-2xl font-bold">{metrics.total_students}</div>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-lg shadow-gray-200 transition-all duration-300 hover:shadow-2xl">
            <div className="text-sm text-gray-500">Upcoming Sessions</div>
            <div className="text-2xl font-bold">{metrics.upcoming_sessions ?? 0}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 col-span-2">
          <h2 className="text-lg font-semibold mb-3">Course performance</h2>
          <p className="text-gray-500">See enrollments and completion rates on each course page.</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-3">Assignments workspace</h2>
          <p className="text-gray-500 text-sm mb-4">
            Create homework, share instructions, review submissions, and grade learners from a single view.
          </p>
          <div className="flex gap-3">
            <Link to="/instructor/assignments"><Button variant="ghost">Manage assignments</Button></Link>
            <Link to="/instructor/assignments/new"><Button>Create assignment</Button></Link>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-3">Quick actions</h2>
          <ul className="space-y-3 text-sm text-gray-600">
            <li>Create courses, manage cohorts and schedule sessions.</li>
            <li>Upload resources, build curriculum, and share assignments.</li>
            <li>Grade assignments and issue certificates.</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

export default InstructorDashboard

