import React from 'react'

interface Props {
  title: string
  value: React.ReactNode
  accent?: string
}

export const AnimatedMetricCard = ({ title, value, accent = 'from-primary to-fuchsia-500' }: Props) => {
  return (
    <div className="metric-animate float-card flex items-center justify-between rounded-[24px] border border-white/70 bg-white/95">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-soft">{title}</p>
        <p className="mt-2 text-3xl font-bold text-text">{value}</p>
      </div>
      <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${accent} text-white shadow-soft flex items-center justify-center`}>
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

export default AnimatedMetricCard
