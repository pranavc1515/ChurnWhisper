import { motion } from "framer-motion"

interface ScanLineProps {
  direction?: "top-to-bottom" | "bottom-to-top"
  color?: "green" | "red"
  duration?: number
}

export function ScanLine({
  direction = "top-to-bottom",
  color = "green",
  duration = 1.5,
}: ScanLineProps) {
  const from = direction === "top-to-bottom" ? "-100%" : "100%"
  const to = direction === "top-to-bottom" ? "100%" : "-100%"

  return (
    <motion.div
      className="absolute inset-x-0 h-1 bg-primary shadow-lg"
      style={{
        boxShadow: "0 0 20px hsl(var(--brand-primary) / 0.3)",
      }}
      initial={{ top: from }}
      animate={{ top: to }}
      transition={{ duration, ease: "easeInOut" }}
    />
  )
}
