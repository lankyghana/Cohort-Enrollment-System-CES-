import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import apiClient from '@/services/apiClient'
import { Award } from 'lucide-react'

type CertificateRow = {
  id: string
  student_name: string | null
  student_email: string | null
  course_title: string | null
  issued_at: string | null
  certificate_url: string
}

export const CertificateManagement = () => {
  const [items, setItems] = useState<CertificateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const { data } = await apiClient.get<CertificateRow[]>('/api/admin/certificates')
        if (!mounted) return
        setItems(Array.isArray(data) ? data : [])
      } catch (e: any) {
        if (!mounted) return
        setError(e?.response?.data?.message || 'Failed to load certificates')
        setItems([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div>
      <AdminPageHeader
        title="Certificate Management"
        subtitle="Generate and download certificate PDFs."
        actions={<Button className="gap-2"><Award size={16} /> New template</Button>}
      />

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/70 p-3 text-sm text-red-600">{error}</div>
      )}

      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Issued certificates</h2>
        </div>
        <div className="mt-4 space-y-4">
          {loading ? (
            <div className="py-10 text-center text-text-soft">Loading certificates…</div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-text-soft">No certificates issued yet.</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 rounded-2xl border border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-text-light">{item.course_title || 'Course'}</p>
                  <h3 className="text-lg font-semibold text-slate-900">{item.student_name || 'Student'}</h3>
                  {item.student_email && <p className="text-sm text-text-light">{item.student_email}</p>}
                </div>
                <p className="text-sm text-text-light">
                  Issued {item.issued_at ? new Date(item.issued_at).toLocaleDateString() : '—'}
                </p>
                <div className="flex gap-2">
                  <Button asChild size="sm">
                    <a href={item.certificate_url} target="_blank" rel="noreferrer">
                      Download PDF
                    </a>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}


