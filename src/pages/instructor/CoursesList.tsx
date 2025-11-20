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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-2xl shadow-lg shadow-gray-200 p-4 transition-all duration-300 hover:scale-[1.01]">
            <CourseCard course={course} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default CoursesList
