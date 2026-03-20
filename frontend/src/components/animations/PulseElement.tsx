import { motion } from "framer-motion"

interface PulseElementProps {
  children: React.ReactNode
  interval?: number
}

export function PulseElement({
  children,
  interval = 2000,
}: PulseElementProps) {
  return (
    <motion.span
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ repeat: Infinity, duration: interval / 1000 }}
    >
      {children}
    </motion.span>
  )
}
