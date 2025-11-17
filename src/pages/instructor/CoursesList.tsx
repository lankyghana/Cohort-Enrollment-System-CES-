import { Link } from 'react-router-dom'
import useCourses from '@/hooks/useCourses'
import CourseCard from '@/components/instructor/CourseCard'
import { Button } from '@/components/ui/Button'

export const CoursesList = () => {
  const { courses, loading } = useCourses()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Your Courses</h1>
        <Link to="/instructor/courses/create"><Button>Create New Course</Button></Link>
      </div>

      {loading && <div>Loading…</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((c: any) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>
    </div>
  )
}

export default CoursesList
