interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
  text?: string
}

export const Loading = ({ size = 'md', fullScreen = false, text }: LoadingProps) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className={`animate-spin rounded-full border-b-2 border-primary ${sizes[size]}`} />
      {text && <p className="text-sm text-text-light">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {spinner}
      </div>
    )
  }

  return spinner
}

