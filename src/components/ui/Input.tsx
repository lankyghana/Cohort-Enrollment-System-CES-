import { InputHTMLAttributes, forwardRef, useId } from 'react'
import clsx from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId

    return (
      <div className="w-full space-y-2">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-[0.3em] text-text-soft">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full rounded-2xl border bg-white/80 px-5 py-3 text-sm font-medium text-text shadow-inner shadow-white/40 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10',
            error && 'border-red-400 text-red-600 focus:border-red-500 focus:ring-red-200',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          helperText && <p className="text-sm text-text-soft">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'


