import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { User as AppUser } from '@/types'

export const EnrollmentSuccess = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const reference = params.get('reference')
  const state = params.get('state')

  const { token: existingToken, enrollmentIntentId, setToken, setUser, setEnrollmentIntentId } = useAuthStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      if (!reference) {
        setError('Missing payment reference.')
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await api.post<{ user: AppUser; token: string | null; course?: { id: string; start_date: string | null } }>(`/payments/verify`, {
          reference,
          state,
          enrollment_intent_id: enrollmentIntentId,
        })

        const { user, token, course } = response.data
        if (!user) {
          throw new Error('Payment verification did not return a user.')
        }

        if (token) {
          setToken(token)
        } else if (!existingToken) {
          throw new Error('Payment was verified, but no session was created. Please log in to continue.')
        }
        setUser(user)
        setEnrollmentIntentId(null)

        const next = sessionStorage.getItem('balance_next')
        if (next && next.startsWith('/')) {
          sessionStorage.removeItem('balance_next')
        }

        const startDate = course?.start_date ? new Date(course.start_date) : null
        if (course?.id && startDate && !Number.isNaN(startDate.getTime()) && startDate.getTime() > Date.now()) {
          navigate(`/course-starts-soon/${course.id}`, { replace: true })
        } else {
          if (next && next.startsWith('/')) {
            navigate(next, { replace: true })
          } else {
            navigate('/dashboard', { replace: true })
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg || 'Payment verification failed')
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [navigate, reference, setEnrollmentIntentId, setToken, setUser])

  return (
    <div className="container-custom py-16">
      <Card className="mx-auto w-full max-w-xl space-y-4 p-8">
        <h1 className="text-3xl font-heading font-semibold text-text">Confirming your enrollment…</h1>
        <p className="text-text-soft">
          {loading
            ? 'Please wait while we verify your payment.'
            : error
              ? 'We could not complete enrollment verification.'
              : 'Redirecting to your dashboard.'}
        </p>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/70 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/select-course')} disabled={loading}>
            Back
          </Button>
          <Button onClick={() => window.location.reload()} disabled={loading || !reference}>
            Retry
          </Button>
        </div>
      </Card>
    </div>
  )
}
