import { useState, useEffect, useCallback } from 'react'
import InstructorService from '@/services/instructor'
import { useAuth } from '@/hooks/useAuth'

export const useCourses = () => {
  const { appUser } = useAuth()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!appUser) return
    setLoading(true)
    const { data, error } = await InstructorService.getCoursesByInstructor(appUser.id)
    if (!error) setCourses((data as any) ?? [])
    setLoading(false)
  }, [appUser])

  useEffect(() => {
    load()
  }, [load])

  const createCourse = async (payload: any) => {
    const res = await InstructorService.createCourse(payload)
    await load()
    return res
  }

  const updateCourse = async (id: string, patch: any) => {
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
