import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/format'
import { useAuthStore } from '@/store/authStore'
import apiClient from '@/services/apiClient'
import '@/types/paystack.d.ts';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  duration_weeks: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
}

interface Session {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
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
    const fetchDetails = async () => {
      if (!id) return
      try {
        setLoading(true)
        setError(null)
        const { data } = await apiClient.get(`/api/courses/${id}`)
        if (isMounted) {
          setCourse(data.course)
          setModules(data.modules)
          setSessions(data.sessions)
        }
      } catch (e: unknown) {
        if (isMounted) {
          const error = e as Error;
          setError(error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    let isMounted = true
    fetchDetails()

    return () => {
      isMounted = false
    }
  }, [id])

  const handleEnroll = async () => {
    if (!user || !course) return

    // Check if already enrolled
    setLoading(true)
    try {
      const { data: enrollmentStatus } = await apiClient.get(`/api/enrollment-status/${course.id}`)
      if (enrollmentStatus.isEnrolled) {
        navigate(`/dashboard/courses/${course.id}`)
        return
      }

      // Not enrolled, proceed to payment
      const paystack = window.PaystackPop?.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: Math.round(Number(course.price) * 100), // kobo
        currency: course.currency || 'NGN',
        metadata: { course_id: course.id, student_id: user.id },
        callback: async (response) => {
          try {
            await apiClient.post('/api/payments/verify', {
              reference: response.reference,
              course_id: course.id,
            })
            
            alert('Enrollment successful! Redirecting to dashboard...')
            navigate(`/dashboard/courses/${course.id}`)
          } catch (err) {
            console.error('Verification failed:', err)
            setError('Payment verification failed. Please contact support.')
          }
        },
        onClose: () => {
          console.log('Payment popup closed.')
        },
      })
      paystack?.openIframe()
    } catch (err) {
      console.error('Enrollment error:', err)
      setError('An unexpected error occurred during enrollment.')
    } finally {
      setLoading(false)
    }
  }

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
          <Button className="w-full" onClick={handleEnroll}>
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


