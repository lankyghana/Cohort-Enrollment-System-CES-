import React from 'react'

interface Props {
  title: string
  value: React.ReactNode
  accent?: string
}

export const AnimatedMetricCard = ({ title, value, accent = 'bg-indigo-500' }: Props) => {
  return (
    <div className="metric-animate float-card p-4 flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${accent}`}>
        {/* simple icon placeholder */}
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

export default AnimatedMetricCard
