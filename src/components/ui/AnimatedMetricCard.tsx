import React from 'react'
import clsx from 'clsx'

interface Props {
  title: string
  value: React.ReactNode
  accent?: string
  description?: React.ReactNode
  className?: string
}

export const AnimatedMetricCard = ({
  title,
  value,
  accent,
  description,
  className,
}: Props) => {
  return (
    <div
      className={clsx(
        'metric-animate flex items-center justify-between rounded-[24px] border border-slate-200/80 bg-white/85 p-6',
        className
      )}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-600">{title}</p>
        <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
        {description ? <div className="mt-2 text-sm text-slate-600">{description}</div> : null}
      </div>
      {accent ? (
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white`}>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  )
}

export default AnimatedMetricCard

