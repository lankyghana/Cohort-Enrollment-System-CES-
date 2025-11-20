import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabase'
import type { Database } from '@/types/database'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

type Course = Database['public']['Tables']['courses']['Row']

export const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Course['status'] | 'all'>('all')
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

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesStatus = statusFilter === 'all' || course.status === statusFilter
      const matchesSearch = search
        ? course.title?.toLowerCase().includes(search.toLowerCase()) ||
          course.short_description?.toLowerCase().includes(search.toLowerCase())
        : true
      return matchesStatus && matchesSearch
    })
  }, [courses, search, statusFilter])

  return (
    <div>
      <AdminPageHeader
        title="Course Management"
        subtitle="Launch new cohorts, monitor pricing, and keep catalog tidy."
        actions={(
          <Button asChild>
            <Link to="/admin/courses/new">+ New Course</Link>
          </Button>
        )}
      />

      <Card className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-1 gap-3">
          <Input
            placeholder="Search course title or summary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Course['status'] | 'all')}
            className="rounded-2xl border border-gray-200 px-4 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="text-xs text-text-light">
          Showing {filteredCourses.length} of {courses.length} courses
        </div>
      </Card>

      {loading && <Card className="p-6 text-sm text-text-light">Loading courses…</Card>}
      {error && <Card className="p-6 text-sm text-red-600">Error: {error}</Card>}

      <div className="grid gap-4">
        {filteredCourses.map((c) => (
          <Card key={c.id} padding="lg" className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-slate-900">{c.title}</h2>
                <span className="pill uppercase text-xs">{c.status}</span>
              </div>
              <p className="text-sm text-text-light">{c.short_description || 'No summary provided yet.'}</p>
              <div className="text-xs text-text-light">Price: ₦{Number(c.price).toFixed(2)} • Duration: {c.duration_weeks || 0} weeks</div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/courses/${c.id}/edit`)}>
                Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/courses/${c.id}/curriculum`)}>
                Curriculum
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(c.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {!loading && filteredCourses.length === 0 && (
        <Card className="mt-6 text-center text-text-light">No courses match this filter.</Card>
      )}
    </div>
  )
}

