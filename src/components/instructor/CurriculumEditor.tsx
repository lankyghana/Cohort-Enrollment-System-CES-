import { useState } from 'react'
import useCurriculum from '@/hooks/useCurriculum'
import type { CourseLesson, CourseSection } from '@/types'

type Props = {
  courseId: string
}

export default function CurriculumEditor({ courseId }: Props) {
  const {
    sections,
    loading,
    saving,
    addSection,
    updateSection,
    deleteSection,
    addLesson,
    updateLesson,
    deleteLesson,
    moveSection,
    moveLesson,
  } = useCurriculum(courseId)

  const [editingSectionTitle, setEditingSectionTitle] = useState<Record<string, string>>({})
  const [newLessonTitle, setNewLessonTitle] = useState<Record<string, string>>({})

  if (loading) return <div>Loading curriculum…</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Curriculum</h2>
        <div>
          <button className="btn" onClick={() => addSection('New Section')} disabled={saving}>
            + Add Section
          </button>
        </div>
      </div>

      {sections.length === 0 && <div className="text-sm text-muted">No sections yet. Add one to get started.</div>}

      <div className="space-y-3">
        {sections.map((section: CourseSection, sIdx: number) => (
          <div key={section.id} className="p-3 border rounded">
            <div className="flex items-center gap-2 mb-2">
              <button
                className="text-sm px-2"
                onClick={() => moveSection(sIdx, Math.max(0, sIdx - 1))}
                disabled={sIdx === 0 || saving}
              >
                ↑
              </button>
              <button
                className="text-sm px-2"
                onClick={() => moveSection(sIdx, Math.min(sections.length - 1, sIdx + 1))}
                disabled={sIdx === sections.length - 1 || saving}
              >
                ↓
              </button>

              <input
                className="flex-1 border rounded px-2 py-1"
                value={editingSectionTitle[section.id] ?? section.title}
                onChange={(e) => setEditingSectionTitle({ ...editingSectionTitle, [section.id]: e.target.value })}
                onBlur={() => {
                  const newTitle = editingSectionTitle[section.id]
                  if (newTitle != null && newTitle !== section.title) updateSection(section.id, { title: newTitle })
                }}
              />

              <button className="text-sm text-red-600 px-2" onClick={() => deleteSection(section.id)} disabled={saving}>
                Delete
              </button>
            </div>

            <div className="pl-8">
              <div className="space-y-2">
                {(section.lessons || []).map((lesson: CourseLesson, lIdx: number) => (
                  <div key={lesson.id} className="flex items-center gap-2">
                    <button
                      className="text-sm px-2"
                      onClick={() => moveLesson(section.id, lIdx, Math.max(0, lIdx - 1))}
                      disabled={lIdx === 0 || saving}
                    >
                      ↑
                    </button>
                    <button
                      className="text-sm px-2"
                      onClick={() => moveLesson(section.id, lIdx, Math.min((section.lessons || []).length - 1, lIdx + 1))}
                      disabled={lIdx === (section.lessons || []).length - 1 || saving}
                    >
                      ↓
                    </button>

                    <input
                      className="flex-1 border rounded px-2 py-1"
                      value={lesson.title}
                      onChange={(e) => updateLesson(lesson.id, { title: e.target.value })}
                      disabled={saving}
                    />

                    <button className="text-sm text-red-600 px-2" onClick={() => deleteLesson(lesson.id)} disabled={saving}>
                      Remove
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 border rounded px-2 py-1"
                    placeholder="New lesson title"
                    value={newLessonTitle[section.id] ?? ''}
                    onChange={(e) => setNewLessonTitle({ ...newLessonTitle, [section.id]: e.target.value })}
                  />
                  <button
                    className="btn"
                    onClick={() => {
                      const title = newLessonTitle[section.id] ?? 'New Lesson'
                      addLesson(section.id, { title, position: (section.lessons || []).length, type: 'text' })
                      setNewLessonTitle({ ...newLessonTitle, [section.id]: '' })
                    }}
                    disabled={saving}
                  >
                    + Add Lesson
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {saving && <div className="text-sm text-muted">Saving…</div>}
    </div>
  )
}
