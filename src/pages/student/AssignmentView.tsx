import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AssignmentsService, { type Assignment } from '@/services/assignments'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/services/supabase'

export default function AssignmentView() {
  const { id } = useParams()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [body, setBody] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    let mounted = true
    ;(async () => {
      try {
        const a = await AssignmentsService.getAssignment(id)
        if (!mounted) return
        setAssignment(a)
      } catch (e) {
        console.error(e)
      }
    })()
    return () => { mounted = false }
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      const userId = authData.user?.id
      if (!userId) throw new Error('Not authenticated')
      const submission = await AssignmentsService.createSubmission({ assignment_id: id, user_id: userId, body })
      if (file) {
        const path = `assignments/${id}/${userId}/${file.name}`
        await AssignmentsService.uploadFile(path, file)
        await supabase.from('submission_files').insert([{
          submission_id: submission.id,
          storage_path: path,
          file_name: file.name,
          size_bytes: file.size,
        }])
      }
      setBody('')
      setFile(null)
      alert('Submission created')
    } catch (err) {
      console.error(err)
      alert('Failed to submit')
    } finally { setLoading(false) }
  }

  if (!assignment) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 max-w-3xl">
      <Card className="p-6">
        <h2 className="text-xl font-bold">{assignment.title}</h2>
        <p className="mt-2 text-sm text-text-light">{assignment.instructions}</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Text submission</label>
            <textarea className="w-full p-2 border rounded" rows={6} value={body} onChange={e => setBody(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">File</label>
            <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div>
            <Button type="submit" isLoading={loading}>Submit</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
