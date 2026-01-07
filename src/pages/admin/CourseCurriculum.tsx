import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import apiClient from '@/services/apiClient'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'

type CurriculumLesson = {
  id?: string
  title: string
  description?: string | null
  content?: string | null
  order_index?: number
  topics: string[]
  learning_outcomes: string[]
}

type CurriculumModule = {
  id?: string
  title: string
  description?: string | null
  order_index?: number
  lessons: CurriculumLesson[]
}

type CurriculumResponse = {
  course_id: string
  duration_value: number | null
  duration_unit: 'weeks' | 'months' | null
  modules: Array<{
    id: string
    title: string
    description: string | null
    order_index: number
    lessons: Array<{
      id: string
      title: string
      description: string | null
      content: string | null
      order_index: number
      topics: string[]
      learning_outcomes: string[]
    }>
  }>
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (typeof err !== 'object' || err === null) return fallback

  const record = err as Record<string, unknown>

  const response = record.response
  if (typeof response === 'object' && response !== null) {
    const responseRecord = response as Record<string, unknown>
    const data = responseRecord.data
    if (typeof data === 'object' && data !== null) {
      const dataRecord = data as Record<string, unknown>
      const message = dataRecord.message
      if (typeof message === 'string' && message.trim()) return message
    }
  }

  const message = record.message
  if (typeof message === 'string' && message.trim()) return message

  return fallback
}

function splitList(value: string): string[] {
  return value
    .split(/[,\n]/g)
    .map((s) => s.trim())
    .filter(Boolean)
}

function joinList(values: string[]): string {
  return (values || []).join(', ')
}

