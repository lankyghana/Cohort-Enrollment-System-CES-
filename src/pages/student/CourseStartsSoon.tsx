import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'

type CourseStartInfo = {
  id: string
  title: string
  start_date: string | null
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds }
}

function toDisplayDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date)
}

export const CourseStartsSoon = () => {
  const navigate = useNavigate()
  const { courseId } = useParams<{ courseId: string }>()

  const whatsappChannelUrl = 'https://whatsapp.com/channel/0029Vb7hxPhBadmgcyIWLf3z'

  const [course, setCourse] = useState<CourseStartInfo | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!courseId) return

    let mounted = true
    const run = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await api.get<CourseStartInfo>(`/courses/${courseId}`)
        if (!mounted) return
        setCourse(res.data)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (mounted) setError(msg || 'Failed to load course')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    run()
    return () => {
      mounted = false
    }
  }, [courseId])

  const startMs = useMemo(() => {
    if (!course?.start_date) return null
    const d = new Date(course.start_date)
    const t = d.getTime()
    return Number.isNaN(t) ? null : t
  }, [course?.start_date])

  const remaining = useMemo(() => {
    if (startMs === null) return null
    return startMs - now
  }, [startMs, now])

  useEffect(() => {
    if (startMs === null) return

    if (startMs <= Date.now()) {
      if (courseId) navigate(`/dashboard/courses/${courseId}`, { replace: true })
      return
    }

    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [courseId, navigate, startMs])

  if (loading) {
    return <div className="container-custom py-10">Loading…</div>
  }

  if (error) {
    return (
      <div className="container-custom py-10">
        <Card className="mx-auto w-full max-w-xl space-y-4 p-8">
          <h1 className="text-2xl font-heading font-semibold text-text">Course starts soon</h1>
          <p className="text-text-soft">We couldn’t load the course start time.</p>
          <div className="rounded-2xl border border-red-200 bg-red-50/70 p-3 text-sm text-red-600">{error}</div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!course || !course.start_date || remaining === null) {
    return (
      <div className="container-custom py-10">
        <Card className="mx-auto w-full max-w-xl space-y-4 p-8">
          <h1 className="text-2xl font-heading font-semibold text-text">Course starts soon</h1>
          <p className="text-text-soft">This course does not have a start time configured.</p>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
          </div>
        </Card>
      </div>
    )
  }

  const { days, hours, minutes, seconds } = formatDuration(remaining)

  return (
    <div className="container-custom py-10">
      <Card className="mx-auto w-full max-w-xl space-y-5 p-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-semibold text-text">Course starts soon</h1>
          <p className="text-text-soft">
            You’re enrolled in <span className="font-medium text-text">{course.title}</span>.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
          <div className="text-sm text-text-soft">Starts on</div>
          <div className="text-lg font-semibold text-text">{toDisplayDate(course.start_date)}</div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-center">
            <div className="text-2xl font-semibold text-text">{days}</div>
            <div className="text-xs text-text-soft">Days</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-center">
            <div className="text-2xl font-semibold text-text">{hours.toString().padStart(2, '0')}</div>
            <div className="text-xs text-text-soft">Hours</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-center">
            <div className="text-2xl font-semibold text-text">{minutes.toString().padStart(2, '0')}</div>
            <div className="text-xs text-text-soft">Minutes</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-center">
            <div className="text-2xl font-semibold text-text">{seconds.toString().padStart(2, '0')}</div>
            <div className="text-xs text-text-soft">Seconds</div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>Back</Button>
          <Button
            variant="secondary"
            onClick={() => window.open(whatsappChannelUrl, '_blank', 'noopener,noreferrer')}
          >
            Join our channel
          </Button>
          <Button onClick={() => navigate(`/dashboard/courses/${course.id}`)}>Go to course</Button>
        </div>
      </Card>
    </div>
  )
}
