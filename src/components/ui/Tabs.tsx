import { useState, useRef, useEffect } from 'react'

interface Tab {
  key: string
  label: string
}

interface Props {
  tabs: Tab[]
  onChange?: (key: string) => void
}

export const Tabs = ({ tabs, onChange }: Props) => {
  const [active, setActive] = useState(tabs[0]?.key)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const indicatorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const idx = tabs.findIndex((t) => t.key === active)
    const wrapper = wrapperRef.current
    const indicator = indicatorRef.current
    if (!wrapper || !indicator) return
    const el = wrapper.children[idx] as HTMLElement
    if (!el) return
    indicator.style.width = `${el.offsetWidth}px`
    indicator.style.transform = `translateX(${el.offsetLeft}px)`
  }, [active, tabs])

  return (
    <div className="relative">
      <div ref={wrapperRef} className="flex gap-4 border-b pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`py-2 text-sm font-medium ${t.key === active ? 'text-gray-900' : 'text-gray-500'}`}
            onClick={() => { setActive(t.key); onChange?.(t.key) }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div ref={indicatorRef} className="absolute bottom-0 h-0.5 bg-indigo-500 tabs-indicator" />
    </div>
  )
}

export default Tabs
