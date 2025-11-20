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
  const containerRef = useRef<HTMLDivElement | null>(null)
  const indicatorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const indicator = indicatorRef.current
    if (!container || !indicator) return
    const activeButton = container.querySelector<HTMLButtonElement>(`button[data-tab="${active}"]`)
    if (!activeButton) return
    indicator.style.width = `${activeButton.offsetWidth}px`
    indicator.style.transform = `translateX(${activeButton.offsetLeft}px)`
  }, [active, tabs])

  return (
    <div className="relative inline-flex w-full flex-wrap gap-2 rounded-[28px] border border-white/60 bg-white/80 p-2 shadow-inner shadow-white/40">
      <div ref={indicatorRef} className="pointer-events-none absolute inset-y-2 left-2 h-[calc(100%-1rem)] rounded-[24px] bg-white shadow-soft transition-all duration-300 ease-cinematic" />
      <div ref={containerRef} className="relative flex w-full flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            data-tab={t.key}
            className={`relative z-10 rounded-[22px] px-5 py-2 text-sm font-semibold transition-colors ${
              t.key === active ? 'text-primary' : 'text-text-soft'
            }`}
            onClick={() => {
              setActive(t.key)
              onChange?.(t.key)
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Tabs
