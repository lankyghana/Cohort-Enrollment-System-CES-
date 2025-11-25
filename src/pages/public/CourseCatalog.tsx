import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import CourseThumbnail from '@/components/ui/CourseThumbnail'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/format'
import apiClient from '@/services/apiClient'

type CatalogCourse = {
  id: string
  title: string
  short_description: string | null
  description: string | null
  price: number
  currency: string
  duration_weeks: number
  thumbnail_url: string | null
}

export const CourseCatalog = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [courses, setCourses] = useState<CatalogCourse[]>([])
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

        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        })
        if (searchQuery.trim()) {
          params.set('search', searchQuery.trim())
        }

        const response = await apiClient.get<{ data: CatalogCourse[] }>(`/api/courses?${params.toString()}`)

        if (isMounted) {
          setCourses(response.data.data ?? [])
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
    <div className="container-custom space-y-10 py-12">
      <div className="flex flex-col gap-4 rounded-[32px] border border-white/60 bg-white/90 px-8 py-10 shadow-shell md:flex-row md:items-center md:justify-between">
        <div>
          <p className="pill bg-primary/10 text-primary">Course catalog</p>
          <h1 className="mt-4 text-4xl font-heading font-semibold text-text">Browse courses</h1>
          <p className="text-text-soft">Filter live cohorts sourced directly from the admin dashboard.</p>
        </div>
        <div className="w-full max-w-md">
          <Input
            type="search"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link key={course.id} to={`/courses/${course.id}`}>
                <Card className="h-full cursor-pointer space-y-5 p-6">
                  <CourseThumbnail src={course.thumbnail_url ?? null} alt={course.title} />
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-text">{course.title}</h3>
                    <p className="text-sm text-text-soft line-clamp-2">
                      {course.short_description || course.description}
                    </p>
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span className="text-primary">
                        {formatCurrency(Number(course.price), course.currency)}
                      </span>
                      <span className="text-text-soft">{course.duration_weeks} weeks</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-text-soft">Page {page}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  )
}


