/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { supabase } from '@/services/supabase'

type Metrics = {
  total_students: number
  total_courses: number
  total_enrollments: number
  total_revenue: number
  active_courses: number
}

type EnrollmentPoint = {
  month: string
  year: number
  month_index: number
  enrollments: number
}

export function useAdminMetrics(months = 6) {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [trend, setTrend] = useState<EnrollmentPoint[]>([])
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

  return { metrics, trend, loading, error }
}