export function CourseCurriculum() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [durationValue, setDurationValue] = useState<number | ''>('')
  const [durationUnit, setDurationUnit] = useState<'weeks' | 'months' | ''>('')
  const [modules, setModules] = useState<CurriculumModule[]>([])

  const canSave = useMemo(() => {
    if (!id) return false
    for (const m of modules) {
      if (!m.title?.trim()) return false
      for (const l of m.lessons) {
        if (!l.title?.trim()) return false
      }
    }
    return true
  }, [id, modules])

  useEffect(() => {
    let mounted = true

    async function load() {
      if (!id) return
      setLoading(true)
      setError(null)

      try {
        const { data } = await apiClient.get<CurriculumResponse>(`/api/courses/${id}/curriculum`)
        if (!mounted) return

        setDurationValue(data.duration_value ?? '')
        setDurationUnit(data.duration_unit ?? '')
        setModules(
          (data.modules || []).map((m) => ({
            id: m.id,
            title: m.title,
            description: m.description,
            order_index: m.order_index,
            lessons: (m.lessons || []).map((l) => ({
              id: l.id,
              title: l.title,
              description: l.description,
              content: l.content,
              order_index: l.order_index,
              topics: l.topics || [],
              learning_outcomes: l.learning_outcomes || [],
            })),
          }))
        )
      } catch (e: unknown) {
        if (!mounted) return
        setError(getErrorMessage(e, 'Failed to load curriculum'))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [id])

  function updateModule(index: number, patch: Partial<CurriculumModule>) {
    setModules((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)))
  }

  function removeModule(index: number) {
    setModules((prev) => prev.filter((_, i) => i !== index))
  }

  function addModule() {
    setModules((prev) => [
      ...prev,
      {
        title: 'New module',
        description: null,
        lessons: [],
      },
    ])
  }

  function updateLesson(moduleIndex: number, lessonIndex: number, patch: Partial<CurriculumLesson>) {
    setModules((prev) =>
      prev.map((m, i) => {
        if (i !== moduleIndex) return m
        const lessons = m.lessons.map((l, li) => (li === lessonIndex ? { ...l, ...patch } : l))
        return { ...m, lessons }
      })
    )
  }

  function addLesson(moduleIndex: number) {
    setModules((prev) =>
      prev.map((m, i) => {
        if (i !== moduleIndex) return m
        return {
          ...m,
          lessons: [
            ...m.lessons,
            {
              title: 'New lesson',
              description: null,
              content: null,
              topics: [],
              learning_outcomes: [],
            },
          ],
        }
      })
    )
  }

  function removeLesson(moduleIndex: number, lessonIndex: number) {
    setModules((prev) =>
      prev.map((m, i) => {
        if (i !== moduleIndex) return m
        return { ...m, lessons: m.lessons.filter((_, li) => li !== lessonIndex) }
      })
    )
  }

  async function save() {
    if (!id) return

    if (!canSave) {
      setError('Please provide titles for all modules and lessons before saving.')
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      duration_value: durationValue === '' ? null : Number(durationValue),
      duration_unit: durationUnit === '' ? null : durationUnit,
      modules: modules.map((m, mi) => ({
        title: m.title,
        description: m.description ?? null,
        order_index: mi,
        lessons: m.lessons.map((l, li) => ({
          title: l.title,
          description: l.description ?? null,
          content: l.content ?? null,
          order_index: li,
          topics: l.topics ?? [],
          learning_outcomes: l.learning_outcomes ?? [],
        })),
      })),
    }

    try {
      const { data } = await apiClient.post<CurriculumResponse>(`/api/admin/courses/${id}/curriculum`, payload)
      setDurationValue(data.duration_value ?? '')
      setDurationUnit(data.duration_unit ?? '')
      setModules(
        (data.modules || []).map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          order_index: m.order_index,
          lessons: (m.lessons || []).map((l) => ({
            id: l.id,
            title: l.title,
            description: l.description,
            content: l.content,
            order_index: l.order_index,
            topics: l.topics || [],
            learning_outcomes: l.learning_outcomes || [],
          })),
        }))
      )
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to save curriculum'))
    } finally {
      setSaving(false)
    }
  }

  if (!id) {
    return <div className="p-6">Course not found</div>
  }

  if (loading) {
    return (
      <div className="p-6">
        <Loading text="Loading curriculum…" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text">Curriculum</h1>
          <p className="text-sm text-text-soft">Manage modules and lessons for this course.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate('/admin/courses')}>
            Back
          </Button>
          <Button onClick={save} disabled={saving || !canSave}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Duration value"
            type="number"
            min={1}
            value={durationValue}
            onChange={(e) => setDurationValue(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 12"
          />

          <div>
            <label htmlFor="admin-course-duration-unit" className="text-xs font-semibold uppercase tracking-[0.3em] text-text-soft">
              Duration unit
            </label>
            <select
              id="admin-course-duration-unit"
              className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
              value={durationUnit}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || value === 'weeks' || value === 'months') {
                  setDurationUnit(value)
                }
              }}
            >
              <option value="">(none)</option>
              <option value="weeks">weeks</option>
              <option value="months">months</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={addModule} variant="ghost">
          Add module
        </Button>
      </div>

      {modules.length === 0 ? (
        <Card>
          <p className="text-sm text-text-soft">No curriculum yet. Add a module to get started.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {modules.map((m, mi) => (
            <Card key={m.id || mi}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 space-y-4">
                  <Input
                    label={`Module ${mi + 1} title`}
                    value={m.title}
                    onChange={(e) => updateModule(mi, { title: e.target.value })}
                  />

                  <div>
                    <label htmlFor={`admin-module-${mi}-desc`} className="text-xs font-semibold uppercase tracking-[0.3em] text-text-soft">
                      Module description
                    </label>
                    <textarea
                      id={`admin-module-${mi}-desc`}
                      className="mt-2 w-full min-h-[90px] rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-sm shadow-inner transition"
                      value={m.description ?? ''}
                      onChange={(e) => updateModule(mi, { description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button variant="ghost" onClick={() => addLesson(mi)}>
                    Add lesson
                  </Button>
                  <Button variant="ghost" onClick={() => removeModule(mi)}>
                    Remove
                  </Button>
                </div>
              </div>

              {m.lessons.length > 0 && (
                <div className="mt-6 space-y-4">
                  {m.lessons.map((l, li) => (
                    <Card key={l.id || li} variant="outlined" padding="md">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-4">
                          <Input
                            label={`Lesson ${li + 1} title`}
                            value={l.title}
                            onChange={(e) => updateLesson(mi, li, { title: e.target.value })}
                          />

                          <div>
                            <label htmlFor={`admin-lesson-${mi}-${li}-desc`} className="text-xs font-semibold uppercase tracking-[0.3em] text-text-soft">
                              Lesson description
                            </label>
                            <textarea
                              id={`admin-lesson-${mi}-${li}-desc`}
                              className="mt-2 w-full min-h-[80px] rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-sm shadow-inner transition"
                              value={l.description ?? ''}
                              onChange={(e) => updateLesson(mi, li, { description: e.target.value })}
                            />
                          </div>

                          <div>
                            <label htmlFor={`admin-lesson-${mi}-${li}-content`} className="text-xs font-semibold uppercase tracking-[0.3em] text-text-soft">
                              Content
                            </label>
                            <textarea
                              id={`admin-lesson-${mi}-${li}-content`}
                              className="mt-2 w-full min-h-[140px] rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-sm shadow-inner transition"
                              value={l.content ?? ''}
                              onChange={(e) => updateLesson(mi, li, { content: e.target.value })}
                            />
                          </div>

                          <Input
                            label="Topics (comma or newline separated)"
                            value={joinList(l.topics)}
                            onChange={(e) => updateLesson(mi, li, { topics: splitList(e.target.value) })}
                          />

                          <Input
                            label="Learning outcomes (comma or newline separated)"
                            value={joinList(l.learning_outcomes)}
                            onChange={(e) => updateLesson(mi, li, { learning_outcomes: splitList(e.target.value) })}
                          />
                        </div>

                        <Button variant="ghost" onClick={() => removeLesson(mi, li)}>
                          Remove
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
