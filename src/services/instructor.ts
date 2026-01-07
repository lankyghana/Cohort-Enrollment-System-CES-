import apiClient from './apiClient'
import type { Course } from '@/types'
import type { CourseFormValues } from '@/components/instructor/CourseForm'
import { usePlatformStore } from '@/store/platformStore'

function toDatetimeLocalValue(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const min = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

type ServiceResult<T> = Promise<{ error?: Error; data?: T }>

type CourseUpsertPayload = Partial<Pick<Course,
  | 'id'
  | 'title'
  | 'description'
  | 'short_description'
  | 'price'
  | 'currency'
  | 'duration_weeks'
  | 'thumbnail_url'
  | 'banner_url'
  | 'status'
  | 'max_students'
  | 'start_date'
  | 'end_date'
>>

export const instructorService = {
  getCourses: async (): ServiceResult<Course[]> => {
    try {
      const { data } = await apiClient.get('/api/courses')
      return { data: (data ?? []) as Course[] }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to load courses') }
    }
  },

  getCourse: async (id: string): ServiceResult<Partial<CourseFormValues>> => {
    try {
      const { data } = await apiClient.get(`/api/courses/${id}`)
      const course = data as Course
      const { currency: platformCurrency, currencyAliases } = usePlatformStore.getState()
      const raw = String(course.currency || '').toUpperCase().trim()
      const normalized = (currencyAliases && raw && currencyAliases[raw]) ? currencyAliases[raw] : raw
      const currency: CourseFormValues['currency'] = normalized || platformCurrency || undefined
      return {
        data: {
          id: course.id,
          instructor_id: course.instructor_id,
          title: course.title,
          short_description: course.short_description,
          description: course.description,
          price: course.price,
          currency,
          max_students: course.max_students ?? null,
          start_date: toDatetimeLocalValue(course.start_date),
          status: course.status,
          thumbnail_url: course.thumbnail_url,
        },
      }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to load course') }
    }
  },

  createCourse: async (payload: CourseUpsertPayload): ServiceResult<Course> => {
    try {
      const { data } = await apiClient.post('/api/courses', payload)
      return { data: data as Course }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to create course') }
    }
  },

  updateCourse: async (id: string, payload: CourseUpsertPayload): ServiceResult<Course> => {
    try {
      const { data } = await apiClient.put(`/api/courses/${id}`, payload)
      return { data: data as Course }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to update course') }
    }
  },

  deleteCourse: async (id: string): ServiceResult<{ message: string }> => {
    try {
      const { data } = await apiClient.delete(`/api/courses/${id}`)
      return { data: data as { message: string } }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to delete course') }
    }
  },

  uploadThumbnail: async (file: File): ServiceResult<{ publicUrl: string }> => {
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await apiClient.post('/api/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return { data: { publicUrl: data.url } }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to upload thumbnail') }
    }
  },

  upsertCourseDraft: async (payload: CourseUpsertPayload): ServiceResult<Course> => {
    try {
      const { data } = await apiClient.post('/api/courses', payload)
      return { data: data as Course }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to save draft') }
    }
  },
}

