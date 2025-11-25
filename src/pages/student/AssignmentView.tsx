import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/services/apiClient'
import { useAuthStore } from '@/store/authStore'
import { uploadFile } from '@/services/uploads'


interface Assignment {
  id: string
  title: string
  instructions: string
}

export default function AssignmentView() {
  const { id } = useParams<{ id: string }>()

  const { user } = useAuthStore()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [body, setBody] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    let mounted = true
    ;(async () => {
      try {
        const response = await apiClient.get<Assignment>(`/api/assignments/${id}`)
        if (!mounted) return
        setAssignment(response.data)
      } catch (e) {
        console.error(e)
      }
    })()
    return () => {
      mounted = false
    }
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id || !user) return
    setLoading(true)
    try {
      let fileUrl: string | undefined
      
      // Upload file first if provided
      if (file) {
        const uploadResult = await uploadFile(file)
        if (uploadResult.error) throw uploadResult.error
        fileUrl = uploadResult.data?.url
      }

      // Submit assignment with text and file URL
      await apiClient.post(`/api/assignments/${id}/submissions`, {
        body,
        file_url: fileUrl,
      })

      setBody('')
      setFile(null)
      alert('Submission created')
    } catch (err) {
      console.error(err)
      alert('Failed to submit')
    } finally {
      setLoading(false)
    }
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

