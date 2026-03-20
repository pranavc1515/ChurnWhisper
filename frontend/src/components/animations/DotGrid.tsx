import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface DotGridProps {
  dotSize?: number
  gap?: number
  opacity?: number
  pingEnabled?: boolean
}

export function DotGrid({
  dotSize = 2,
  gap = 30,
  opacity = 0.15,
  pingEnabled = true,
}: DotGridProps) {
  const [pings, setPings] = useState<{ id: number; x: number; y: number }[]>([])

  useEffect(() => {
    if (!pingEnabled) return
    const addPing = () => {
      setPings((prev) => {
        const next = [
          ...prev,
          {
            id: Date.now(),
            x: Math.random() * 100,
            y: Math.random() * 100,
          },
        ]
        return next.slice(-3)
      })
    }
    const interval = setInterval(addPing, 2500)
    return () => clearInterval(interval)
  }, [pingEnabled])

  const cols = Math.ceil(100 / gap) + 1
  const rows = Math.ceil(100 / gap) + 1
  const dots = Array.from({ length: cols * rows }, (_, i) => ({
    id: i,
    x: (i % cols) * gap,
    y: Math.floor(i / cols) * gap,
  }))

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="h-full w-full" preserveAspectRatio="none">
        <defs>
          <pattern
            id="dot-grid"
            width={gap}
            height={gap}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={gap / 2}
              cy={gap / 2}
              r={dotSize}
              fill="currentColor"
              style={{ opacity }}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>
      {pingEnabled &&
        pings.map(({ id, x, y }) => (
          <motion.div
            key={id}
            className="absolute rounded-full border border-brand-primary"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: 40,
              height: 40,
              marginLeft: -20,
              marginTop: -20,
            }}
            initial={{ scale: 0.2, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1.5 }}
          />
        ))}
    </div>
  )
}
