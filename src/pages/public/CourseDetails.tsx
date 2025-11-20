import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/format'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/store/authStore'

// Small ambient declaration for the Paystack inline widget so we can call
// `window.PaystackPop.setup(...)` without using `any` in this file.
declare global {
  interface Window {
    PaystackPop?: {
      setup: (opts: {
        key: string
        email: string
        amount: number
        currency?: string
        ref?: string
        metadata?: Record<string, unknown>
        onClose?: () => void
        callback?: (res: { reference: string }) => void
      }) => { openIframe: () => void }
    }
  }
}

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
  const navigate = useNavigate()
  const { user } = useAuthStore()
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
    return <div className="container-custom py-12">Loading course...</div>
  }

  if (error) {
    return <div className="container-custom py-12 text-red-600">{error}</div>
  }

  if (!course) {
    return (
      <div className="container-custom py-12">
        <p>Course not found</p>
      </div>
    )
  }

  return (
    <div className="container-custom space-y-10 py-12">
      <div className="grid gap-8 lg:grid-cols-[2fr,_1fr]">
        <Card className="space-y-6 p-8">
          <div>
            <p className="pill bg-primary/10 text-primary">Course overview</p>
            <h1 className="mt-4 text-4xl font-heading font-semibold text-text">{course.title}</h1>
            <p className="mt-4 text-lg text-text-soft">{course.description}</p>
          </div>

          {modules.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Curriculum</h2>
              <div className="space-y-3">
                {modules.map((m) => (
                  <div key={m.id} className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
                    <p className="font-semibold text-text">{m.title}</p>
                    {m.description && <p className="text-sm text-text-soft">{m.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {sessions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold">Upcoming sessions</h2>
              <div className="mt-4 space-y-3">
                {sessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
                    <div>
                      <p className="font-semibold text-text">{s.title}</p>
                      <p className="text-sm text-text-soft">{new Date(s.scheduled_at).toLocaleString()}</p>
                    </div>
                    <span className="text-sm text-text-soft">{s.duration_minutes} mins</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="space-y-4 p-8">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-text-soft">Investment</span>
            <div className="mt-2 text-4xl font-bold text-primary">
              {formatCurrency(Number(course.price), course.currency)}
            </div>
            <p className="text-sm text-text-soft">Duration: {course.duration_weeks} weeks</p>
          </div>
          <Button className="w-full" onClick={async () => {
              // Enrollment flow:
              // 1. Ensure user is signed in
              // 2. Open Paystack inline widget using public key
              // 3. On success, call our verification edge function to verify
              //    the transaction server-side, create an enrollment, and
              //    send a confirmation email.
              if (!user) {
                navigate('/login')
                return
              }

              const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
              const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || ''
              if (!paystackKey || !functionsUrl) {
                alert('Payment is not configured. Please contact support.')
                return
              }

              // load Paystack inline script if not present
              if (!window.PaystackPop) {
                await new Promise<void>((resolve, reject) => {
                  const s = document.createElement('script')
                  s.src = 'https://js.paystack.co/v1/inline.js'
                  s.onload = () => resolve()
                  s.onerror = () => reject(new Error('Failed to load Paystack script'))
                  document.body.appendChild(s)
                })
              }

              // Prepare metadata for Paystack
              const reference = `psk_${Date.now()}_${Math.floor(Math.random() * 10000)}`
              if (!user.email) {
                alert('Please make sure your account has an email address.')
                return
              }

              const handler = window.PaystackPop!.setup({
                key: paystackKey,
                email: user.email,
                amount: Math.round(Number(course.price) * 100), // kobo
                currency: course.currency || 'NGN',
                ref: reference,
                metadata: { course_id: course.id, student_id: user.id },
                onClose: function() {
                  // user closed payment
                },
                callback: async function(response: { reference: string }) {
                  // response.reference contains the transaction reference
                  try {
                    const verifyUrl = `${functionsUrl}/verify-paystack`
                    const res = await fetch(verifyUrl, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ reference: response.reference, course_id: course.id, student_id: user.id }),
                    })
                    const json = await res.json()
                    if (res.ok && json.success) {
                      alert('Payment verified and enrollment complete. Check your email for confirmation.')
                      // optionally navigate to course dashboard
                      navigate(`/dashboard/courses/${course.id}`)
                    } else {
                      alert('Payment verification failed. Please contact support.')
                    }
                  } catch (err) {
                    console.error(err)
                    alert('Payment verification encountered an error. Please contact support.')
                  }
                }
              })

              handler.openIframe()
            }}>
              Enroll now
            </Button>
          <div className="space-y-2 text-sm text-text-soft">
            <p>Students enrolled: {course.enrollment_count || 0}</p>
            <p>Currency: {course.currency}</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

