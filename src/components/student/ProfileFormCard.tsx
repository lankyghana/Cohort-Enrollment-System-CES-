import React from 'react'
import { Button } from '@/components/ui/Button'
import type { User as AppUser } from '@/types'

type Props = {
  fullName: string
  phone: string
  bio: string
  setFullName: (v: string) => void
  setPhone: (v: string) => void
  setBio: (v: string) => void
  onSave: (overrides?: Partial<AppUser>) => Promise<void>
  saving?: boolean
}

const ProfileFormCard: React.FC<Props> = ({ fullName, phone, bio, setFullName, setPhone, setBio, onSave, saving }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Personal details</h2>
      <div className="grid grid-cols-1 gap-4">
        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Full name</div>
          <input
            className="w-full rounded-md border border-gray-200 px-3 py-2 transition-all duration-200 focus:ring-2 focus:ring-indigo-100"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>

        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Phone</div>
          <input
            className="w-full rounded-md border border-gray-200 px-3 py-2 transition-all duration-200 focus:ring-2 focus:ring-indigo-100"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>

        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Bio</div>
          <textarea
            className="w-full rounded-md border border-gray-200 px-3 py-2 transition-all duration-200 focus:ring-2 focus:ring-indigo-100"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
          />
        </label>

        <div className="pt-2">
          <Button onClick={() => onSave()} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProfileFormCard
