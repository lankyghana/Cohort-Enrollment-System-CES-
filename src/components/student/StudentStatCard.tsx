import React from 'react'

const iconMap: Record<string, string> = {
  book: '📚',
  check: '✅',
  award: '🏆',
  chart: '📈',
}

const StudentStatCard: React.FC<{ title: string; value: string; icon?: string }> = ({ title, value, icon = 'book' }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
      <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-2xl">
        {iconMap[icon] ?? '📘'}
      </div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  )
}

export default StudentStatCard
