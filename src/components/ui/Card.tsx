import { HTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>((
  { className, variant = 'default', padding = 'md', children, ...props },
  ref,
) => {
  const baseStyles = 'rounded-[24px] transition-all duration-300 ease-cinematic border backdrop-blur-sm'

  const variants = {
    default: 'bg-white/95 border-white/80 shadow-card hover:shadow-shell hover:-translate-y-0.5',
    outlined: 'bg-white/70 border-white/60 shadow-inner hover:shadow-soft',
    elevated: 'bg-white border-white shadow-shell hover:-translate-y-1',
  }

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div ref={ref} className={clsx(baseStyles, variants[variant], paddings[padding], className)} {...props}>
      {children}
    </div>
  )
})

Card.displayName = 'Card'

