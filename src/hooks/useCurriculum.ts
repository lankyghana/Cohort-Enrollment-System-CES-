import { useState, useEffect, useCallback } from 'react'
import InstructorService from '@/services/instructor'
import type { CourseLesson, CourseSection } from '@/types'

export default function useCurriculum(courseId: string) {
  const [sections, setSections] = useState<CourseSection[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await InstructorService.getSectionsByCourse(courseId)
    if (!res.error) {
      const nextSections = (res.data || []) as CourseSection[]
      setSections(nextSections)
    }
    setLoading(false)
  }, [courseId])

  useEffect(() => {
    if (courseId) load()
  }, [courseId, load])

  const addSection = async (title = 'New Section') => {
    setSaving(true)
    const pos = sections.length
    const res = await InstructorService.createSection(courseId, title, pos)
    if (!res.error) await load()
    setSaving(false)
  }

  const updateSection = async (id: string, patch: Partial<CourseSection>) => {
    setSaving(true)
    const res = await InstructorService.updateSection(id, patch)
    if (!res.error) await load()
    setSaving(false)
  }

  const deleteSection = async (id: string) => {
    setSaving(true)
    const res = await InstructorService.deleteSection(id)
    if (!res.error) await load()
    setSaving(false)
  }

  const addLesson = async (
    sectionId: string,
    payload: Partial<Omit<CourseLesson, 'id' | 'section_id' | 'created_at' | 'updated_at'>> & Pick<CourseLesson, 'title'>
  ) => {
    setSaving(true)
    const res = await InstructorService.createLesson(sectionId, payload)
    if (!res.error) await load()
    setSaving(false)
  }

  const updateLesson = async (id: string, patch: Partial<CourseLesson>) => {
    setSaving(true)
    const res = await InstructorService.updateLesson(id, patch)
    if (!res.error) await load()
    setSaving(false)
  }

  const deleteLesson = async (id: string) => {
    setSaving(true)
    const res = await InstructorService.deleteLesson(id)
    if (!res.error) await load()
    setSaving(false)
  }

  const moveSection = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    const next = [...sections]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    // update positions locally for optimistic UI
    const normalized = next.map((s, i) => ({ ...s, position: i }))
    setSections(normalized)
    setSaving(true)
    // persist positions
    await Promise.all(
      normalized.map((s) => InstructorService.updateSection(s.id, { position: s.position }))
    )
    await load()
    setSaving(false)
  }

  const moveLesson = async (sectionId: string, fromIndex: number, toIndex: number) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return
    const nextLessons = [...(section.lessons || [])]
    const [moved] = nextLessons.splice(fromIndex, 1)
    nextLessons.splice(toIndex, 0, moved)
    setSaving(true)
    await Promise.all(
      nextLessons.map((lesson, i) => InstructorService.updateLesson(lesson.id, { position: i }))
    )
    await load()
    setSaving(false)
  }

  return {
    sections,
    loading,
    saving,
    load,
    addSection,
    updateSection,
    deleteSection,
    addLesson,
    updateLesson,
    deleteLesson,
    moveSection,
    moveLesson,
  }
}
