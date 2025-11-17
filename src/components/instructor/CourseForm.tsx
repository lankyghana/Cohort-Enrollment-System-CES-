import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import InstructorService from '@/services/instructor'

type Props = {
  initial?: any
  onSubmit: (values: any) => Promise<void>
}

export const CourseForm = ({ initial, onSubmit }: Props) => {
  const { register, handleSubmit } = useForm({ defaultValues: initial })
  const [isLoading, setIsLoading] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initial?.thumbnail ?? null)
  const [thumbnailPath, setThumbnailPath] = useState<string | null>(null)
  const [thumbnailError, setThumbnailError] = useState<string | null>(null)
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
  }

  const submit = async (values: any) => {
    setIsLoading(true)
    try {
      let payload = { ...values }
      // include already uploaded preview url as thumbnail
      if (thumbnailPreview) {
        payload.thumbnail = thumbnailPreview
        if (thumbnailPath) payload.thumbnail_path = thumbnailPath
      }
      await onSubmit(payload)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Input label="Title" {...register('title', { required: true })} />
      <Input label="Subtitle" {...register('subtitle')} />
      <Input label="Price" type="number" {...register('price')} />
      <Input label="Difficulty" {...register('difficulty')} />

      <div>
        <label className="block text-sm font-medium mb-1">Thumbnail (369.8 x 160)</label>
        <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
        {thumbnailPreview && (
          <div className="mt-2">
            <div className="text-xs text-muted mb-1">Preview</div>
            <img src={thumbnailPreview} alt="thumbnail preview" style={{ width: 369.8, height: 160, objectFit: 'cover', borderRadius: 6 }} />
          </div>
        )}
        {thumbnailError && <div className="text-sm text-red-600 mt-2">{thumbnailError}</div>}
      </div>

      <Button type="submit" isLoading={isLoading}>Save</Button>
    </form>
  )
}

export default CourseForm
