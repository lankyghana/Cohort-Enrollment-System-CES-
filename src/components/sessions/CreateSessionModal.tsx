import { FormEvent, useEffect, useMemo, useState } from 'react'
import { CalendarClock, Link2, Loader2, Video } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import {
  createSessionWithNotifications,
  fetchCoursesForSession,
  type CreatorContext,
  type RoleScope,
  type SessionPayload,
} from '@/services/sessions'

interface CreateSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: (sessionId: string) => void
  role: RoleScope
  userId?: string | null
}

type FormState = {
  courseId: string
  title: string
  description: string
  date: string
  time: string
  meetingLink: string
  duration: string
}

const defaultState: FormState = {
  courseId: '',
  title: '',
  description: '',
  date: '',
  time: '',
  meetingLink: '',
  duration: '60',
}

const combineDateTime = (date: string, time: string) => {
  if (!date || !time) return null
  const isoCandidate = new Date(`${date}T${time}`)
  if (Number.isNaN(isoCandidate.getTime())) {
    return null
  }
  return isoCandidate.toISOString()
}

export const CreateSessionModal = ({
  isOpen,
  onClose,
  onCreated,
  role,
  userId,
}: CreateSessionModalProps) => {
  const [form, setForm] = useState<FormState>(defaultState)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [courses, setCourses] = useState<Array<{ id: string; title: string; status?: string }>>([])

  useEffect(() => {
    if (!isOpen) {
      setForm(defaultState)
      setErrors({})
      setFormError(null)
      return
    }

    const loadCourses = async () => {
      setLoadingCourses(true)
      setFormError(null)
      try {
        const data = await fetchCoursesForSession(role, userId)
        setCourses(data)
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Unable to load courses.')
      } finally {
        setLoadingCourses(false)
      }
    }

    loadCourses()
  }, [isOpen, role, userId])

  const creatorContext: CreatorContext = useMemo(
    () => ({
      userId: userId || '',
      role: role,
    }),
    [role, userId]
  )

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!form.courseId) nextErrors.courseId = 'Select a course'
    if (!form.title.trim()) nextErrors.title = 'Title is required'
    if (!form.date) nextErrors.date = 'Select a date'
    if (!form.time) nextErrors.time = 'Select a time'
    if (!form.meetingLink.trim()) nextErrors.meetingLink = 'Meeting link is required'

    const scheduledAt = combineDateTime(form.date, form.time)
    if (!scheduledAt) {
      nextErrors.date = nextErrors.date || 'Invalid date/time'
      nextErrors.time = nextErrors.time || 'Invalid date/time'
    }

    if (form.duration) {
      const minutes = Number(form.duration)
      if (Number.isNaN(minutes) || minutes <= 0) {
        nextErrors.duration = 'Duration must be a positive number'
      }
    }

    setErrors(nextErrors)
    return { isValid: Object.keys(nextErrors).length === 0, scheduledAt }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const { isValid, scheduledAt } = validate()
    if (!isValid || !scheduledAt) return

    const payload: SessionPayload = {
      course_id: form.courseId,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      meeting_link: form.meetingLink.trim(),
      scheduled_at: scheduledAt,
      duration_minutes: Number(form.duration) || 60,
    }

    setSubmitting(true)
    try {
      const session = await createSessionWithNotifications(payload, creatorContext)
      onCreated?.(session.id)
      setForm(defaultState)
      onClose()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create session.')
    } finally {
      setSubmitting(false)
    }
  }

  const disableSubmit = submitting || loadingCourses || !courses.length

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule live session" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-text-soft">Course</label>
            <div className="mt-2">
              <select
                className="w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm font-medium text-text shadow-inner shadow-white/40 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                value={form.courseId}
                onChange={(e) => updateField('courseId', e.target.value)}
                disabled={loadingCourses}
              >
                <option value="">{loadingCourses ? 'Loading courses…' : 'Select a course'}</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              {errors.courseId && <p className="mt-2 text-sm text-red-600">{errors.courseId}</p>}
              {!courses.length && !loadingCourses && (
                <p className="mt-2 text-sm text-text-soft">No courses available for your account.</p>
              )}
            </div>
          </div>
          <Input
            label="Session title"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            error={errors.title}
            placeholder="Live working session"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            type="date"
            label="Session date"
            value={form.date}
            onChange={(e) => updateField('date', e.target.value)}
            error={errors.date}
            min={new Date().toISOString().split('T')[0]}
          />
          <Input
            type="time"
            label="Start time"
            value={form.time}
            onChange={(e) => updateField('time', e.target.value)}
            error={errors.time}
          />
        </div>

        <Input
          label="Meeting link"
          placeholder="https://zoom.us/j/..."
          value={form.meetingLink}
          onChange={(e) => updateField('meetingLink', e.target.value)}
          error={errors.meetingLink}
          helperText="Share the video room students should join."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Duration (minutes)"
            type="number"
            min={15}
            value={form.duration}
            onChange={(e) => updateField('duration', e.target.value)}
            error={errors.duration}
          />
          <Input
            label="Optional description"
            placeholder="What will you cover?"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
          />
        </div>

        {formError && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</p>}

        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={disableSubmit} className="gap-2">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Scheduling
              </>
            ) : (
              <>
                <CalendarClock className="h-4 w-4" /> Schedule session
              </>
            )}
          </Button>
        </div>

        {!courses.length && !loadingCourses && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Add a course first before scheduling sessions.
          </div>
        )}

        <div className="rounded-2xl border border-slate-100 px-4 py-3 text-xs text-text-soft">
          <p className="flex items-center gap-2">
            <Video className="h-3.5 w-3.5" /> Students enrolled in the selected course receive a notification automatically.
          </p>
          <p className="mt-1 flex items-center gap-2">
            <Link2 className="h-3.5 w-3.5" /> Meeting links are shared exactly as entered—double-check before saving.
          </p>
        </div>
      </form>
    </Modal>
  )
}

export default CreateSessionModal

