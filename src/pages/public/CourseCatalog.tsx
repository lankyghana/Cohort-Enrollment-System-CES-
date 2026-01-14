import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  price?: number | string | null
  price_minor?: number | null
  currency?: string | null
  duration_weeks?: number | null
  duration_value?: number | null
  duration_unit?: string | null
  thumbnail_url?: string | null
  published?: boolean
  status?: string | null
}

type PaginatedResponse<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

const useDebouncedValue = <T,>(value: T, delayMs: number) => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(id)
  }, [delayMs, value])

  return debounced
}

const formatDuration = (course: CatalogCourse): string => {
  const value = course.duration_value
  const unit = (course.duration_unit ?? '').trim()
  if (typeof value === 'number' && Number.isFinite(value) && unit) {
    return `${value} ${unit}`
  }

  const weeks = course.duration_weeks
  if (typeof weeks === 'number' && Number.isFinite(weeks)) {
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
  }

  return '—'
}

const resolvePrice = (course: CatalogCourse): { amount: number; currency?: string } | null => {
  const currency = course.currency ?? undefined

  if (typeof course.price === 'number' && Number.isFinite(course.price)) {
    return { amount: course.price, currency }
  }
  if (typeof course.price === 'string') {
    const parsed = Number(course.price)
    if (Number.isFinite(parsed)) return { amount: parsed, currency }
  }
  if (typeof course.price_minor === 'number' && Number.isFinite(course.price_minor)) {
    return { amount: course.price_minor / 100, currency }
  }
  return null
}

const resolveStatus = (course: CatalogCourse): { label: string; variant: 'published' | 'comingSoon' } => {
  const isPublished = course.published === true || course.status === 'published'
  return isPublished
    ? { label: 'Published', variant: 'published' }
    : { label: 'Coming soon', variant: 'comingSoon' }
}

const SearchBar = ({ value, onChange, disabled }: { value: string; onChange: (next: string) => void; disabled?: boolean }) => (
  <div className="w-full md:max-w-sm">
    <label className="sr-only" htmlFor="course-search">Search courses</label>
    <Input
      id="course-search"
      type="search"
      placeholder="Search by title or keyword"
      value={value}
      disabled={disabled}
      aria-label="Search courses"
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
)

const CourseCardSkeleton = () => (
  <Card className="h-full p-5">
    <div className="animate-pulse space-y-4">
      <div className="aspect-video w-full rounded-[28px] bg-slate-200/70" />
      <div className="flex items-center justify-between">
        <div className="h-6 w-1/3 rounded bg-slate-200/70" />
        <div className="h-6 w-20 rounded-full bg-slate-200/70" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-4/5 rounded bg-slate-200/70" />
        <div className="h-4 w-full rounded bg-slate-200/70" />
        <div className="h-4 w-2/3 rounded bg-slate-200/70" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-slate-200/70" />
        <div className="h-4 w-24 rounded bg-slate-200/70" />
      </div>
      <div className="h-11 w-full rounded-2xl bg-slate-200/70" />
    </div>
  </Card>
)

const EmptyState = () => (
  <Card className="p-8 text-center">
    <div className="mx-auto mb-4 h-10 w-10 rounded-2xl bg-primary/10" aria-hidden="true" />
    <p className="text-base font-semibold text-text">No courses available</p>
    <p className="mt-2 text-sm text-text-light">New cohorts are added regularly. Please check back soon.</p>
    <div className="mt-6 flex justify-center">
      <Button asChild variant="outline" size="md" className="w-full max-w-xs">
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  </Card>
)

