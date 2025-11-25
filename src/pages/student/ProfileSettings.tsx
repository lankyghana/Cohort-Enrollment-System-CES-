import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import type { User as AppUser } from '@/types'
import apiClient from '@/services/apiClient'

export const ProfileSettings = () => {
  const { user: appUser, setUser: setAppUser } = useAuthStore()
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

  const save = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('full_name', fullName || '')
      formData.append('bio', bio || '')

      const combinedPhone = `${countryCode} ${phoneNumber}`.trim()
      formData.append('phone', combinedPhone || '')

      if (removeAvatar) {
        formData.append('remove_avatar', 'true')
      } else if (avatarFile) {
        formData.append('avatar', avatarFile)
      }

      const { data: updated } = await apiClient.post('/api/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

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
    <div className="relative min-h-screen overflow-hidden pb-16">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-br from-indigo-700 via-purple-700 to-slate-900" />

      <div className="relative z-10 container-custom pt-10">
        <div className="mb-8 text-white">
          <span className="pill bg-white/20 text-white/80">Profile</span>
          <h1 className="mt-3 text-3xl font-heading font-semibold">Personalize your cohort identity</h1>
          <p className="text-white/80">Details sync directly to the backend so instructors recognize you instantly.</p>
        </div>

        <Card className="glass-panel !bg-white/95 !border-white/40">
          <div className="grid gap-8 p-6 lg:grid-cols-[280px,_1fr]">
            <div className="space-y-4">
              <div className="text-sm font-medium text-slate-500">Avatar</div>
              <div className="flex flex-col items-start gap-4">
                <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-full bg-slate-100">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl text-slate-400">{(fullName && fullName.charAt(0)) || 'U'}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) handleAvatarChange(f)
                      }}
                    />
                    Upload photo
                  </label>
                  <button type="button" onClick={handleRemoveAvatar} className="text-sm text-red-600">
                    Remove photo
                  </button>
                  <p className="text-xs text-slate-500">Recommended 400×400 JPG, PNG or WEBP.</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <label className="block">
                <div className="text-sm font-medium text-slate-600">Full name</div>
                <input
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </label>

              <div>
                <div className="text-sm font-medium text-slate-600">Phone</div>
                <div className="mt-1 flex flex-col gap-3 sm:flex-row">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:w-48"
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
                    className="w-full flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <label className="block">
                <div className="text-sm font-medium text-slate-600">Bio</div>
                <textarea
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
              </label>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                <span>Changes sync instantly once you hit save.</span>
                <span className="pill bg-white text-slate-600">Secure</span>
              </div>

              <div className="flex justify-end">
                <Button onClick={save} disabled={saving}>
                  {saving ? 'Saving...' : 'Save profile'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}


