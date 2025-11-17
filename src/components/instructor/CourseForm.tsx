import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import InstructorService from '@/services/instructor'
import CourseThumbnail from '@/components/ui/CourseThumbnail'
import { useAuth } from '@/hooks/useAuth'

type Props = {
  initial?: any
  onSubmit: (values: any) => Promise<void>
}

export const CourseForm = ({ initial, onSubmit }: Props) => {
  const { register, handleSubmit, watch, setValue } = useForm({ defaultValues: initial })
  const [isLoading, setIsLoading] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initial?.thumbnail ?? null)
  const [thumbnailPath, setThumbnailPath] = useState<string | null>(null)
  const [thumbnailError, setThumbnailError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const { appUser } = useAuth()
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null)
  const REQUIRED_WIDTH = 369.8
  const REQUIRED_HEIGHT = 160

  const aspectTarget = REQUIRED_WIDTH / REQUIRED_HEIGHT

  const handleFile = async (file: File | null) => {
    // reset prior state
    setThumbnailPreview(null)
    setThumbnailPath(null)
    setThumbnailError(null)
    if (!file) return

    // Validate image dimensions (allow small tolerance on aspect ratio)
    const url = URL.createObjectURL(file)
    const img = new Image()

    const ok = await new Promise<boolean>((resolve) => {
      img.onload = () => {
        const w = img.naturalWidth
        const h = img.naturalHeight
        const aspect = w / h
        resolve(Math.abs(aspect - aspectTarget) < 0.02)
      }
      img.onerror = () => resolve(false)
      img.src = url
    })
    URL.revokeObjectURL(url)

    if (!ok) {
      setThumbnailError('Image aspect ratio should match 369.8 x 160 (approx). Please crop/resize and try again.')
      return
    }

    // Upload immediately so instructor sees the preview
    try {
      const tempId = `temp-${Date.now()}-${Math.floor(Math.random() * 100000)}`
      const upload = await InstructorService.uploadThumbnail(file, tempId)
      if (!upload.error && upload.data && upload.data.publicUrl) {
        setThumbnailPreview(upload.data.publicUrl)
        setThumbnailPath(upload.data.path ?? null)
        setThumbnailError(null)
      } else {
        setThumbnailError('Failed to upload thumbnail. Please try again.')
      }
    } catch (err) {
      setThumbnailError('Failed to upload thumbnail. Please try again.')
    }
    // trigger an immediate autosave when thumbnail changes
    scheduleAutosave()
  }

  const submit = async (values: any) => {
    setIsLoading(true)
    try {
      let payload = { ...values }
      // include already uploaded preview url as thumbnail
      if (thumbnailPreview) {
        // DB column is `thumbnail_url` in types; ensure we set the proper field
        payload.thumbnail_url = thumbnailPreview
        if (thumbnailPath) payload.thumbnail_path = thumbnailPath
      }
      await onSubmit(payload)
    } finally {
      setIsLoading(false)
    }
  }

  /* Autosave logic */
  const saveDraft = async (values: any) => {
    setSaving(true)
    setSaveError(null)
    try {
      const payload = { ...values }
      if (thumbnailPreview) payload.thumbnail_url = thumbnailPreview
      // attach instructor id if available
      if (appUser && !payload.instructor_id) payload.instructor_id = appUser.id
      const res: any = await InstructorService.upsertCourseDraft(payload)
      if (res?.error) {
        setSaveError(res.error.message || String(res.error))
      } else {
        setLastSavedAt(Date.now())
        // if a new course was created, update form id so subsequent saves update
        if (!payload.id && res?.data && res.data[0]?.id) {
          const newId = res.data[0].id
          // set the id in the form so subsequent autosaves update the same DB row
          try {
            setValue('id', newId)
          } catch (e) {
            // non-fatal if setValue isn't available for some reason
          }
        }
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  const scheduleAutosave = (values?: any) => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(async () => {
      const vals = values ?? watch()
      await saveDraft(vals)
    }, 8000)
  }

  useEffect(() => {
    const sub = watch((vals) => {
      // don't autosave if user is not authenticated yet
      if (!appUser) return
      scheduleAutosave(vals)
    })
    return () => {
      sub.unsubscribe()
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
  }, [watch, appUser])

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <Input className="rounded-xl shadow-sm" {...register('title', { required: true })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
          <Input className="rounded-xl shadow-sm" {...register('subtitle')} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
          <Input className="rounded-xl shadow-sm" type="number" {...register('price')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
          <Input className="rounded-xl shadow-sm" {...register('difficulty')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <Input className="rounded-xl shadow-sm" {...register('status')} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Thumbnail</label>
        <div className="flex items-center gap-4">
          <input className="rounded-xl" type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
          <div className="text-xs text-gray-500">Preferred size: 369.8 × 160</div>
        </div>

        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-1">Preview</div>
          <div className="inline-block rounded-2xl overflow-hidden shadow-lg">
            <CourseThumbnail src={thumbnailPreview ?? null} alt="thumbnail preview" />
          </div>
          {thumbnailError && <div className="text-sm text-red-600 mt-2">{thumbnailError}</div>}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {saving ? 'Saving...' : lastSavedAt ? `Last saved ${new Date(lastSavedAt).toLocaleTimeString()}` : 'Not saved'}
          {saveError && <span className="text-red-600 ml-2">{saveError}</span>}
        </div>

        <Button type="submit" isLoading={isLoading} className="rounded-2xl">Save</Button>
      </div>
    </form>
  )
}

export default CourseForm
