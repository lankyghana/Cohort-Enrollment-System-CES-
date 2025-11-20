import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { CalendarPlus, Clock, Video } from 'lucide-react'

export const ScheduleManagement = () => {
  const upcoming = [
    { id: '1', title: 'Frontend Live Review', course: 'React Mastery', when: 'Tomorrow • 10:00 AM', type: 'Live session' },
    { id: '2', title: 'Data Structures AMA', course: 'Algorithms', when: 'Nov 22 • 4:00 PM', type: 'Q&A' },
  ]

  return (
    <div>
      <AdminPageHeader
        title="Schedule Management"
        subtitle="Plan live sessions, monitor availability, and sync reminders with instructors."
        actions={<Button className="gap-2"><CalendarPlus size={16} /> Create session</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming sessions</h2>
            <Button variant="ghost" size="sm">View calendar</Button>
          </div>
          <div className="mt-4 space-y-4">
            {upcoming.map((session) => (
              <div key={session.id} className="flex flex-col gap-2 rounded-2xl border border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-text-light">{session.type}</p>
                  <h3 className="text-lg font-semibold text-slate-900">{session.title}</h3>
                  <p className="text-sm text-text-light">{session.course}</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-light">
                  <Clock size={16} /> {session.when}
                </div>
                <Button size="sm" variant="outline" className="gap-2"><Video size={14} /> Link</Button>
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
    </div>
  )
}

