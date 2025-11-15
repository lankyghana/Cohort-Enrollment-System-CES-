import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import type { User as AppUser } from '@/types'

export const ProfileSettings = () => {
  const { appUser, setAppUser, user } = useAuthStore()
  const [fullName, setFullName] = useState(appUser?.full_name ?? '')
  const [phone, setPhone] = useState(appUser?.phone ?? '')
  const [bio, setBio] = useState(appUser?.bio ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFullName(appUser?.full_name ?? '')
    setPhone(appUser?.phone ?? '')
    setBio(appUser?.bio ?? '')
  }, [appUser])

  const save = async () => {
    if (!user) return
    setSaving(true)
    try {
      const updates: Partial<AppUser> = {
        full_name: fullName,
        phone: phone || null,
        bio: bio || null,
      }

      // Use the REST endpoint to perform the update to avoid strict generic
      // typing mismatch with the supabase-js client typings in this codebase.
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        const json = (await res.json()) as AppUser[]
        if (json && json.length > 0) setAppUser(json[0])
      }
    } catch (err) {
      // ignore errors for now
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Profile Settings</h1>

      <Card>
        <div className="space-y-3">
          <label className="block">
            <div className="text-sm font-medium mb-1">Full name</div>
            <input
              className="w-full border rounded px-3 py-2"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>

          <label className="block">
            <div className="text-sm font-medium mb-1">Phone</div>
            <input
              className="w-full border rounded px-3 py-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>

          <label className="block">
            <div className="text-sm font-medium mb-1">Bio</div>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>

          <div>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

