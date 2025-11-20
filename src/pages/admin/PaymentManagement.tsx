import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/services/supabase'
import type { Database } from '@/types/database'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { Download, RefreshCw, Wallet } from 'lucide-react'

type PaymentRow = Database['public']['Tables']['payments']['Row']

export const PaymentManagement = () => {
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<PaymentRow['status'] | 'all'>('all')

  const loadPayments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      setPayments(data || [])
      setError(null)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments()
  }, [])

  const filteredPayments = useMemo(() => (
    statusFilter === 'all' ? payments : payments.filter((p) => p.status === statusFilter)
  ), [payments, statusFilter])

  const totals = useMemo(() => {
    const totalAmount = filteredPayments.reduce((acc, payment) => acc + Number(payment.amount || 0), 0)
    const grouped = filteredPayments.reduce<Record<string, number>>((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1
      return acc
    }, {})
    return { totalAmount, grouped }
  }, [filteredPayments])

  const statusClassMap: Record<PaymentRow['status'], string> = {
    pending: 'pill bg-amber-50 text-amber-600',
    success: 'pill bg-emerald-50 text-emerald-600',
    failed: 'pill bg-red-50 text-red-600',
    refunded: 'pill bg-slate-100 text-slate-700',
  }

  return (
    <div>
      <AdminPageHeader
        title="Payment Management"
        subtitle="Track revenue, refund requests, and Paystack confirmations in one view."
        actions={(
          <div className="flex gap-3">
            <Button size="sm" variant="ghost" className="gap-2" onClick={loadPayments} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Download size={16} />
              Export CSV
            </Button>
          </div>
        )}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-text-light">Settled revenue</p>
          <div className="mt-2 flex items-center gap-3">
            <Wallet className="text-primary" />
            <p className="text-3xl font-semibold text-slate-900">₦{totals.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
          <p className="mt-1 text-xs text-text-light">Sum of filtered payments</p>
        </Card>
        {['success', 'pending', 'failed'].map((status) => (
          <Card key={status} className="p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-text-light">{status}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{totals.grouped[status] || 0}</p>
            <p className="mt-1 text-xs text-text-light">Latest 100 payments</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 flex flex-wrap items-center gap-4">
        <label className="text-sm text-text-light">Status filter</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PaymentRow['status'] | 'all')}
          className="rounded-2xl border border-gray-200 px-4 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <p className="text-xs text-text-light">{filteredPayments.length} records</p>
      </Card>

      {error && <Card className="mt-4 p-4 text-sm text-red-600">{error}</Card>}

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-[0.2em] text-text-light">
              <th className="p-3">Student</th>
              <th className="p-3">Course</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Reference</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="border-t border-slate-100">
                <td className="p-3 text-sm font-medium text-slate-900">{payment.student_id}</td>
                <td className="p-3 text-sm text-text-light">{payment.course_id}</td>
                <td className="p-3 text-sm text-slate-900">₦{Number(payment.amount).toLocaleString()}</td>
                <td className="p-3 text-xs">
                  <span className={statusClassMap[payment.status] || statusClassMap.success}>{payment.status}</span>
                </td>
                <td className="p-3 text-xs text-text-light">{payment.paystack_reference}</td>
                <td className="p-3 text-xs text-text-light">{new Date(payment.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filteredPayments.length === 0 && (
          <div className="p-4 text-center text-sm text-text-light">No payments found.</div>
        )}
      </Card>
    </div>
  )
}

