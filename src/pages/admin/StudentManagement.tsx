import { useEffect, useState } from 'react'
import { supabase } from '@/services/supabase'
import type { Database } from '@/types/database'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

type UserRow = Database['public']['Tables']['users']['Row']
type EnrollmentRow = Database['public']['Tables']['enrollments']['Row']
type ExtendedEnrollment = EnrollmentRow & { course_title?: string }

export const StudentManagement = () => {
  const [students, setStudents] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Record<string, EnrollmentRow[] | null>>({})
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [selectAll, setSelectAll] = useState(false)
  const [bulkRole, setBulkRole] = useState<UserRow['role'] | ''>('')

  // profile modal
  const [profileUser, setProfileUser] = useState<UserRow | null>(null)
  const [profileEnrollments, setProfileEnrollments] = useState<ExtendedEnrollment[] | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false })
        if (error) throw error
        if (mounted) setStudents(data || [])
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const filtered = students.filter((s) => {
    if (!query) return true
    const q = query.toLowerCase()
    return (s.email && s.email.toLowerCase().includes(q)) || (s.full_name && s.full_name.toLowerCase().includes(q))
  })

  const changeRole = async (id: string, role: UserRow['role']) => {
    if (!confirm(`Change role for this user to ${role}?`)) return
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('users').update({ role } as any).eq('id', id)
      if (error) throw error
      setStudents((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
    }
  }

  const toggleEnrollments = async (studentId: string) => {
    if (expanded[studentId]) {
      setExpanded((s) => ({ ...s, [studentId]: null }))
      return
    }

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('id, course_id, payment_status, enrolled_at')
        .eq('student_id', studentId)
        .order('enrolled_at', { ascending: false })

      if (error) throw error
      setExpanded((s) => ({ ...s, [studentId]: data || [] }))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
    }
  }

  // selection + bulk actions
  const toggleSelect = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }))
  }

  const handleSelectAll = () => {
    const next = !selectAll
    setSelectAll(next)
    const newSel: Record<string, boolean> = {}
    if (next) {
      students.forEach((u) => { newSel[u.id] = true })
    }
    setSelected(newSel)
  }

  const applyBulkRole = async () => {
    const selectedIds = Object.keys(selected).filter((id) => selected[id])
    if (!bulkRole || selectedIds.length === 0) return
    if (!confirm(`Set role for ${selectedIds.length} users to ${bulkRole}?`)) return
  try {
  setLoading(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('users').update({ role: bulkRole } as any).in('id', selectedIds)
      if (error) throw error
      setStudents((prev) => prev.map((u) => (selected[u.id] ? { ...u, role: bulkRole } : u)))
      setSelected({})
      setSelectAll(false)
      setBulkRole('')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const exportSelectedCSV = () => {
    const rows = students.filter((s) => selected[s.id])
    if (rows.length === 0) return
    const header = ['id','full_name','email','role','created_at']
    const csv = [header.join(','), ...rows.map(r => [r.id, `"${(r.full_name||'').replace(/"/g,'""')}"`, r.email, r.role, r.created_at].join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `students-${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  // profile modal
  const openProfile = async (user: UserRow) => {
    setProfileUser(user)
    setProfileEnrollments(null)
    setProfileLoading(true)
    try {
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select('id, course_id, payment_status, enrolled_at')
        .eq('student_id', user.id)
        .order('enrolled_at', { ascending: false })

      if (error) throw error
      const ens: EnrollmentRow[] = enrollments || []
      const courseIds = Array.from(new Set(ens.map((e) => e.course_id))).filter(Boolean)
      const courseMap: Record<string, string> = {}
      if (courseIds.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await (supabase as any).from('courses').select('id,title').in('id', courseIds)
        const coursesArr = res.data || []
        coursesArr.forEach((c: { id: string; title: string }) => { courseMap[c.id] = c.title })
      }
      const ext = ens.map((e) => ({ ...e, course_title: courseMap[e.course_id] }))
      setProfileEnrollments(ext)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
    } finally {
      setProfileLoading(false)
    }
  }

  const closeProfile = () => {
    setProfileUser(null)
    setProfileEnrollments(null)
  }

  return (
    <div>
      <AdminPageHeader
        title="Student Management"
        subtitle="Audit enrollments, promote instructors, and export cohort data."
        actions={(
          <Button size="sm" variant="outline" onClick={exportSelectedCSV}>
            Export CSV
          </Button>
        )}
      />

      <Card className="mb-6 flex flex-wrap items-center gap-4">
        <div className="w-full flex-1 min-w-[220px]">
          <Input placeholder="Search by name or email" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm text-text-light">
          <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="h-4 w-4" />
          Select all
        </label>
        <select value={bulkRole} onChange={(e) => setBulkRole(e.target.value as UserRow['role'] || '')} className="rounded-2xl border border-gray-200 px-4 py-2 text-sm">
          <option value="">Bulk role...</option>
          <option value="student">student</option>
          <option value="instructor">instructor</option>
          <option value="admin">admin</option>
        </select>

        <Button size="sm" variant="primary" onClick={applyBulkRole} disabled={!bulkRole}>Apply</Button>
      </Card>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}

      <div className="space-y-4">
        {filtered.map((s) => (
          <Card key={s.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input type="checkbox" checked={!!selected[s.id]} onChange={() => toggleSelect(s.id)} className="w-4 h-4" />
                <div>
                  <div className="font-semibold text-gray-800">{s.full_name || '(no name)'} <span className="text-xs text-gray-500">{s.email}</span></div>
                  <div className="text-xs text-gray-400">Joined: {new Date(s.created_at).toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select value={s.role} onChange={(e) => changeRole(s.id, e.target.value as UserRow['role'])} className="px-3 py-2 rounded-2xl border border-gray-200">
                  <option value="student">student</option>
                  <option value="instructor">instructor</option>
                  <option value="admin">admin</option>
                </select>
                <Button size="sm" variant="secondary" onClick={() => toggleEnrollments(s.id)}>Enrollments</Button>
                <Button size="sm" variant="ghost" onClick={() => openProfile(s)}>View profile</Button>
              </div>
            </div>

            {expanded[s.id] && (
              <div className="mt-4 border-t pt-4">
                <div className="text-sm text-gray-600">Enrollments:</div>
                {expanded[s.id]!.length === 0 && <div className="text-xs text-gray-500">No enrollments</div>}
                {expanded[s.id]!.map((en) => (
                  <div key={en.id} className="flex items-center justify-between mt-3">
                    <div className="text-sm">Course ID: {en.course_id}</div>
                    <div className="text-xs text-gray-500">{en.payment_status} • {new Date(en.enrolled_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
      {/* Profile modal (simple) */}
      {profileUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="glass-panel w-11/12 max-w-2xl p-6">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-semibold">{profileUser.full_name || '(no name)'} <span className="text-sm text-gray-500">{profileUser.email}</span></h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={closeProfile}>Close</Button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-sm text-gray-600">Role: {profileUser.role}</div>
              <div className="text-sm text-gray-600">Joined: {new Date(profileUser.created_at).toLocaleString()}</div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Enrollments</h3>
              {profileLoading && <div>Loading…</div>}
              {profileEnrollments && profileEnrollments.length === 0 && <div className="text-xs text-gray-500">No enrollments</div>}
              {profileEnrollments && profileEnrollments.map((en) => (
                <div key={en.id} className="mt-3 border-t pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{en.course_title || en.course_id}</div>
                      <div className="text-xs text-gray-500">{en.payment_status} • {new Date(en.enrolled_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

