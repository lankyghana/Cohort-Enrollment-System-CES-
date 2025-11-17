import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'

export const CourseCard = ({ course }: { course: any }) => {
  return (
    <Card className="hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-4">
        {course.thumbnail ? (
          <img src={course.thumbnail} className="w-24 h-16 object-cover rounded" alt={course.title} />
        ) : (
          <div className="w-24 h-16 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">No image</div>
        )}

        <div className="flex-1">
          <h3 className="font-medium">{course.title}</h3>
          <div className="text-sm text-gray-500">{course.subtitle}</div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/instructor/courses/${course.id}/edit`} className="text-primary hover:underline">Edit</Link>
        </div>
      </div>
    </Card>
  )
}

export default CourseCard
