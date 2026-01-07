import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { formatCurrency } from '@/utils/format'
import axios from 'axios'

type BalanceSummary = {
  course: { id: string; title: string }
  currency: string
  total_price: number
  amount_paid: number
  balance_due: number
  payment_deadline: string | null
  access_locked: boolean
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'Not set'
  const d = new Date(deadline)
  if (Number.isNaN(d.getTime())) return deadline
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export const PayBalance = () => {
  const navigate = useNavigate()
  const { courseId } = useParams()

  const [summary, setSummary] = useState<BalanceSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingPaymentUrl, setPendingPaymentUrl] = useState<string | null>(null)
  const [pendingPaymentMessage, setPendingPaymentMessage] = useState<string | null>(null)

  const nextPath = useMemo(() => {
    const raw = sessionStorage.getItem('balance_next')
    if (!raw) return null
    if (!raw.startsWith('/')) return null
    return raw
  }, [])

  useEffect(() => {
    const run = async () => {
      if (!courseId) {
        setError('Missing course.')
        return
      }

      try {
        setLoading(true)
        setError(null)

        const resp = await api.get<BalanceSummary>(`/courses/${courseId}/balance-summary`)
        const data = resp.data
        setSummary(data)

        if (Number(data.balance_due) <= 0) {
          sessionStorage.removeItem('balance_next')
          navigate(nextPath || '/dashboard', { replace: true })
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const data = err.response?.data as unknown
          if (data && typeof data === 'object') {
            const maybeMessage = (data as { message?: unknown }).message
            if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
              setError(maybeMessage)
              return
            }
          }
        }
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg || 'Failed to load balance summary')
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [courseId, navigate, nextPath])

  const onPay = async () => {
    if (!courseId) return
    if (!summary) return

    try {
      setPaying(true)
      setError(null)
      setPendingPaymentUrl(null)
      setPendingPaymentMessage(null)

      const resp = await api.post<{ authorization_url?: string; payment_url?: string }>(`/payments/initiate`, {
        course_id: courseId,
        payment_type: 'balance',
      })

      const url = resp.data.authorization_url || resp.data.payment_url
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
              : 'You already have a pending payment.'

          setPendingPaymentMessage(message)

          if (typeof url === 'string' && url.trim()) {
            setPendingPaymentUrl(url)
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
        }
      }
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg || 'Unable to start payment')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="container-custom space-y-5 py-6 md:py-10">
      <div className="sticky top-0 z-10 -mx-4 px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-700">
          <div className="font-semibold">Your course has started, but your balance is still outstanding.</div>
          <div className="mt-1">Please complete payment to restore access.</div>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50/70 p-3 text-sm text-red-600">{error}</div>}

      {pendingPaymentMessage && (
        <Card className="space-y-3 p-4">
          <div className="text-sm text-text">
            <div className="font-semibold">You have a pending payment.</div>
            <div className="mt-1 text-text-soft">{pendingPaymentMessage}</div>
          </div>

          {pendingPaymentUrl ? (
            <Button className="w-full" onClick={() => (window.location.href = pendingPaymentUrl)}>
              Resume payment
            </Button>
          ) : (
            <Button className="w-full" onClick={onPay} isLoading={paying} disabled={paying}>
              Try again
            </Button>
          )}
        </Card>
      )}

      {loading || !summary ? (
        <div className="py-10 text-center text-text-soft">Loading…</div>
      ) : (
        <Card className="space-y-4 p-6">
          <div>
            <h1 className="text-2xl font-heading font-semibold text-text">Pay remaining balance</h1>
            <p className="mt-1 text-sm text-text-soft">{summary.course.title}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-soft">Total price</span>
              <span className="font-semibold text-text">{formatCurrency(Number(summary.total_price), summary.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-soft">Amount paid</span>
              <span className="font-semibold text-text">{formatCurrency(Number(summary.amount_paid), summary.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-soft">Balance due</span>
              <span className="font-semibold text-text">{formatCurrency(Number(summary.balance_due), summary.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-soft">Payment deadline</span>
              <span className="font-semibold text-text">{formatDeadline(summary.payment_deadline)}</span>
            </div>
          </div>

          <Button onClick={onPay} isLoading={paying} disabled={paying} className="w-full">
            Pay remaining balance
          </Button>

          <p className="text-sm text-text-soft">
            Once payment is completed, your access will be restored immediately.
          </p>
        </Card>
      )}
    </div>
  )
}
