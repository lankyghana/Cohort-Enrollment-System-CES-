import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useCourses from '@/hooks/useCourses'
import CourseForm, { type CourseFormValues } from '@/components/instructor/CourseForm'
import { Card } from '@/components/ui/Card'

export const CourseCreate = () => {
  const navigate = useNavigate()
  const { createCourse } = useCourses()
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async (values: CourseFormValues) => {
    setError(null)
    // createCourse returns Supabase response { data, error }
    const res = await createCourse(values)
    if (res?.error) {
      setError(res.error.message || String(res.error))
      return
    }
    navigate('/instructor/courses')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Create Course</h1>
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <CourseForm onSubmit={handleCreate} />
      </Card>
    </div>
  )
}

export default CourseCreate
