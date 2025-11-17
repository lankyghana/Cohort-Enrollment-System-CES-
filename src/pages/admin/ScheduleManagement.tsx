import { Card } from '@/components/ui/Card'

export const ScheduleManagement = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Schedule Management</h1>
      </div>

      <Card className="p-6">
        <p className="text-gray-600">Schedule management interface will appear here. You can manage live sessions, upcoming events, and cohort calendars.</p>
      </Card>
    </div>
  )
}

