import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/services/apiClient';
// Database types intentionally not used here; admin UI uses pragmatic casts to avoid typing friction
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'




const formatError = (err: unknown) => {
  if (err && typeof err === 'object') {
    const withMessage = err as { message?: unknown }
    if (typeof withMessage.message === 'string' && withMessage.message.trim().length > 0) {
      return withMessage.message
    }
    try {
      return JSON.stringify(err)
    } catch (jsonErr) {
      console.error('Failed to stringify error', jsonErr)
    }
  }
  return typeof err === 'string' ? err : String(err ?? 'Unknown error')
}

export const CreateEditCourse = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [currency, setCurrency] = useState('NGN')
  const [maxStudents, setMaxStudents] = useState<number | ''>('')
  const [status, setStatus] = useState<'draft'|'published'|'archived'>('draft')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  useEffect(() => {
    let mounted = true
    if (id) {
      setLoading(true)
      ;(async () => {
        try {
          const { data } = await apiClient.get(`/api/courses/${id}`)
          if (!mounted) return
          const course = data.course
          setTitle(course.title || '')
          setShortDescription(course.short_description || '')
          setDescription(course.description || '')
          setPrice(Number(course.price || 0))
          setCurrency(course.currency || 'NGN')
          setMaxStudents(course.max_students ?? '')
          setStatus(course.status || 'draft')
        } catch (e: unknown) {
          console.error('Failed to load course', e)
          setError(formatError(e))
        } finally {
          setLoading(false)
        }
      })()
    }
    return () => { mounted = false }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!user) {
      setError('Please sign in to manage courses.')
      navigate('/login')
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('short_description', shortDescription || '')
      formData.append('instructor_id', user.id)
      formData.append('price', String(price || 0))
      formData.append('currency', currency)
      formData.append('status', status)
      if (maxStudents) {
        formData.append('max_students', String(maxStudents))
      }
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile)
      }

      if (id) {
        // Use POST with method spoofing for file uploads on update
        formData.append('_method', 'PUT')
        await apiClient.post(`/api/courses/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        await apiClient.post('/api/courses', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      navigate('/admin')
    } catch (e: unknown) {
      console.error('Failed to save course', e)
      setError(formatError(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title={id ? 'Update course' : 'Launch new course'}
        subtitle="Share cohort details, pricing, and visuals in one pass."
        actions={(
          <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
        )}
      />

      {error && <Card className="mb-4 border-red-200 text-red-600">{error}</Card>}

      <Card className="max-w-3xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input label="Short description" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-text shadow-inner focus:border-primary focus:outline-none"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="Price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            <Input label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
            <Input
              label="Max students (optional)"
              type="number"
              value={maxStudents === '' ? '' : String(maxStudents)}
              onChange={(e) => setMaxStudents(e.target.value ? Number(e.target.value) : '')}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft'|'published'|'archived')}
                className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 text-sm text-text focus:border-primary focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Thumbnail</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files ? e.target.files[0] : null)}
                className="block w-full rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-3 text-sm"
              />
              <p className="mt-1 text-xs text-text-light">Use 1200x600px JPG or PNG.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" isLoading={loading}>{loading ? 'Saving…' : 'Save course'}</Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/admin')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}


