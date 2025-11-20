import { supabase } from './supabase'
import type { Database } from '@/types/database'

type CourseInsert = Database['public']['Tables']['courses']['Insert']
type CourseUpdate = Database['public']['Tables']['courses']['Update']
type CourseSectionRow = Database['public']['Tables']['course_sections']['Row']
type CourseSectionInsert = Database['public']['Tables']['course_sections']['Insert']
type LessonInsert = Database['public']['Tables']['lessons']['Insert']
type LessonUpdate = Database['public']['Tables']['lessons']['Update']
type LessonPayload = Partial<Omit<LessonInsert, 'section_id'>> & Pick<LessonInsert, 'title'>

const sb = supabase

const InstructorService = {
  getCoursesByInstructor: async (instructorId: string) => {
    return sb.from('courses').select('*').eq('instructor_id', instructorId).order('created_at', { ascending: false })
  },

  getCourseById: async (id: string) => {
    return sb.from('courses').select('*').eq('id', id).single()
  },

  createCourse: async (payload: Record<string, unknown>) => {
    const coursePayload = payload as CourseInsert
    return sb.from('courses').insert([coursePayload]).select('*')
  },

  upsertCourseDraft: async (payload: Record<string, unknown> & { id?: string }) => {
    // If payload has an id, perform update; otherwise create a new draft row
    if (payload?.id) {
      const updatePayload = payload as CourseUpdate
      return sb.from('courses').update(updatePayload).eq('id', payload.id).select('*')
    }
    // ensure status is draft by default when creating via autosave
    const toInsert = { status: 'draft', ...payload } as CourseInsert
    return sb.from('courses').insert([toInsert]).select('*')
  },

  updateCourse: async (id: string, patch: Record<string, unknown>) => {
    const updatePayload = patch as CourseUpdate
    return sb.from('courses').update(updatePayload).eq('id', id).select('*')
  },

  deleteCourse: async (id: string) => {
    return sb.from('courses').delete().eq('id', id)
  },

  uploadThumbnail: async (file: File, courseId: string) => {
    // Ensure a bucket named 'course-thumbnails' exists in Supabase Storage
    const path = `${courseId}/${file.name}`
    const res = await sb.storage.from('course-thumbnails').upload(path, file, { cacheControl: '3600', upsert: true })
    if (res.error) return { data: null, error: res.error }
    const url = sb.storage.from('course-thumbnails').getPublicUrl(path)
    return { data: { path, publicUrl: url.data?.publicUrl }, error: null }
  },
  // Final-save via server-side Edge Function (service role).
  // Set `VITE_FINAL_SAVE_URL` in your env (.env) to point to the deployed function.
  finalSaveCourse: async (payload: Record<string, unknown>) => {
    try {
      const url = (import.meta.env.VITE_FINAL_SAVE_URL as string) || '/api/final-save'
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json?.error || 'Final save failed' }
      return { data: json.data ?? json, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : String(err) }
    }
  },
  /* Sections & Lessons */
  getSectionsByCourse: async (courseId: string) => {
    return sb.from('course_sections').select('*, lessons(*)').eq('course_id', courseId).order('position', { ascending: true })
  },

  createSection: async (courseId: string, title: string, position = 0) => {
    const payload: CourseSectionInsert = { course_id: courseId, title, position, description: null }
    return sb.from('course_sections').insert([payload])
  },

  updateSection: async (id: string, patch: Partial<CourseSectionRow>) => {
    return sb.from('course_sections').update(patch).eq('id', id)
  },

  deleteSection: async (id: string) => {
    return sb.from('course_sections').delete().eq('id', id)
  },

  createLesson: async (sectionId: string, payload: LessonPayload) => {
    const body: LessonInsert = {
      section_id: sectionId,
      title: payload.title,
      description: payload.description ?? null,
      type: payload.type ?? 'text',
      content: payload.content ?? null,
      position: payload.position ?? 0,
    }
    return sb.from('lessons').insert([body])
  },

  updateLesson: async (id: string, patch: LessonUpdate) => {
    return sb.from('lessons').update(patch).eq('id', id)
  },

  deleteLesson: async (id: string) => {
    return sb.from('lessons').delete().eq('id', id)
  },
}

export default InstructorService
