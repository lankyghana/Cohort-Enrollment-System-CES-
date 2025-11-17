import { supabase } from './supabase'

const sb: any = supabase as any

const InstructorService = {
  getCoursesByInstructor: async (instructorId: string) => {
    return sb.from('courses').select('*').eq('instructor_id', instructorId).order('created_at', { ascending: false })
  },

  getCourseById: async (id: string) => {
    return sb.from('courses').select('*').eq('id', id).single()
  },

  createCourse: async (payload: any) => {
    return sb.from('courses').insert([payload])
  },

  updateCourse: async (id: string, patch: any) => {
    return sb.from('courses').update(patch).eq('id', id)
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
  /* Sections & Lessons */
  getSectionsByCourse: async (courseId: string) => {
    return sb.from('course_sections').select('*, lessons(*)').eq('course_id', courseId).order('position', { ascending: true })
  },

  createSection: async (courseId: string, title: string, position = 0) => {
    return sb.from('course_sections').insert([{ course_id: courseId, title, position }])
  },

  updateSection: async (id: string, patch: any) => {
    return sb.from('course_sections').update(patch).eq('id', id)
  },

  deleteSection: async (id: string) => {
    return sb.from('course_sections').delete().eq('id', id)
  },

  createLesson: async (sectionId: string, payload: any) => {
    const body = { section_id: sectionId, ...payload }
    return sb.from('lessons').insert([body])
  },

  updateLesson: async (id: string, patch: any) => {
    return sb.from('lessons').update(patch).eq('id', id)
  },

  deleteLesson: async (id: string) => {
    return sb.from('lessons').delete().eq('id', id)
  },
}

export default InstructorService
