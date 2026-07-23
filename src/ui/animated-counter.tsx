'use client'

import { useEffect, useState, useRef } from 'react'

export function AnimatedCounter({
  value, suffix = '', prefix = '', decimals = 0, duration = 1200,
}: {
  value: number | string; suffix?: string; prefix?: string; decimals?: number; duration?: number
}) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const counted = useRef(false)
  const numVal = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) || 0 : value

  useEffect(() => {
    if (!ref.current || counted.current) { setDisplay(numVal); return }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted.current) {
        counted.current = true
        const start = performance.now()
        const from = 0
        const step = (now: number) => {
          const elapsed = now - start
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
          setDisplay(from + (numVal - from) * eased)
          if (progress < 1) requestAnimationFrame(step)
          else setDisplay(numVal)
        }
        requestAnimationFrame(step)
      }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numVal, duration])

  return (
    <span ref={ref}>
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  )
}
