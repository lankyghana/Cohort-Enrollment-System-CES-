import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import CourseThumbnail from '@/components/ui/CourseThumbnail'
import type { Course } from '@/types'

type InstructorCourseSummary = Pick<Course, 'id' | 'title' | 'short_description' | 'thumbnail_url'> & {
  subtitle?: string | null
  thumbnail?: string | null
}

export const CourseCard = ({ course }: { course: InstructorCourseSummary }) => {
  // course may have `thumbnail` (legacy) or `thumbnail_url` depending on flow
  const src = course.thumbnail ?? course.thumbnail_url ?? null

  return (
    <Card className="hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-4">
        <CourseThumbnail src={src} alt={course.title} />

        <div className="flex-1">
          <h3 className="font-medium">{course.title}</h3>
          <div className="text-sm text-gray-500">{course.subtitle ?? course.short_description}</div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/instructor/courses/${course.id}/edit`} className="text-primary hover:underline">Edit</Link>
        </div>
      </div>
    </Card>
  )
}

export default CourseCard

