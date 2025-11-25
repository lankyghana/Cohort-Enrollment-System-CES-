import clsx from 'clsx'

type Props = {
  src?: string | null
  alt?: string
  className?: string
}

export default function CourseThumbnail({ src, alt = 'Course thumbnail', className }: Props) {
  return (
    <div className={clsx('aspect-video w-full overflow-hidden rounded-[28px] bg-card-glow', className)}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover transition duration-300 ease-cinematic hover:scale-[1.03]" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-text-soft">Preview coming soon</div>
      )}
    </div>
  )
}

