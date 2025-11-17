import { useEffect, useRef, useState } from 'react'

export const useInView = <T extends HTMLElement>(options?: IntersectionObserverInit) => {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const node = ref.current
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setInView(true)
      })
    }, options)

    io.observe(node)
    return () => io.disconnect()
  }, [ref.current])

  return { ref, inView }
}

export default useInView
