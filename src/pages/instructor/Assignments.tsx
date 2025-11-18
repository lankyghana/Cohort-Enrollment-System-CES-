import React, { useEffect, useState } from 'react'
import AssignmentsService from '@/services/assignments'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function InstructorAssignments() {
  const [assignments, setAssignments] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await AssignmentsService.listAssignments()
        if (!mounted) return
        setAssignments(data || [])
      } catch (e) {
        console.error(e)
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Assignments</h2>
        <Link to="/instructor/assignments/new"><Button>Create assignment</Button></Link>
      </div>

      <div className="grid gap-4">
        {assignments.map(a => (
          <Card key={a.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">{a.title}</h3>
                <p className="text-sm text-text-light mt-2">{a.instructions}</p>
              </div>
              <div className="text-sm text-text-light">Due: {a.due_at ? new Date(a.due_at).toLocaleString() : '—'}</div>
            </div>
            <div className="mt-3">
              <Link to={`/instructor/assignments/${a.id}`}>View submissions</Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
