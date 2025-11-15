import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/services/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

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

  useEffect(() => {
    if (!id) return

    const fetchSessions = async () => {
      try {
        if (sessionId) {
          const { data } = await supabase.from('course_sessions').select('*').eq('id', sessionId).single()
          if (data) setSession(data as Session)
        } else {
          const { data } = await supabase
            .from('course_sessions')
            .select('*')
            .eq('course_id', id)
            .order('scheduled_at', { ascending: true })
          setSessions((data as Session[]) || [])
        }
      } catch (err) {
        // ignore errors for now
      }
    }

    fetchSessions()
  }, [id, sessionId])

  if (sessionId) {
    if (!session) return <div>Loading session...</div>
    return (
      <div>
        <h1 className="text-3xl font-heading font-bold mb-6">{session.title}</h1>
        <Card>
          <p className="text-text-light mb-2">{session.description}</p>
          <p className="text-text-light text-sm">Scheduled: {new Date(session.scheduled_at).toLocaleString()}</p>
          <div className="mt-4">
            {session.meeting_link ? (
              <Button onClick={() => window.open(session.meeting_link!, '_blank')}>Join Session</Button>
            ) : (
              <div className="text-text-light">No meeting link available.</div>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Live Sessions</h1>
      <div className="space-y-3">
        {sessions.map((s) => (
          <Card key={s.id}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{s.title}</div>
                <div className="text-text-light text-sm">{new Date(s.scheduled_at).toLocaleString()}</div>
              </div>
              <div className="space-x-2">
                <Button asChild>
                  <a href={s.meeting_link ?? '#'} target="_blank" rel="noreferrer">Join</a>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

