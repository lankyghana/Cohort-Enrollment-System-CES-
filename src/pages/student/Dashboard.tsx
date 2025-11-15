import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/store/authStore'

type Summary = {
  totalEnrolled: number
  totalCompleted: number
}

export const StudentDashboard = () => {
  const { user } = useAuthStore()
  const [summary, setSummary] = useState<Summary>({ totalEnrolled: 0, totalCompleted: 0 })

  useEffect(() => {
    if (!user) return

    const fetchSummary = async () => {
      try {
        // Count enrollments for current user
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('id, progress_percentage, completed_at')
          .eq('student_id', user.id)

        const enrollmentList = (enrollments || []) as Array<{ id: string; completed_at?: string | null }>
        const totalEnrolled = enrollmentList.length
        const totalCompleted = enrollmentList.filter((e) => !!e.completed_at).length

        setSummary({ totalEnrolled, totalCompleted })
      } catch (err) {
        // keep UI resilient — we'll simply show zeroes on error
        setSummary({ totalEnrolled: 0, totalCompleted: 0 })
      }
    }

    fetchSummary()
  }, [user])

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-2">My Courses</h2>
          <p className="text-text-light mb-4">You are enrolled in {summary.totalEnrolled} courses</p>
          <Button asChild>
            <Link to="/dashboard/courses">View Courses</Link>
          </Button>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-2">Progress</h2>
          <p className="text-text-light mb-4">{summary.totalCompleted} course(s) completed</p>
          <Button asChild>
            <Link to="/dashboard/courses">View Progress</Link>
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

