import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/format'
import { supabase } from '@/services/supabase'

/*
 * Course, Module, and Session types
 * These mirror the expected columns returned from the Supabase `courses`,
 * `course_modules`, and `course_sessions` tables respectively. We keep
 * the types lightweight and permissive for optional fields (nullable in DB).
 * Note: Some numeric values (e.g. price) may be stored as strings in the DB
 * depending on the schema; we convert them to numbers where needed before
 * formatting or arithmetic.
 */
type Course = {
  id: string
  title: string
  description?: string | null
  short_description?: string | null
  // price is stored as string in many schemas to avoid precision issues.
  price: string
  currency: string
  duration_weeks: number
  thumbnail_url?: string | null
  enrollment_count?: number
}

type Module = {
  id: string
  title: string
  description?: string | null
  // order_index is used to sort modules inside a course
  order_index: number
}

type Session = {
  id: string
  title: string
  // scheduled_at stored as ISO string in DB
  scheduled_at: string
  duration_minutes: number
}

export const CourseDetails = () => {
  const { id } = useParams<{ id: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // `isMounted` flag prevents state updates after the component unmounts.
    // This avoids React state update warnings when an async request resolves
    // after a navigation or component teardown.
    let isMounted = true

    const fetchDetails = async () => {
      // if no id param, nothing to fetch
      if (!id) return
      try {
        setLoading(true)
        setError(null)

        /*
         * Fetch main course row. We use `.single()` because id is unique.
         * Supabase will return an error if the row isn't found.
         */
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single()

        if (courseError) {
          // surface the error message to the UI
          setError(courseError.message)
          return
        }

        /*
         * Fetch related modules and sessions. These are separate queries so
         * we keep the data model explicit and easy to extend (pagination,
         * filtering) if needed in the future.
         */
        const { data: modulesData } = await supabase
          .from('course_modules')
          .select('*')
          .eq('course_id', id)
          .order('order_index', { ascending: true })

        const { data: sessionsData } = await supabase
          .from('course_sessions')
          .select('*')
          .eq('course_id', id)
          .order('scheduled_at', { ascending: true })

        if (isMounted) {
          /*
           * We cast the returned rows to our local types. Supabase returns
           * `any` by default so these assertions help TypeScript-aware
           * editors and autosuggestion while keeping runtime behavior
           * unchanged. Using `|| []` ensures we never set undefined.
           */
          setCourse(courseData as Course)
          setModules((modulesData as Module[]) || [])
          setSessions((sessionsData as Session[]) || [])
        }
      } catch (err) {
        // Avoid `any` in the catch param; produce a safe string message.
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg || 'Failed to load course')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    // run the fetch once when id changes
    fetchDetails()

    // cleanup to prevent state updates after unmount
    return () => {
      isMounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="container-custom py-8">Loading course...</div>
    )
  }

  if (error) {
    return (
      <div className="container-custom py-8 text-red-600">{error}</div>
    )
  }

  if (!course) {
    return (
      <div className="container-custom py-8">
        <p>Course not found</p>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <h1 className="text-3xl font-heading font-bold mb-4">{course.title}</h1>
            <p className="text-text-light mb-6">{course.description}</p>

            {modules.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Curriculum</h2>
                {modules.map((m) => (
                  <div key={m.id} className="p-3 border rounded">
                    <h3 className="font-medium">{m.title}</h3>
                    {m.description && <p className="text-text-light text-sm">{m.description}</p>}
                  </div>
                ))}
              </div>
            )}

            {sessions.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
                <div className="space-y-2 mt-2">
                  {sessions.map((s) => (
                    <div key={s.id} className="p-3 border rounded flex justify-between items-center">
                      <div>
                        <div className="font-medium">{s.title}</div>
                        <div className="text-text-light text-sm">{new Date(s.scheduled_at).toLocaleString()}</div>
                      </div>
                      <div className="text-sm text-text-light">{s.duration_minutes} mins</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
        <div>
          <Card>
            <div className="mb-4">
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(Number(course.price), course.currency)}
              </span>
            </div>
            <Button className="w-full mb-4">Enroll Now</Button>
            <div className="space-y-2 text-sm text-text-light">
              <p>Duration: {course.duration_weeks} weeks</p>
              <p>Students: {course.enrollment_count || 0}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

