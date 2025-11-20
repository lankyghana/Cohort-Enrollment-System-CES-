import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/services/supabase'
// Database types intentionally not used here; admin UI uses pragmatic casts to avoid typing friction
import { useAuthStore } from '@/store/authStore'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

// Local lightweight types to avoid wide `any` usage while keeping the admin UI flexible
type CoursePayload = {
  title: string
  description: string
  short_description?: string | null
  instructor_id: string
  price: number
  currency: string
  duration_weeks?: number
  status: 'draft'|'published'|'archived'
  max_students?: number | null
  thumbnail_url?: string | null
}

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

  const { appUser, user } = useAuthStore()

  useEffect(() => {
    let mounted = true
    if (id) {
      setLoading(true)
      ;(async () => {
        try {
          const { data, error } = await supabase.from('courses').select('*').eq('id', id).single()
          if (error) throw error
          if (!mounted) return
          const row = data as unknown as Record<string, unknown>
          setTitle(String(row.title || ''))
          setShortDescription((row.short_description as string) || '')
          setDescription(String(row.description || ''))
          setPrice(Number((row.price as number) || 0))
          setCurrency((row.currency as string) || 'NGN')
          setMaxStudents((row.max_students as number) ?? '')
          setStatus((row.status as 'draft'|'published'|'archived') || 'draft')
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

    async function uploadThumbnail(courseId: string) {
    if (!thumbnailFile) return null
    const fileExt = thumbnailFile.name.split('.').pop()
    const filePath = `thumbnails/${courseId}-${Date.now()}.${fileExt}`
    const { error } = await supabase.storage.from('course-assets').upload(filePath, thumbnailFile, { cacheControl: '3600', upsert: false })
    if (error) throw error
    // getPublicUrl is synchronous in some SDK versions but returns a typed shape in others; treat result as unknown and narrow
    // call without `any` cast and don't await since some SDKs return synchronously
    const publicRes: unknown = supabase.storage.from('course-assets').getPublicUrl(filePath)
    const publicObj = publicRes as { data?: { publicUrl?: string; publicURL?: string } }
    return publicObj?.data?.publicUrl ?? publicObj?.data?.publicURL ?? null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const instructorId = appUser?.id || user?.id
      if (!instructorId) {
        setError('Unable to determine admin profile. Please refresh and try again.')
        setLoading(false)
        return
      }

      const payload: CoursePayload = {
        title,
        description,
        short_description: shortDescription || null,
        instructor_id: instructorId,
        price: Number(price || 0),
        currency,
        duration_weeks: 0,
        status,
        max_students: typeof maxStudents === 'number' ? maxStudents : null,
      }

      if (id) {
        // update
        // supabase's strict typing can be noisy for quick admin UIs; keep update call but avoid `any` for payload
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from('courses').update(payload as any).eq('id', id)
        if (error) throw error
        if (thumbnailFile) {
          const url = await uploadThumbnail(id)
          if (url) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('courses').update({ thumbnail_url: url } as any).eq('id', id)
          }
        }
        navigate('/admin')
      } else {
        // create
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any).from('courses').insert([payload as any]).select('id').single()
        if (error) throw error
        const courseId = data.id
        if (thumbnailFile) {
          const url = await uploadThumbnail(courseId)
          if (url) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('courses').update({ thumbnail_url: url } as any).eq('id', courseId)
          }
        }
        navigate('/admin')
      }
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

