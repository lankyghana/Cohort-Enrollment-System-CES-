import React from 'react'
import type { User as AppUser } from '@/types'

const PersonalDetailsCard: React.FC<{ appUser?: AppUser | null }> = ({ appUser }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="text-sm font-semibold mb-3">Profile</h3>
      <dl className="text-sm text-gray-600 space-y-2">
        <div>
          <dt className="font-medium">Full name</dt>
          <dd>{appUser?.full_name ?? '—'}</dd>
        </div>
        <div>
          <dt className="font-medium">Email</dt>
          <dd>{appUser?.email ?? '—'}</dd>
        </div>
        <div>
          <dt className="font-medium">Phone</dt>
          <dd>{appUser?.phone ?? '—'}</dd>
        </div>
      </dl>
    </div>
  )
}

export default PersonalDetailsCard

