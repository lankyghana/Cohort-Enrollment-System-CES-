import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import InstructorService from '@/services/instructor'
import CourseForm from '@/components/instructor/CourseForm'
import { Card } from '@/components/ui/Card'

export const CourseEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState<any | null>(null)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      const { data, error } = await InstructorService.getCourseById(id)
      if (!error) setCourse(data)
    }
    load()
  }, [id])

  const handleUpdate = async (values: any) => {
    await InstructorService.updateCourse(id as string, values)
    navigate('/instructor/courses')
  }

  if (!course) return <div>Loading…</div>

  return (
    <Card className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Edit Course</h1>
      <CourseForm initial={course} onSubmit={handleUpdate} />
    </Card>
  )
}

export default CourseEdit
