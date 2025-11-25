import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/services/apiClient'

type Session = {
  id: string
  title: string
  description?: string | null
  meeting_link?: string | null
  scheduled_at: string
  duration_minutes: number
}

export const LiveSession = () => {
  const { id, sessionId } = useParams<{ id: string; sessionId?: string }>()
  const [sessions, setSessions] = useState<Session[]>([])
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchSessions = async () => {
      setLoading(true)
      setError(null)
      try {
        if (sessionId) {
          const response = await apiClient.get<Session>(`/api/sessions/${sessionId}`)
          setSession(response.data)
        } else {
          const response = await apiClient.get<Session[]>(`/api/courses/${id}/sessions`)
          setSessions(response.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch session data')
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [id, sessionId])

  if (loading) {
    return <div>Loading session...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  if (sessionId) {
    if (!session) return <div>Session not found.</div>
    return (
      <div>
        <h1 className="text-3xl font-heading font-bold mb-6">{session.title}</h1>
        <Card>
          <div className="p-6">
            <p className="mb-4">{session.description}</p>
            <a href={session.meeting_link || '#'} target="_blank" rel="noopener noreferrer">
              <Button disabled={!session.meeting_link}>Join Session</Button>
            </a>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Live Sessions</h1>
      {sessions.length === 0 ? (
        <Card>
          <p className="p-4 text-center">No live sessions scheduled for this course.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sessions.map((s) => (
            <Card key={s.id}>
              <div className="p-4 flex justify-between items-center">
                <div>
                  <h2 className="font-bold">{s.title}</h2>
                  <p className="text-sm text-gray-600">{new Date(s.scheduled_at).toLocaleString()}</p>
                </div>
                <a href={`/dashboard/courses/${id}/session/${s.id}`}>
                  <Button>View Details</Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


