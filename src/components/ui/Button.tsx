import { ButtonHTMLAttributes, forwardRef, ReactElement } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, asChild, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-2xl font-semibold tracking-tight transition-all duration-300 ease-cinematic focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none transform';

    const variants = {
      primary: 'bg-primary text-white shadow-lift hover:bg-primary-soft hover:shadow-shell hover:-translate-y-0.5',
      secondary: 'bg-gradient-to-r from-primary to-fuchsia-500 text-white shadow-lift hover:shadow-shell hover:-translate-y-0.5',
      outline: 'border border-primary/30 bg-white text-primary shadow-none hover:border-primary hover:bg-primary/5 hover:-translate-y-0.5 hover:shadow-soft',
      ghost: 'text-text-soft hover:text-primary hover:bg-primary/5 hover:-translate-y-0.5',
      danger: 'bg-red-500 text-white shadow-lift hover:bg-red-600 hover:-translate-y-0.5',
    } as const

    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-sm md:text-base',
      lg: 'h-12 px-8 text-base md:text-lg',
    } as const

    const buttonClasses = clsx(baseStyles, variants[variant], sizes[size], className, {
      'cursor-wait': isLoading,
    })

    const Spinner = (
      <svg className="-ml-1 mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    )

    if (asChild && typeof children === 'object' && 'props' in (children as ReactElement)) {
      const child = children as ReactElement
      return (
        <child.type {...child.props} className={clsx(buttonClasses, child.props.className)}>
          {child.props.children}
        </child.type>
      )
    }

    return (
      <button ref={ref} className={buttonClasses} disabled={disabled || isLoading} {...props}>
        {isLoading && Spinner}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

