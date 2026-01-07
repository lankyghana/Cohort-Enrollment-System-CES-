import { useMemo, useRef, useEffect, useState } from 'react'
import clsx from 'clsx'

interface Tab {
  key: string
  label: string
}

interface Props {
  tabs: Tab[]
  value?: string
  defaultValue?: string
  onChange?: (key: string) => void
  ariaLabel?: string
  id?: string
  className?: string
}

export const Tabs = ({ tabs, value, defaultValue, onChange, ariaLabel = 'Tabs', id = 'tabs', className }: Props) => {
  const initial = defaultValue ?? tabs[0]?.key
  const [uncontrolled, setUncontrolled] = useState(initial)
  const active = value ?? uncontrolled
  const containerRef = useRef<HTMLDivElement | null>(null)
  const indicatorRef = useRef<HTMLDivElement | null>(null)

  const tabIndexByKey = useMemo(() => {
    const map = new Map<string, number>()
    tabs.forEach((t, index) => map.set(t.key, index))
    return map
  }, [tabs])

  const setActive = (key: string) => {
    if (value === undefined) setUncontrolled(key)
    onChange?.(key)
  }

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
    <div
      className={clsx(
        'relative inline-flex w-full flex-wrap gap-2 rounded-[28px] border border-white/60 bg-white/80 p-2 shadow-inner shadow-white/40',
        className
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      <div
        ref={indicatorRef}
        className="pointer-events-none absolute inset-y-2 left-2 h-[calc(100%-1rem)] rounded-[24px] bg-white shadow-soft transition-all duration-200 ease-out"
      />
      <div ref={containerRef} className="relative flex w-full flex-wrap gap-2">
        {tabs.map((t) => (
          // eslint-disable-next-line jsx-a11y/no-redundant-roles
          <button
            key={t.key}
            data-tab={t.key}
            id={`${id}-tab-${t.key}`}
            role="tab"
            type="button"
            aria-selected={t.key === active}
            aria-controls={`${id}-panel-${t.key}`}
            tabIndex={t.key === active ? 0 : -1}
            className={clsx(
              'relative z-10 min-h-[44px] rounded-[22px] px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              t.key === active ? 'text-primary' : 'text-text-soft'
            )}
            onClick={() => setActive(t.key)}
            onKeyDown={(e) => {
              const idx = tabIndexByKey.get(active) ?? 0
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End') {
                e.preventDefault()
              }

              if (e.key === 'ArrowRight') {
                const next = tabs[(idx + 1) % tabs.length]
                if (next) setActive(next.key)
              } else if (e.key === 'ArrowLeft') {
                const prev = tabs[(idx - 1 + tabs.length) % tabs.length]
                if (prev) setActive(prev.key)
              } else if (e.key === 'Home') {
                const first = tabs[0]
                if (first) setActive(first.key)
              } else if (e.key === 'End') {
                const last = tabs[tabs.length - 1]
                if (last) setActive(last.key)
              }
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

