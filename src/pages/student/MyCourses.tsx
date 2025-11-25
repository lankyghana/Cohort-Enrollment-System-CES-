import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import apiClient from '@/services/apiClient'


type CourseSummary = {
  id: string
  title: string
  short_description?: string | null
  enrollment_id: string
  progress_percentage?: number
}

export const MyCourses = () => {
  const { user } = useAuthStore()
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchMyCourses = async () => {
      setLoading(true)
      try {
        const response = await apiClient.get<CourseSummary[]>('/api/student/courses')
        setCourses(response.data)
      } catch (err) {
        setCourses([])
      } finally {
        setLoading(false)
      }
    }

    fetchMyCourses()
  }, [user])

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">My Courses</h1>
      {loading && <p>Loading...</p>}
      {!loading && courses.length === 0 && (
        <p className="text-text-light">You are not enrolled in any courses yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {courses.map((c) => (
          <Card key={c.enrollment_id}>
            <h3 className="text-lg font-semibold">{c.title}</h3>
            {c.short_description && <p className="text-text-light text-sm">{c.short_description}</p>}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-text-light">Progress: {c.progress_percentage}%</div>
              <Button asChild>
                <Link to={`/dashboard/courses/${c.id}`}>Open</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}


