import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import type { User as AppUser } from '@/types'
import { supabase } from '@/services/supabase'

export const ProfileSettings = () => {
  const { appUser, setAppUser, user } = useAuthStore()
  const [fullName, setFullName] = useState(appUser?.full_name ?? '')
  // phone handling: split into country code + local number for UI
  const [countryCode, setCountryCode] = useState('+233')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [bio, setBio] = useState(appUser?.bio ?? '')
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(appUser?.avatar_url ?? null)
  const [removeAvatar, setRemoveAvatar] = useState(false)

  useEffect(() => {
    setFullName(appUser?.full_name ?? '')
    // parse phone into country code and number if possible
    if (appUser?.phone) {
      const m = appUser.phone.match(/^(\+\d{1,3})\s*(.*)$/)
      if (m) {
        setCountryCode(m[1])
        setPhoneNumber(m[2] || '')
      } else {
        setPhoneNumber(appUser.phone)
      }
    } else {
      setPhoneNumber('')
    }
    setAvatarPreview(appUser?.avatar_url ?? null)
    setBio(appUser?.bio ?? '')
  }, [appUser])

  const uploadAvatar = async (file: File) => {
    if (!user) throw new Error('Not authenticated')
    const ext = file.name.split('.').pop()
    const path = `avatars/${user.id}-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (upErr) throw upErr
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
  }

  const save = async () => {
    if (!user) return
    setSaving(true)
    try {
      const updates: Partial<AppUser> = {
        full_name: fullName,
        bio: bio || null,
      }

      // handle phone: combine country code + phoneNumber
      const combinedPhone = `${countryCode} ${phoneNumber}`.trim()
      updates.phone = combinedPhone || null

      // handle avatar upload / removal
      if (removeAvatar) {
        updates.avatar_url = null
      } else if (avatarFile) {
        try {
          const publicUrl = await uploadAvatar(avatarFile)
          updates.avatar_url = publicUrl
        } catch (err) {
          console.error('Avatar upload failed', err)
        }
      }

      // Use the authenticated Supabase client to update the profile so RLS
      // policies that rely on the user's JWT are respected and changes persist.
      const { data: updated, error: updErr } = await (supabase as any)
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .maybeSingle()

      if (updErr) {
        console.error('Profile update failed', updErr)
      }

      if (updated) {
        setAppUser(updated as AppUser)
      }
    } catch (err) {
      // ignore errors for now
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = (f?: File) => {
    if (!f) return
    setAvatarFile(f)
    setRemoveAvatar(false)
    const url = URL.createObjectURL(f)
    setAvatarPreview(url)
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    setRemoveAvatar(true)
  }

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Profile Settings</h1>

      <Card>
        <div className="space-y-3 px-6 py-6 rounded-2xl shadow-sm">
          {/* Avatar upload */}
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl text-gray-400">{(fullName && fullName.charAt(0)) || 'U'}</div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center px-3 py-1 bg-white rounded-md shadow-sm cursor-pointer hover:shadow-md">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleAvatarChange(f)
                  }}
                />
                <span className="text-sm text-gray-700">Upload photo</span>
              </label>
              <button type="button" onClick={handleRemoveAvatar} className="text-sm text-red-600">Remove photo</button>
              <div className="text-sm text-gray-500">Recommended: 400×400, jpg/png/webp</div>
            </div>
          </div>

          <label className="block">
            <div className="text-sm font-medium mb-1">Full name</div>
            <input
              className="w-full rounded-md border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>

          <label className="block">
            <div className="text-sm font-medium mb-1">Phone</div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full sm:w-40 rounded-md border border-gray-200 px-3 py-2 bg-white"
              >
                <option value="+1">+1 (US)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+233">+233 (GH)</option>
                <option value="+234">+234 (NG)</option>
                <option value="+91">+91 (IN)</option>
                <option value="+61">+61 (AU)</option>
                <option value="+49">+49 (DE)</option>
              </select>

              <input
                className="flex-1 rounded-md border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone number"
              />
            </div>
          </label>

          <label className="block">
            <div className="text-sm font-medium mb-1">Bio</div>
            <textarea
              className="w-full rounded-md border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
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