const CourseCard = ({ course }: { course: CatalogCourse }) => {
  const navigate = useNavigate()
  const status = resolveStatus(course)
  const duration = formatDuration(course)
  const price = resolvePrice(course)
  const isPublished = status.variant === 'published'

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/courses/${course.slug}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(`/courses/${course.slug}`)
        }
      }}
      className="group"
      aria-label={`View course: ${course.title}`}
    >
      <Card className="h-full cursor-pointer p-5 transition-transform md:hover:-translate-y-0.5">
        <div className="space-y-4">
          <CourseThumbnail src={course.thumbnail_url ?? null} alt={course.title} className="ring-1 ring-slate-200/70" />

          <div className="flex items-center justify-between gap-3">
            <span
              className={
                status.variant === 'published'
                  ? 'inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary'
                  : 'inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700'
              }
            >
              {status.label}
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold leading-snug text-text line-clamp-2 sm:text-xl">{course.title}</h2>
            <p className="text-sm leading-relaxed text-text-soft line-clamp-2">
              {course.short_description || course.description || '—'}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-text-light">Price</span>
              <span className="font-semibold text-primary">{price ? formatCurrency(price.amount, price.currency ?? undefined) : '—'}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-text-light">Duration</span>
              <span className="font-semibold text-text-soft">{duration}</span>
            </div>
          </div>

          <Button
            size="md"
            className="w-full"
            disabled={!isPublished}
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/courses/${course.slug}`)
            }}
          >
            {isPublished ? 'View details' : 'Coming soon'}
          </Button>
        </div>
      </Card>
    </article>
  )
}

const Pagination = ({
  page,
  lastPage,
  total,
  from,
  to,
  onPrev,
  onNext,
  disabled,
}: {
  page: number
  lastPage: number
  total: number
  from: number | null
  to: number | null
  onPrev: () => void
  onNext: () => void
  disabled?: boolean
}) => (
  <nav aria-label="Course pagination" className="mt-8">
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-text-light">
        {total > 0 ? (
          <span>
            Showing <span className="font-semibold text-text">{from ?? 0}</span>–<span className="font-semibold text-text">{to ?? 0}</span> of{' '}
            <span className="font-semibold text-text">{total}</span>
          </span>
        ) : (
          <span>Page {page}</span>
        )}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <span className="text-sm text-text-soft text-center sm:text-left">Page {page} of {lastPage}</span>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            size="md"
            className="w-full sm:w-auto"
            onClick={onPrev}
            disabled={disabled || page <= 1}
            aria-label="Previous page"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="md"
            className="w-full sm:w-auto"
            onClick={onNext}
            disabled={disabled || page >= lastPage}
            aria-label="Next page"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  </nav>
)

export const CourseCatalog = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebouncedValue(searchQuery.trim(), 400)

  const [courses, setCourses] = useState<CatalogCourse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const pageSize = 12
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [range, setRange] = useState<{ from: number | null; to: number | null }>({ from: null, to: null })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearchQuery])

  useEffect(() => {
    let isMounted = true

    const fetchCourses = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiClient.get<unknown>('/api/courses', {
          params: {
            page,
            pageSize,
            enrollable: true,
            search: debouncedSearchQuery || undefined,
          },
        })

        const raw = response.data as unknown
        const paginated = raw as Partial<PaginatedResponse<CatalogCourse>>

        const list = Array.isArray(raw)
          ? (raw as CatalogCourse[])
          : (Array.isArray(paginated.data) ? paginated.data : [])

        const onlyPublished = list.filter((c) => {
          const status = c.status
          return c.published === true || status === 'published' || status == null
        })

        if (isMounted) {
          setCourses(onlyPublished)
          setLastPage(typeof paginated.last_page === 'number' ? paginated.last_page : Math.max(1, page))
          setTotal(typeof paginated.total === 'number' ? paginated.total : onlyPublished.length)
          setRange({
            from: typeof paginated.from === 'number' ? paginated.from : null,
            to: typeof paginated.to === 'number' ? paginated.to : null,
          })
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (isMounted) setError(msg || 'Failed to load courses')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchCourses()

    return () => {
      isMounted = false
    }
  }, [debouncedSearchQuery, page, reloadKey])

  const skeletonCount = useMemo(() => Math.min(pageSize, 8), [pageSize])

  return (
    <section className="bg-slate-50">
      <div className="container-custom space-y-8 py-8 sm:py-10 lg:py-12">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-heading font-bold leading-tight text-text sm:text-4xl">Browse Courses</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-text-soft sm:text-base">
              Explore live, instructor-led cohorts curated by our team.
            </p>
          </div>

          <div className="w-full md:w-auto">
            <SearchBar value={searchQuery} onChange={setSearchQuery} disabled={loading} />
          </div>
        </header>

        {error ? (
          <Card className="p-6 text-center">
            <p className="text-base font-semibold text-text">Something went wrong</p>
            <p className="mt-2 text-sm text-text-light">{error}</p>
            <div className="mt-6 flex justify-center">
              <Button variant="outline" size="md" onClick={() => setReloadKey((k) => k + 1)}>
                Retry
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              aria-busy={loading}
              aria-live="polite"
            >
              {loading
                ? Array.from({ length: skeletonCount }).map((_, idx) => <CourseCardSkeleton key={idx} />)
                : courses.map((course) => <CourseCard key={course.id} course={course} />)}
            </div>

            {!loading && courses.length === 0 ? <EmptyState /> : null}

            <Pagination
              page={page}
              lastPage={lastPage}
              total={total}
              from={range.from}
              to={range.to}
              disabled={loading}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(lastPage, p + 1))}
            />
          </>
        )}
      </div>
    </section>
  )
}


