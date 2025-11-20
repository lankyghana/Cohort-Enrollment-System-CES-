import { useCallback, useEffect, useState } from 'react'
import { CalendarPlus, Clock, Video } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { useAuth } from '@/hooks/useAuth'
import { fetchUpcomingSessions, type RoleScope } from '@/services/sessions'
import CreateSessionModal from '@/components/sessions/CreateSessionModal'

export const ScheduleManagement = () => {
  const { user, appUser, role } = useAuth()
  const scope: RoleScope = role === 'instructor' ? 'instructor' : 'admin'
  const [sessions, setSessions] = useState<Array<{ id: string; title: string; course_title: string; when: string; meeting_link: string | null }>>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSessions = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      const data = await fetchUpcomingSessions(scope, user?.id)
      setSessions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }, [scope, user?.id])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  return (
    <div>
      <AdminPageHeader
        title="Schedule Management"
        subtitle="Plan live sessions, monitor availability, and sync reminders with instructors."
        actions={<Button className="gap-2" onClick={() => setModalOpen(true)}><CalendarPlus size={16} /> Create session</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming sessions</h2>
            <Button variant="ghost" size="sm" onClick={loadSessions}>Refresh</Button>
          </div>
          <div className="mt-4 space-y-4">
            {loading && <p className="text-sm text-text-light">Loading upcoming sessions…</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!loading && !error && sessions.length === 0 && (
              <p className="text-sm text-text-light">No upcoming sessions yet. Create one to notify students.</p>
            )}
            {!loading && !error && sessions.map((session) => (
              <div key={session.id} className="flex flex-col gap-2 rounded-2xl border border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-text-light">Live session</p>
                  <h3 className="text-lg font-semibold text-slate-900">{session.title}</h3>
                  <p className="text-sm text-text-light">{session.course_title}</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-light">
                  <Clock size={16} /> {session.when}
                </div>
                {session.meeting_link ? (
                  <Button asChild size="sm" variant="outline" className="gap-2">
                    <a href={session.meeting_link} target="_blank" rel="noreferrer">
                      <Video size={14} /> Join link
                    </a>
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled>
                    No link
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900">Operating hours</h2>
          <p className="mt-2 text-sm text-text-light">Keep sessions within standard cohort windows.</p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span>Weekdays</span>
              <span className="text-text-light">09:00 - 19:00 WAT</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span>Saturday</span>
              <span className="text-text-light">10:00 - 14:00 WAT</span>
            </div>
            <div className="flex justify-between">
              <span>Sunday</span>
              <span className="text-text-light">Closed (on-demand)</span>
            </div>
          </div>
        </Card>
      </div>

      <CreateSessionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        role={scope}
        userId={user?.id}
        creatorName={appUser?.full_name || user?.email || undefined}
        onCreated={() => {
          setModalOpen(false)
          loadSessions()
        }}
      />
    </div>
  )
}

