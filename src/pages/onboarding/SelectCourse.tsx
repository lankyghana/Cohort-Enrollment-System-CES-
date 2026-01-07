import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { formatCurrency } from '@/utils/format'
import axios from 'axios'

type EnrollableCourse = {
  id: string
  title: string
  short_description: string | null
  description: string | null
  duration_weeks: number
  thumbnail_url: string | null
  price?: number | string | null
  currency?: string | null
}

type EnrollmentQuote = {
  course_id: string
  currency: string
  total_price: number
  enrollment_fee: number
  balance_due: number
  start_date?: string | null
}

export const SelectCourse = () => {
  const navigate = useNavigate()
  const { token, enrollmentIntentId } = useAuthStore()

  const selectedCardRef = useRef<HTMLDivElement | null>(null)

  const [courses, setCourses] = useState<EnrollableCourse[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [quote, setQuote] = useState<EnrollmentQuote | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingPaymentUrl, setPendingPaymentUrl] = useState<string | null>(null)
  const [pendingPaymentMessage, setPendingPaymentMessage] = useState<string | null>(null)

  const canContinue = useMemo(
    () => Boolean(selectedCourseId) && Boolean(enrollmentIntentId),
    [selectedCourseId, enrollmentIntentId]
  )

  const visibleCourses = useMemo(() => {
    if (!selectedCourseId) return courses
    return courses.filter((c) => c.id === selectedCourseId)
  }, [courses, selectedCourseId])

  const selectedCourse = useMemo(() => {
    if (!selectedCourseId) return null
    return courses.find((c) => c.id === selectedCourseId) || null
  }, [courses, selectedCourseId])

  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true })
      return
    }

    if (!enrollmentIntentId) {
      navigate('/register', { replace: true })
      return
    }

    let isMounted = true

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get<unknown>(`/courses?enrollable=true`)
        const raw = response.data as unknown
        const list = Array.isArray(raw)
          ? (raw as EnrollableCourse[])
          : ((raw as { data?: unknown }).data as EnrollableCourse[] | undefined) ?? []

        if (isMounted) {
          setCourses(list)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (isMounted) setError(msg || 'Failed to load courses')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [navigate, enrollmentIntentId, token])

  useEffect(() => {
    if (!selectedCourseId || !enrollmentIntentId) {
      setQuote(null)
      return
    }

    let isMounted = true

    const loadQuote = async () => {
      try {
        setError(null)
        const response = await api.post<EnrollmentQuote>(`/enrollment/quote`, {
          course_id: selectedCourseId,
          enrollment_intent_id: enrollmentIntentId,
        })
        if (isMounted) setQuote(response.data)
      } catch (err) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : String(err)
          setError(msg || 'Failed to load pricing')
          setQuote(null)
        }
      }
    }

    loadQuote()

    return () => {
      isMounted = false
    }
  }, [selectedCourseId, enrollmentIntentId])

  useEffect(() => {
    if (!selectedCourseId) return
    const el = selectedCardRef.current
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [selectedCourseId])

  const selectCourse = (courseId: string) => {
    if (submitting) return
    if (selectedCourseId) return
    setSelectedCourseId(courseId)
  }

  const resetSelection = () => {
    if (submitting) return
    setSelectedCourseId(null)
    setQuote(null)
    setError(null)
    setPendingPaymentUrl(null)
    setPendingPaymentMessage(null)
  }

  const startPayment = async (courseId: string, paymentType: 'enrollment_fee' | 'full') => {
    if (!enrollmentIntentId) return
    if (!courseId) return

    try {
      setSubmitting(true)
      setError(null)
      setPendingPaymentUrl(null)
      setPendingPaymentMessage(null)

      const response = await api.post<{ authorization_url?: string; payment_url?: string }>(`/payments/initiate`, {
        course_id: courseId,
        enrollment_intent_id: enrollmentIntentId,
        payment_type: paymentType,
      })

      const url = response.data.authorization_url || response.data.payment_url
      if (!url) throw new Error('Payment URL was not returned')

      window.location.href = url
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const data = err.response?.data as unknown

        if (
          status === 409 &&
          data &&
          typeof data === 'object' &&
          (data as { code?: unknown }).code === 'PENDING_PAYMENT_EXISTS'
        ) {
          const url =
            (data as { payment_url?: unknown }).payment_url ||
            (data as { authorization_url?: unknown }).authorization_url

          const message =
            (data as { message?: unknown }).message && typeof (data as { message?: unknown }).message === 'string'
              ? ((data as { message?: unknown }).message as string)
              : 'You already have a pending payment for this course.'

          setPendingPaymentMessage(message)

          if (typeof url === 'string' && url.trim()) {
            setPendingPaymentUrl(url)
            // Optional: auto-resume after a short delay.
            window.setTimeout(() => {
              window.location.href = url
            }, 1500)
          }

          return
        }

        if (data && typeof data === 'object') {
          const maybeMessage = (data as { message?: unknown }).message
          if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
            setError(maybeMessage)
            return
          }

          const maybeErrors = (data as { errors?: unknown }).errors
          if (maybeErrors && typeof maybeErrors === 'object') {
            const errorsObj = maybeErrors as Record<string, unknown>
            const firstKey = Object.keys(errorsObj)[0]
            const firstVal = firstKey ? errorsObj[firstKey] : undefined
            if (Array.isArray(firstVal) && typeof firstVal[0] === 'string') {
              setError(firstVal[0])
              return
            }
            if (typeof firstVal === 'string') {
              setError(firstVal)
              return
            }
          }
        }

        if (typeof err.message === 'string' && err.message.trim()) {
          setError(err.message)
          return
        }
      }

      const msg = err instanceof Error ? err.message : String(err)
      setError(msg || 'Unable to start payment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-custom space-y-4 py-4 md:space-y-10 md:py-12">
      <div className="rounded-[24px] border border-white/60 bg-white/90 px-4 py-4 shadow-shell md:rounded-[32px] md:px-8 md:py-10">
        <p className="pill bg-primary/10 text-primary">Enrollment</p>
        <h1 className="mt-2 text-2xl font-heading font-semibold text-text md:mt-4 md:text-4xl">Choose your course</h1>
        <p className="mt-1 text-sm text-text-soft md:mt-2 md:text-base">Select exactly one course to continue to payment.</p>

        {selectedCourseId && (
          <button
            type="button"
            onClick={resetSelection}
            disabled={submitting}
            className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            Change course
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/70 p-3 text-sm text-red-600">{error}</div>
      )}

      {pendingPaymentMessage && (
        <Card className="space-y-3 p-4">
          <div className="text-sm text-text">
            <div className="font-semibold">You have a pending payment for this course.</div>
            <div className="mt-1 text-text-soft">
              {pendingPaymentMessage}
            </div>
          </div>

          {pendingPaymentUrl ? (
            <Button className="w-full" onClick={() => (window.location.href = pendingPaymentUrl)}>
              Resume payment
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={() => {
                if (!selectedCourseId) return
                startPayment(selectedCourseId, 'enrollment_fee')
              }}
              isLoading={submitting}
              disabled={!selectedCourseId || submitting}
            >
              Try again
            </Button>
          )}

          <p className="text-xs text-text-soft">
            We won’t create a duplicate charge. This simply continues your existing checkout.
          </p>
        </Card>
      )}

      {loading ? (
        <div className="py-12 text-center">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="py-12 text-center text-text-soft">No enrollable courses available right now.</div>
      ) : (
        <div
          className={`grid grid-cols-1 gap-3 transition-all duration-300 md:gap-6 md:grid-cols-2 lg:grid-cols-3 ${
            selectedCourseId ? 'lg:grid-cols-1' : ''
          }`}
        >
          {visibleCourses.map((course) => {
            const selected = course.id === selectedCourseId
            return (
              <div
                key={course.id}
                ref={selected ? selectedCardRef : undefined}
                className={`transition-all duration-300 ${selected ? 'scale-[1.01]' : ''}`}
              >
                <Card
                  className={`h-full p-3 md:p-5 ${
                    selected
                      ? '!border-primary shadow-shell'
                      : 'hover:shadow-shell'
                  }`}
                  onClick={() => selectCourse(course.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-text md:text-xl">{course.title}</h3>

                      <p className="mt-0.5 hidden text-sm text-text-soft md:block line-clamp-1">
                        {course.short_description || course.description}
                      </p>

                      <div className="mt-1 flex items-center gap-3 text-xs text-text-soft md:mt-2 md:text-sm">
                        <span>{course.duration_weeks} weeks</span>
                          {course.price === null || course.price === undefined ? (
                            <span>Pricing shown at checkout</span>
                          ) : (
                            <span className="font-medium text-text">
                              {formatCurrency(Number(course.price), course.currency ?? undefined)}
                            </span>
                          )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {selected ? (
                        <Button type="button" size="sm" disabled>
                          Selected
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            selectCourse(course.id)
                          }}
                          disabled={Boolean(selectedCourseId) || submitting}
                        >
                          Select
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}

      {selectedCourse && (
        <div className="sticky bottom-0 z-10 -mx-4 px-4 pb-4 md:static md:mx-0 md:px-0 md:pb-0">
          <Card className="space-y-3 p-4">
            {quote ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-soft">Course total</span>
                    <span className="font-semibold text-text">{formatCurrency(Number(quote.total_price), quote.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-soft">Enrollment fee today</span>
                    <span className="font-semibold text-text">{formatCurrency(Number(quote.enrollment_fee), quote.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-soft">Balance due later</span>
                    <span className="font-semibold text-text">{formatCurrency(Number(quote.balance_due), quote.currency)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    className="w-full"
                    onClick={() => startPayment(selectedCourse.id, 'enrollment_fee')}
                    disabled={!canContinue}
                    isLoading={submitting}
                  >
                    Pay enrollment fee
                  </Button>
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => startPayment(selectedCourse.id, 'full')}
                    disabled={!canContinue}
                    isLoading={submitting}
                  >
                    Pay full amount
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-sm text-text-soft">Fetching pricing…</div>
                <Button disabled isLoading className="w-auto">
                  Loading
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
