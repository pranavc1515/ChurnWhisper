import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface RadarPingProps {
  color?: "green" | "red"
  frequency?: number
  maxPings?: number
}

export function RadarPing({
  color = "green",
  frequency = 3000,
  maxPings = 5,
}: RadarPingProps) {
  const [pings, setPings] = useState<{ id: number; x: number; y: number }[]>([])

  useEffect(() => {
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
        return next.slice(-maxPings)
      })
    }

    const interval = setInterval(addPing, frequency)
    return () => clearInterval(interval)
  }, [frequency, maxPings])

  const ringColor = color === "green" ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pings.map(({ id, x, y }) => (
        <motion.div
          key={id}
          className="absolute rounded-full border-2"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: 20,
            height: 20,
            marginLeft: -10,
            marginTop: -10,
            borderColor: ringColor,
          }}
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 8, opacity: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
          onAnimationComplete={() =>
            setPings((prev) => prev.filter((p) => p.id !== id))
          }
        />
      ))}
    </div>
  )
}
