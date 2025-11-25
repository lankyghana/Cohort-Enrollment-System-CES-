import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useCourses from '@/hooks/useCourses'
import CourseForm, { type CourseFormValues } from '@/components/instructor/CourseForm'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'


export const CourseCreate = () => {
  const navigate = useNavigate()
  const { createCourse } = useCourses()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const handleCreate = async (values: CourseFormValues) => {
    setError(null)
    setSubmitting(true)
    try {
      const res = await createCourse(values)
      if (res?.error) {
        setError(res.error.message || String(res.error))
        return
      }
      navigate('/instructor/courses')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] bg-gradient-to-r from-indigo-500/90 via-purple-500/80 to-pink-500/80 p-8 text-white shadow-2xl lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <p className="text-xs uppercase tracking-[0.5em] text-white/70">Operations suite</p>
            <h1 className="text-3xl font-semibold tracking-tight">Launch new course</h1>
            <p className="text-white/80">Share cohort details, pricing, and visuals in one pass. Keep students aligned with a polished launch experience.</p>
          </div>
          <Button variant="ghost" onClick={() => navigate(-1)} className="border border-white/30 text-white hover:bg-white/10">
            Back
          </Button>
        </div>
      </div>

      <Card className="border-slate-100/60 bg-white/80 p-6 lg:p-10">
        {error && <div className="mb-4 rounded-2xl border border-red-100 bg-red-50/80 p-4 text-sm text-red-700">{error}</div>}
        <CourseForm onSubmit={handleCreate} onCancel={() => navigate('/instructor/courses')} />
        {submitting && <div className="mt-4 text-sm text-text-soft">Submitting course...</div>}
      </Card>
    </div>
  )
}

export default CourseCreate

