import React from 'react'

type Props = {
  avatarUrl?: string | null
  fullName: string
  email?: string
}

const ProfileHeaderCard: React.FC<Props> = ({ avatarUrl, fullName, email }) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl text-gray-400">
              {fullName?.charAt(0) ?? 'U'}
            </div>
          )}
        </div>
        <div>
          <div className="text-xl font-semibold">{fullName}</div>
          <div className="text-sm text-gray-500">{email}</div>
          <div className="mt-3 flex items-center gap-2">
            <button className="text-sm px-3 py-1 bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-200">
              Share profile
            </button>
            <button className="text-sm px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors">
              Edit visibility
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileHeaderCard

