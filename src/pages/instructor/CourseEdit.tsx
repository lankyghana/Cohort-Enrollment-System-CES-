import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { instructorService } from '@/services/instructor'
import CourseForm, { type CourseFormValues } from '@/components/instructor/CourseForm'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export const CourseEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Partial<CourseFormValues> | null>(null)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      const { data, error } = await instructorService.getCourses()
      if (!error) setCourse(data)
    }
    load()
  }, [id])

  const handleUpdate = async (_values: CourseFormValues) => {
    await instructorService.updateCourse()
    navigate('/instructor/courses')
  }

  if (!course) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white/80 p-8 text-center text-sm text-text-soft">
        Loading course details…
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 p-8 text-white shadow-2xl lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <p className="text-xs uppercase tracking-[0.5em] text-white/60">Operations suite</p>
            <h1 className="text-3xl font-semibold tracking-tight">Update course</h1>
            <p className="text-white/80">Refresh pricing, visuals, or enrollment limits without breaking the publishing flow.</p>
          </div>
          <Button variant="ghost" onClick={() => navigate(-1)} className="border border-white/30 text-white hover:bg-white/10">
            Back
          </Button>
        </div>
      </div>

      <Card className="border-slate-100/60 bg-white/80 p-6 lg:p-10">
        <CourseForm initial={course} onSubmit={handleUpdate} onCancel={() => navigate('/instructor/courses')} />
      </Card>
    </div>
  )
}

export default CourseEdit

