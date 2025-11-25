import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import apiClient from '@/services/apiClient'

type Module = { id: string; title: string; description?: string | null; order_index: number }
type Course = { id: string; title: string; description?: string | null }
type Enrollment = { progress_percentage?: number }
type CourseDashboardData = {
  course: Course
  modules: Module[]
  enrollment: Enrollment
}

export const CourseDashboard = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id || !user) return

    const fetch = async () => {
      setLoading(true)
      try {
        const response = await apiClient.get<CourseDashboardData>(`/api/student/courses/${id}/dashboard`)
        const { course, modules, enrollment } = response.data
        setCourse(course)
        setModules(modules)
        setEnrollment(enrollment)
      } catch (err) {
        // noop — keep UI simple
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [id, user])

  if (loading) return <div>Loading...</div>

  if (!course) return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Course Dashboard</h1>
      <p className="text-text-light">Course not found or you are not enrolled.</p>
    </div>
  )

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">{course.title}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <p className="text-text-light mb-4">{course.description}</p>

            {modules.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Curriculum</h2>
                <div className="space-y-2">
                  {modules.map((m) => (
                    <div key={m.id} className="p-3 border rounded">
                      <h3 className="font-medium">{m.title}</h3>
                      {m.description && <p className="text-text-light text-sm">{m.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card>
            <div className="mb-4">
              <div className="text-sm text-text-light">Progress</div>
              <div className="text-2xl font-bold">{enrollment?.progress_percentage ?? 0}%</div>
            </div>
            <div className="space-y-2">
              <Button asChild>
                <Link to={`/dashboard/courses/${id}/resources`}>Resources</Link>
              </Button>
              <Button asChild>
                <Link to={`/dashboard/courses/${id}/session`}>Live Sessions</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}


