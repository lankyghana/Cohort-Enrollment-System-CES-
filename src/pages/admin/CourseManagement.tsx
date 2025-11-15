import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabase'
import type { Database } from '@/types/database'

type Course = Database['public']['Tables']['courses']['Row']

export const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
        if (error) throw error
        if (mounted) setCourses(data || [])
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course? This action cannot be undone.')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('courses').delete().eq('id', id)
      if (error) throw error
      setCourses((c) => c.filter((x) => x.id !== id))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading font-bold">Course Management</h1>
        <div>
          <Link to="/admin/courses/new" className="btn btn-primary">
            + New Course
          </Link>
        </div>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}

      <div className="grid gap-4">
        {courses.map((c) => (
          <div key={c.id} className="p-4 bg-white rounded-md shadow flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">{c.title}</div>
              <div className="text-sm text-gray-500">{c.short_description}</div>
              <div className="text-xs text-gray-400">Price: ₦{Number(c.price).toFixed(2)} • Status: {c.status}</div>
            </div>

            <div className="space-x-2">
              <button onClick={() => navigate(`/admin/courses/${c.id}/edit`)} className="btn btn-sm">
                Edit
              </button>
              <button onClick={() => handleDelete(c.id)} className="btn btn-sm btn-danger">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

