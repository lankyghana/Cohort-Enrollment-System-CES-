import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/services/supabase'
// Database types intentionally not used here; admin UI uses pragmatic casts to avoid typing friction
import { useAuthStore } from '@/store/authStore'

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

  const { appUser } = useAuthStore()

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
          const msg = e instanceof Error ? e.message : String(e)
          setError(msg)
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
      const payload: CoursePayload = {
        title,
        description,
        short_description: shortDescription || null,
        instructor_id: appUser?.id || '',
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
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">{id ? 'Edit course' : 'Create course'}</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Short description</label>
          <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input h-32" required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium">Price</label>
            <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium">Currency</label>
            <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="input" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Max students (optional)</label>
          <input type="number" value={maxStudents === '' ? '' : String(maxStudents)} onChange={(e) => setMaxStudents(e.target.value ? Number(e.target.value) : '')} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as 'draft'|'published'|'archived')} className="input">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Thumbnail</label>
          <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files ? e.target.files[0] : null)} />
        </div>

        <div className="flex items-center gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
          <button type="button" className="btn" onClick={() => navigate('/admin')}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

