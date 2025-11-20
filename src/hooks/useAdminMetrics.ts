/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { supabase } from '@/services/supabase'

type Metrics = {
  total_students: number
  total_courses: number
  total_enrollments: number
  total_revenue: number
  active_courses: number
  upcoming_sessions?: number | null
}

type EnrollmentPoint = {
  month: string
  year: number
  month_index: number
  enrollments: number
}

type TopCourse = {
  id: string
  title: string
  enrollment_count: number
}

type RecentEnrollment = {
  id: string
  student_id: string
  student_name?: string | null
  student_email?: string | null
  course_id: string
  course_title?: string | null
  enrolled_at: string
  payment_status: string
}
export function useAdminMetrics(months = 6) {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [trend, setTrend] = useState<EnrollmentPoint[]>([])
  const [topCourses, setTopCourses] = useState<TopCourse[]>([])
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const { data: mData, error: mErr } = await (supabase as any).rpc('admin_get_metrics')
        if (mErr) throw mErr
        // mData may be an array or single row depending on client
        const m = Array.isArray(mData) ? mData[0] : mData
        if (mounted) setMetrics(m || null)

        const { data: tData, error: tErr } = await (supabase as any).rpc('admin_enrollments_by_month', { p_months: months })
        if (tErr) throw tErr
        const points: EnrollmentPoint[] = Array.isArray(tData)
          ? (tData as any[]).map((r) => ({
              month: String(r.month),
              year: Number(r.year),
              month_index: Number(r.month_index),
              enrollments: Number(r.enrollments || 0),
            }))
          : []
        if (mounted) setTrend(points)

        // Top courses by enrollment_count
        const { data: topData, error: topErr } = await (supabase as any)
          .from('courses')
          .select('id,title,enrollment_count')
          .order('enrollment_count', { ascending: false })
          .limit(6)
        if (topErr) throw topErr
        const tops: TopCourse[] = Array.isArray(topData)
          ? (topData as any[]).map((c) => ({ id: c.id, title: c.title, enrollment_count: Number(c.enrollment_count || 0) }))
          : []
        if (mounted) setTopCourses(tops)

        // Recent enrollments (last 10)
        const { data: recentData, error: recentErr } = await supabase
          .from('enrollments')
          .select('id, student_id, course_id, enrolled_at, payment_status')
          .order('enrolled_at', { ascending: false })
          .limit(10)
        if (recentErr) throw recentErr
        const recs: RecentEnrollment[] = Array.isArray(recentData) ? (recentData as any[]).map((r) => ({
          id: r.id,
          student_id: r.student_id,
          course_id: r.course_id,
          enrolled_at: String(r.enrolled_at),
          payment_status: String(r.payment_status || ''),
        })) : []

        // fetch student and course titles for recent enrollments
        const studentIds = Array.from(new Set(recs.map((r) => r.student_id))).filter(Boolean)
        const courseIds = Array.from(new Set(recs.map((r) => r.course_id))).filter(Boolean)
        const studentMap: Record<string, { full_name?: string | null; email?: string | null }> = {}
        const courseMap: Record<string, { title?: string | null }> = {}
        if (studentIds.length) {
          const { data: sData } = await supabase.from('users').select('id, full_name, email').in('id', studentIds)
          ;(sData || []).forEach((s: any) => { studentMap[s.id] = { full_name: s.full_name, email: s.email } })
        }
        if (courseIds.length) {
          const { data: cData } = await supabase.from('courses').select('id, title').in('id', courseIds)
          ;(cData || []).forEach((c: any) => { courseMap[c.id] = { title: c.title } })
        }
        const enriched = recs.map((r) => ({
          ...r,
          student_name: studentMap[r.student_id]?.full_name ?? null,
          student_email: studentMap[r.student_id]?.email ?? null,
          course_title: courseMap[r.course_id]?.title ?? null,
        }))
        if (mounted) setRecentEnrollments(enriched)
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        if (mounted) setError(msg)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [months])

  return { metrics, trend, topCourses, recentEnrollments, loading, error }
}
