import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface CountUpProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function CountUp({
  value,
  duration = 2,
  prefix = "",
  suffix = "",
  className = "",
}: CountUpProps) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start = 0
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (value - start) * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }

    setDisplay((prev) => {
      start = prev
      requestAnimationFrame(tick)
      return prev
    })
  }, [value, duration])

  return (
    <motion.span
      className={`font-mono font-semibold ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      {prefix}
      {display}
      {suffix}
    </motion.span>
  )
}
