import { useEffect, useRef, useState } from 'react'

export const useInView = <T extends HTMLElement>(options?: IntersectionObserverInit) => {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setInView(true)
      })
    }, options)

    io.observe(node)
    return () => {
      io.unobserve(node)
      io.disconnect()
    }
  }, [options])

  return { ref, inView }
}

export default useInView

