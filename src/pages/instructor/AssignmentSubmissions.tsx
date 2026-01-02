import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { assignmentsService } from '@/services/assignments'
import { Card } from '@/components/ui/Card'
import { GradeSubmissionModal } from '@/components/instructor/GradeSubmissionModal'
import type { SubmissionWithFiles } from '@/types'

export default function AssignmentSubmissions() {
  const { id } = useParams()
  const [submissions, setSubmissions] = useState<SubmissionWithFiles[]>([])

  const load = async (assignmentId: string) => {
    const data = await assignmentsService.listSubmissionsForAssignment(assignmentId)
    setSubmissions(data || [])
  }

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        await load(id)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [id])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Submissions</h2>
      <div className="grid gap-4">
        {submissions.map(s => (
          <Card key={s.id} className="p-4">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">
                  Student: {s.user?.full_name ?? s.user?.name ?? s.user?.email ?? s.user_id}
                </div>
                <div className="text-sm text-text-light">Submitted: {s.submitted_at}</div>
              </div>
              <div>
                <GradeSubmissionModal
                  submission={s}
                  onGraded={async () => {
                    if (!id) return
                    await load(id)
                  }}
                />
              </div>
            </div>

            {s.grade && (
              <div className="mt-2 text-sm text-text-light">
                Grade: {s.grade.score}/{s.grade.max_score}
              </div>
            )}

            {s.body && <div className="mt-2 text-sm">{s.body}</div>}
          </Card>
        ))}
      </div>
    </div>
  )
}

