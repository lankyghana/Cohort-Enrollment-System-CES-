import { ReactNode } from 'react'
import clsx from 'clsx'

interface AdminPageHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
  actions?: ReactNode
  className?: string
}

export const AdminPageHeader = ({ title, subtitle, eyebrow = 'Admin Suite', actions, className }: AdminPageHeaderProps) => {
  return (
    <section className={clsx('glass-panel mb-6 flex flex-wrap items-start justify-between gap-4 p-6', className)}>
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-heading font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-text-light">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </section>
  )
}

export default AdminPageHeader
