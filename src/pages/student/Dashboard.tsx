import { Card } from '@/components/ui/Card'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export const StudentDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-2">My Courses</h2>
          <p className="text-text-light mb-4">View all your enrolled courses</p>
          <Button asChild>
            <Link to="/dashboard/courses">View Courses</Link>
          </Button>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-2">Certificates</h2>
          <p className="text-text-light mb-4">Download your certificates</p>
          <Button asChild>
            <Link to="/dashboard/certificates">View Certificates</Link>
          </Button>
        </Card>
      </div>
    </div>
  )
}

