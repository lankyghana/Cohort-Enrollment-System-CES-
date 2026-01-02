import { useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { instructorService } from '@/services/instructor'
import CourseThumbnail from '@/components/ui/CourseThumbnail'
import { useAuth } from '@/hooks/useAuth'

export type CourseFormValues = {
  id?: string
  instructor_id?: string
  title?: string
  short_description?: string | null
  description?: string | null
  price?: number | null
  currency?: 'GHC' | 'NGN' | 'USD'
  max_students?: number | null
  status?: 'draft' | 'published' | 'archived'
  difficulty?: string | null
  thumbnail_url?: string | null
  thumbnail_path?: string | null
  thumbnail?: string | null
  [key: string]: unknown
}

type Props = {
  initial?: Partial<CourseFormValues> | null
  onSubmit: (values: CourseFormValues) => Promise<void>
  onCancel?: () => void
}

const CURRENCY_OPTIONS = [
  { label: 'Ghanaian Cedi (GHC)', value: 'GHC' },
  { label: 'Nigerian Naira (NGN)', value: 'NGN' },
  { label: 'US Dollar (USD)', value: 'USD' }
] as const

export const CourseForm = ({ initial, onSubmit, onCancel }: Props) => {
  const { register, handleSubmit, watch, setValue } = useForm<CourseFormValues>({
    defaultValues: {
      status: 'draft',
      currency: 'NGN',
      price: 0,
      max_students: null,
      ...initial,
    },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initial?.thumbnail ?? null)
  const [thumbnailError, setThumbnailError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const { appUser } = useAuth()
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ---------------------- IMAGE UPLOAD ---------------------- */

  const handleFile = async (file: File | null) => {
    setThumbnailPreview(null)
    setThumbnailError(null)

    if (!file) return

    try {
      const upload = await instructorService.uploadThumbnail(file)

      if (!upload.error && upload.data?.publicUrl) {
        setThumbnailPreview(upload.data.publicUrl)
      } else {
        setThumbnailError('Failed to upload thumbnail.')
      }
    } catch {
      setThumbnailError('Failed to upload thumbnail.')
    }

    scheduleAutosave()
  }

  /* ---------------------- HELPERS ---------------------- */

  const sanitizeNumber = (value?: number | null) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return null
    return value
  }

  /* ---------------------- FORM SUBMIT ---------------------- */

  const submit = async (values: CourseFormValues) => {
    setIsLoading(true)
    try {
      const payload = {
        ...values,
        price: sanitizeNumber(values.price) ?? 0,
        max_students: sanitizeNumber(values.max_students),
        currency: values.currency ?? 'NGN',
      }

      if (thumbnailPreview) {
        payload.thumbnail_url = thumbnailPreview
      }

      await onSubmit(payload)
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------------------- AUTOSAVE ---------------------- */

  const saveDraft = useCallback(
    async (values: CourseFormValues) => {
      setSaving(true)
      setSaveError(null)

      try {
        // Backend does not support partial/draft creates. Only persist when we have
        // the required fields for creation OR when updating an existing course.
        const payload = {
          id: values.id,
          title: values.title?.trim(),
          short_description: values.short_description ?? undefined,
          description: values.description ?? undefined,
          price: sanitizeNumber(values.price) ?? 0,
          currency: values.currency ?? 'NGN',
          max_students: sanitizeNumber(values.max_students),
          status: values.status,
          thumbnail_url: thumbnailPreview ?? values.thumbnail_url ?? undefined,
        } as const

        if (payload.id) {
          const res = await instructorService.updateCourse(payload.id, {
            title: payload.title,
            short_description: payload.short_description,
            description: payload.description ?? undefined,
            price: payload.price,
            currency: payload.currency,
            max_students: payload.max_students,
            status: payload.status,
            thumbnail_url: payload.thumbnail_url,
          })

          if (res?.error) {
            setSaveError(res.error.message || String(res.error))
          }
          return
        }

        // Create only when required fields exist.
        if (!payload.title || !payload.description) {
          setSaveError('Add a title and description to save.')
          return
        }

        const res = await instructorService.createCourse({
          title: payload.title,
          description: payload.description,
          short_description: payload.short_description,
          price: payload.price,
          currency: payload.currency,
          max_students: payload.max_students,
          status: payload.status,
          thumbnail_url: payload.thumbnail_url,
        })

        if (res?.error) {
          setSaveError(res.error.message || String(res.error))
        } else {
          if (res.data?.id) setValue('id', res.data.id)
        }
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : String(err))
      } finally {
        setSaving(false)
      }
    },
    [setValue, thumbnailPreview]
  )

  const scheduleAutosave = useCallback(
    (values?: CourseFormValues) => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)

      autosaveTimer.current = setTimeout(async () => {
        await saveDraft(values ?? watch())
      }, 8000)
    },
    [saveDraft, watch]
  )

  useEffect(() => {
    const sub = watch((vals) => {
      if (!appUser) return
      scheduleAutosave(vals)
    })
    return () => {
      sub.unsubscribe()
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
  }, [watch, appUser, scheduleAutosave])

  /* ---------------------- UI ---------------------- */

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-8">
      <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl backdrop-blur">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Title"
              placeholder="Enter the course title"
              {...register('title', { required: true })}
            />
            <Input
              label="Short description"
              placeholder="One-liner for listings"
              {...register('short_description')}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-text-soft tracking-[0.3em]">
              Description
            </label>
            <textarea
              className="mt-2 w-full min-h-[160px] rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-sm shadow-inner transition"
              placeholder="Outline cohort details"
              {...register('description')}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Price"
              type="number"
              placeholder="0"
              {...register('price')}
            />

            <Input
              label="Max Students"
              type="number"
              placeholder="Unlimited"
              {...register('max_students')}
            />

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-text-soft">
                Currency
              </label>
              <select
                className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
                {...register('currency')}
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-text-soft">
              Thumbnail
            </label>

            <CourseThumbnail
              src={thumbnailPreview}
            />
            
            <div className="mt-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  void handleFile(file)
                }}
                className="text-sm text-text-soft file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90"
              />
              {thumbnailError && (
                <p className="mt-2 text-xs text-red-600">{thumbnailError}</p>
              )}
            </div>
          </div>

          {saving && (
            <p className="text-xs text-text-soft">
              Saving draft…
            </p>
          )}
          {saveError && (
            <p className="text-xs text-red-600">
              {saveError}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving…' : 'Save Course'}
        </Button>

        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

export default CourseForm

