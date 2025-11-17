import { useNavigate } from 'react-router-dom'
import useCourses from '@/hooks/useCourses'
import CourseForm from '@/components/instructor/CourseForm'
import { Card } from '@/components/ui/Card'

export const CourseCreate = () => {
  const navigate = useNavigate()
  const { createCourse } = useCourses()

  const handleCreate = async (values: any) => {
    // attach instructor_id on server side via row-level security or client side
    await createCourse(values)
    navigate('/instructor/courses')
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Create Course</h1>
      <CourseForm onSubmit={handleCreate} />
    </Card>
  )
}

export default CourseCreate
