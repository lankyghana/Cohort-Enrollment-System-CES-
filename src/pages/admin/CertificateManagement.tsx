import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { Award, DownloadCloud } from 'lucide-react'

export const CertificateManagement = () => {
  const pending = [
    { id: 'cert-1', student: 'Ama Serwaa', course: 'Product Design', requested: 'Nov 15, 2025' },
    { id: 'cert-2', student: 'Kweku Mensah', course: 'Backend Engineering', requested: 'Nov 12, 2025' },
  ]

  return (
    <div>
      <AdminPageHeader
        title="Certificate Management"
        subtitle="Create templates, approve issuance, and export signed PDFs."
        actions={<Button className="gap-2"><Award size={16} /> New template</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-text-light">Issued this month</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">28</p>
          <p className="mt-1 text-xs text-text-light">+6 vs previous month</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-text-light">Pending approvals</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{pending.length}</p>
          <p className="mt-1 text-xs text-text-light">Awaiting verification</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-text-light">Templates</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">4 active</p>
          <Button variant="ghost" size="sm" className="mt-3 gap-2 text-primary">
            <DownloadCloud size={16} /> Export gallery
          </Button>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Pending issuance</h2>
          <Button size="sm" variant="outline">Approve batch</Button>
        </div>
        <div className="mt-4 space-y-4">
          {pending.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 rounded-2xl border border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-text-light">{item.course}</p>
                <h3 className="text-lg font-semibold text-slate-900">{item.student}</h3>
              </div>
              <p className="text-sm text-text-light">Requested {item.requested}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">Preview</Button>
                <Button size="sm">Approve</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

