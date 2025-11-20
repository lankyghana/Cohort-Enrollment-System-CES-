import React, { useState } from 'react'
import AssignmentsService from '@/services/assignments'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function NewAssignment() {
  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
      try {
        await AssignmentsService.createAssignment({ title, instructions, due_at: dueAt || undefined })
        navigate('/instructor/assignments')
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  return (
    <div className="p-6 max-w-2xl">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">New Assignment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} required />
          <div>
            <label className="block text-sm font-medium mb-1">Instructions</label>
            <textarea value={instructions} onChange={e => setInstructions(e.target.value)} className="w-full p-2 border rounded" rows={6} />
          </div>
          <Input label="Due date" type="datetime-local" value={dueAt} onChange={e => setDueAt(e.target.value)} />
          <div>
            <Button type="submit" isLoading={loading}>Create</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
