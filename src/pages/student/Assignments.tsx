import React, { useEffect, useState } from 'react'
import AssignmentsService from '@/services/assignments'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'

export default function StudentAssignments() {
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
      <h2 className="text-2xl font-bold mb-6">Assignments</h2>
      <div className="grid gap-4">
        {assignments.map(a => (
          <Card key={a.id} className="p-4">
            <h3 className="text-lg font-medium">{a.title}</h3>
            <p className="text-sm text-text-light mt-2">{a.instructions}</p>
            <div className="mt-3">
              <Link to={`/dashboard/assignments/${a.id}`}>View & Submit</Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
