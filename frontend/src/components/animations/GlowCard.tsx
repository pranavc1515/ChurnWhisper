import { motion } from "framer-motion"

interface GlowCardProps {
  children: React.ReactNode
  glowColor?: "green" | "red"
  hoverLift?: number
  className?: string
}

export function GlowCard({
  children,
  glowColor = "green",
  hoverLift = 4,
  className = "",
}: GlowCardProps) {
  const shadow =
    glowColor === "green"
      ? "0 0 30px hsl(var(--brand-primary) / 0.2)"
      : "0 0 30px hsl(var(--brand-danger) / 0.2)"

  return (
    <motion.div
      className={`rounded-lg border bg-card p-6 transition-shadow ${className}`}
      whileHover={{
        scale: 1.02,
        boxShadow: shadow,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}
