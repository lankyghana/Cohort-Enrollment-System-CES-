import { useState, useEffect, useCallback } from 'react'
import { instructorService } from '@/services/instructor'
import { useAuth } from '@/hooks/useAuth'
import type { Course } from '@/types'

export const useCourses = () => {
  const { appUser } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!appUser) return
    setLoading(true)
    const { data, error } = await instructorService.getCourses()
    if (!error) setCourses((data as Course[]) ?? [])
    setLoading(false)
  }, [appUser])

  useEffect(() => {
    load()
  }, [load])

  const createCourse = async (payload: Record<string, unknown>) => {
    // instructorService.createCourse handles authentication and instructor_id internally
    const res = await instructorService.createCourse(payload)
    await load()
    return res
  }

  const updateCourse = async (id: string, patch: Record<string, unknown>) => {
    const res = await instructorService.updateCourse(id, patch)
    await load()
    return res
  }

  const deleteCourse = async (id: string) => {
    const res = await instructorService.deleteCourse(id)
    await load()
    return res
  }

  return { courses, loading, load, createCourse, updateCourse, deleteCourse }
}

export default useCourses

