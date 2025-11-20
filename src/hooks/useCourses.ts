import { useState, useEffect, useCallback } from 'react'
import InstructorService from '@/services/instructor'
import { useAuth } from '@/hooks/useAuth'
import type { Course } from '@/types'

export const useCourses = () => {
  const { appUser } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!appUser) return
    setLoading(true)
    const { data, error } = await InstructorService.getCoursesByInstructor(appUser.id)
    if (!error) setCourses((data as Course[]) ?? [])
    setLoading(false)
  }, [appUser])

  useEffect(() => {
    load()
  }, [load])

  const createCourse = async (payload: Record<string, unknown>) => {
    // Ensure instructor_id is attached (useAuth provides current user)
    const safePayload = { ...payload }
    if (appUser && !safePayload.instructor_id) safePayload.instructor_id = appUser.id
    const res = await InstructorService.createCourse(safePayload)
    await load()
    return res
  }

  const updateCourse = async (id: string, patch: Record<string, unknown>) => {
    const res = await InstructorService.updateCourse(id, patch)
    await load()
    return res
  }

  const deleteCourse = async (id: string) => {
    const res = await InstructorService.deleteCourse(id)
    await load()
    return res
  }

  return { courses, loading, load, createCourse, updateCourse, deleteCourse }
}

export default useCourses
