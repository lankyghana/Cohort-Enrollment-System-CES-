import { useState, useEffect, useCallback } from 'react'
import type { CourseLesson, CourseSection } from '@/types'

export default function useCurriculum(courseId: string) {
  const [sections, setSections] = useState<CourseSection[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const storageKey = `curriculum:${courseId}`

  const persist = useCallback(
    (next: CourseSection[]) => {
      setSections(next)
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {
        // ignore storage errors
      }
    },
    [storageKey]
  )

  const newId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return (crypto as Crypto).randomUUID()
    }
    return `id-${Date.now()}-${Math.floor(Math.random() * 100000)}`
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) {
        setSections([])
        return
      }
      const parsed = JSON.parse(raw) as CourseSection[]
      setSections(Array.isArray(parsed) ? parsed : [])
    } catch {
      setSections([])
    }
    setLoading(false)
  }, [storageKey])

  useEffect(() => {
    if (courseId) load()
  }, [courseId, load])

  const addSection = async (title = 'New Section') => {
    setSaving(true)
    const now = new Date().toISOString()
    const next: CourseSection[] = [
      ...sections,
      {
        id: newId(),
        course_id: courseId,
        title,
        description: null,
        position: sections.length,
        created_at: now,
        updated_at: now,
        lessons: [],
      },
    ]
    persist(next)
    setSaving(false)
  }

  const updateSection = async (id: string, patch: Partial<CourseSection>) => {
    setSaving(true)
    const now = new Date().toISOString()
    const next = sections.map((s) => (s.id === id ? { ...s, ...patch, updated_at: now } : s))
    persist(next)
    setSaving(false)
  }

  const deleteSection = async (id: string) => {
    setSaving(true)
    const next = sections.filter((s) => s.id !== id).map((s, i) => ({ ...s, position: i }))
    persist(next)
    setSaving(false)
  }

  const addLesson = async (
    _sectionId: string,
    payload: Partial<Omit<CourseLesson, 'id' | 'section_id' | 'created_at' | 'updated_at'>> & Pick<CourseLesson, 'title'>
  ) => {
    setSaving(true)
    const now = new Date().toISOString()
    const next = sections.map((s) => {
      if (s.id !== _sectionId) return s
      const lessons = [...(s.lessons || [])]
      lessons.push({
        id: newId(),
        section_id: _sectionId,
        title: payload.title,
        description: payload.description ?? null,
        type: payload.type ?? 'text',
        content: payload.content ?? null,
        position: payload.position ?? lessons.length,
        created_at: now,
        updated_at: now,
      })
      const normalized = lessons.map((l, i) => ({ ...l, position: i }))
      return { ...s, lessons: normalized, updated_at: now }
    })
    persist(next)
    setSaving(false)
  }

  const updateLesson = async (id: string, patch: Partial<CourseLesson>) => {
    setSaving(true)
    const now = new Date().toISOString()
    const next = sections.map((s) => {
      const lessons = (s.lessons || []).map((l) => (l.id === id ? { ...l, ...patch, updated_at: now } : l))
      return lessons === s.lessons ? s : { ...s, lessons, updated_at: now }
    })
    persist(next)
    setSaving(false)
  }

  const deleteLesson = async (id: string) => {
    setSaving(true)
    const now = new Date().toISOString()
    const next = sections.map((s) => {
      const lessons = (s.lessons || []).filter((l) => l.id !== id).map((l, i) => ({ ...l, position: i }))
      return lessons === s.lessons ? s : { ...s, lessons, updated_at: now }
    })
    persist(next)
    setSaving(false)
  }

  const moveSection = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    const next = [...sections]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    // update positions locally for optimistic UI
    const normalized = next.map((s, i) => ({ ...s, position: i }))
    setSaving(true)
    persist(normalized)
    setSaving(false)
  }

  const moveLesson = async (sectionId: string, fromIndex: number, toIndex: number) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return
    const nextLessons = [...(section.lessons || [])]
    const [moved] = nextLessons.splice(fromIndex, 1)
    nextLessons.splice(toIndex, 0, moved)
    setSaving(true)
    const now = new Date().toISOString()
    const normalized = nextLessons.map((lesson, i) => ({ ...lesson, position: i, updated_at: now }))
    const next = sections.map((s) => (s.id === sectionId ? { ...s, lessons: normalized, updated_at: now } : s))
    persist(next)
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

