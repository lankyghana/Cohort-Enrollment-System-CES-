import { useEffect, useState } from 'react'
import AssignmentsService from '@/services/assignments'
import { Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function InstructorAssignments() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const data = await AssignmentsService.listAssignments({ mineOnly: true })
        if (!mounted) return
        setAssignments(data || [])
        setError(null)
      } catch (e) {
        console.error(e)
        if (mounted) setError(e instanceof Error ? e.message : 'Unable to load assignments')
      }
      if (mounted) setLoading(false)
    })()
    return () => { mounted = false }
  }, [])

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Assignments</h2>
        <Link to="/instructor/assignments/new"><Button>Create assignment</Button></Link>
      </div>

      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      {loading ? (
        <p>Loading assignments…</p>
      ) : assignments.length === 0 ? (
        <Card className="p-6 text-center text-text-light">
          <p>No assignments yet. Click &ldquo;Create assignment&rdquo; to add your first brief.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map(a => (
            <Card key={a.id} className="p-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium">{a.title}</h3>
                  {a.instructions && (
                    <div
                      className="text-sm text-text-light mt-2 prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(a.instructions) }}
                    />
                  )}
                </div>
                <div className="text-sm text-text-light whitespace-nowrap">
                  Due: {a.due_at ? dateFormatter.format(new Date(a.due_at)) : '—'}
                </div>
              </div>
              <div className="mt-3 flex gap-3">
                <Link to={`/instructor/assignments/${a.id}`}><Button size="sm" variant="ghost">View submissions</Button></Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
