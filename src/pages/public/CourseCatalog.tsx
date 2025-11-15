import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/utils/format'
import { supabase } from '@/services/supabase'

type Course = {
  id: string
  title: string
  short_description?: string | null
  description?: string | null
  price: string
  currency: string
  duration_weeks: number
  thumbnail_url?: string | null
}

export const CourseCatalog = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 12

  useEffect(() => {
    let isMounted = true

    const fetchCourses = async () => {
      try {
        setLoading(true)
        setError(null)

        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

        let query = supabase
          .from('courses')
          .select('id, title, short_description, description, price, currency, duration_weeks, thumbnail_url')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .range(from, to)

        if (searchQuery && searchQuery.trim().length > 0) {
          // simple text search on title and short_description using ilike
          const q = `%${searchQuery.trim()}%`
          query = query.or(`title.ilike.${q},short_description.ilike.${q},description.ilike.${q}`)
        }

  const { data, error: fetchError } = await query

        if (fetchError) {
          setError(fetchError.message)
          setCourses([])
          return
        }

        if (isMounted) {
          setCourses((data as Course[]) || [])
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg || 'Failed to load courses')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchCourses()

    return () => {
      isMounted = false
    }
  }, [searchQuery, page])

  return (
    <div className="container-custom py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-heading font-bold">Browse Courses</h1>

        <div className="flex items-center gap-4">
          <Input
            type="search"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="max-w-md"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading courses...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-light">No courses available yet. Check back soon!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} to={`/courses/${course.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {course.thumbnail_url && (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                    <p className="text-text-light text-sm mb-4 line-clamp-2">
                      {course.short_description || course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold">
                        {formatCurrency(Number(course.price), course.currency)}
                      </span>
                      <span className="text-text-light text-sm">{course.duration_weeks} weeks</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              className="px-4 py-2 border rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="text-sm text-text-light">Page {page}</span>
            <button className="px-4 py-2 border rounded" onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}

