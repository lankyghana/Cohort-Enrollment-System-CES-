// This hook needs to be rewritten for Laravel API
// Temporarily stubbed to prevent import errors
import { useState, useEffect } from 'react'
import apiClient from '@/services/apiClient'

interface Metrics {
  total_students: number;
  total_courses: number;
  total_enrollments: number;
  total_revenue: number;
}

interface TrendPoint {
  year: number;
  month_index: number;
  month: string;
  enrollments: number;
}

interface TopCourse {
  id: string;
  title: string;
  enrollment_count: number;
}

interface RecentEnrollment {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  course_id: string;
  course_title: string;
  payment_status: string;
  enrolled_at: string;
}

export const useAdminMetrics = (months = 6) => {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [trend, setTrend] = useState<TrendPoint[]>([])
  const [topCourses, setTopCourses] = useState<TopCourse[]>([])
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true)
      try {
        const response = await apiClient.get('/api/admin/metrics', {
          params: { months }
        })
        const { data } = response
        setMetrics(data.metrics)
        setTrend(data.trend)
        setTopCourses(data.top_courses)
        setRecentEnrollments(data.recent_enrollments)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch admin metrics')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [months])

  return { metrics, trend, topCourses, recentEnrollments, loading, error }
}

