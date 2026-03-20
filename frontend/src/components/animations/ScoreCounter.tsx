import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface ScoreCounterProps {
  value: number
  color?: "green" | "red" | "amber"
  size?: "small" | "medium" | "large"
  pulse?: boolean
}

export function ScoreCounter({
  value,
  color = "green",
  size = "medium",
  pulse = false,
}: ScoreCounterProps) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 1500
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (value - start) * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }

    setDisplay((prev) => {
      start = prev
      requestAnimationFrame(tick)
      return prev
    })
  }, [value])

  const colorClasses = {
    green: "text-brand-primary",
    red: "text-brand-danger",
    amber: "text-brand-warning",
  }

  const sizeClasses = {
    small: "text-lg",
    medium: "text-2xl",
    large: "text-4xl",
  }

  return (
    <motion.span
      className={`font-mono font-semibold ${colorClasses[color]} ${sizeClasses[size]}`}
      animate={pulse ? { scale: [1, 1.05, 1] } : {}}
      transition={pulse ? { repeat: Infinity, duration: 2 } : {}}
    >
      {display}
    </motion.span>
  )
}
