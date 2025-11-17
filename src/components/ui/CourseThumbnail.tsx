type Props = {
  src?: string | null
  alt?: string
  className?: string
}

// Standardized course thumbnail display for the SaaS-style dashboard.
export default function CourseThumbnail({ src, alt = 'Course thumbnail', className = '' }: Props) {
  return (
    <div className={`w-[369.8px] h-[160px] bg-[#F3F4F6] rounded-2xl overflow-hidden ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="object-cover w-full h-full transition-all duration-300 ease-out hover:scale-[1.02]" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No image</div>
      )}
    </div>
  )
}
