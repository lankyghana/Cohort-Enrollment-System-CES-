import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AssignmentsService from '@/services/assignments'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function AssignmentSubmissions() {
  const { id } = useParams()
  const [submissions, setSubmissions] = useState<any[]>([])

  useEffect(() => {
    if (!id) return
    let mounted = true
    ;(async () => {
      try {
        const data = await AssignmentsService.listSubmissionsForAssignment(id)
        if (!mounted) return
        setSubmissions(data || [])
      } catch (e) { console.error(e) }
    })()
    return () => { mounted = false }
  }, [id])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Submissions</h2>
      <div className="grid gap-4">
        {submissions.map(s => (
          <Card key={s.id} className="p-4">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">Student: {s.user_id}</div>
                <div className="text-sm text-text-light">Submitted: {s.submitted_at}</div>
              </div>
              <div>
                <Button onClick={async () => { alert('Grade flow to implement') }}>Grade</Button>
              </div>
            </div>
            {s.submission_files?.map((f:any) => (
              <div key={f.id} className="mt-2 text-sm">
                File: {f.file_name}
              </div>
            ))}
            {s.body && <div className="mt-2 text-sm">{s.body}</div>}
          </Card>
        ))}
      </div>
    </div>
  )
}
