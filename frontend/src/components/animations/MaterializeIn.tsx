import { motion } from "framer-motion"

interface MaterializeInProps {
  children: React.ReactNode
  delay?: number
}

export function MaterializeIn({ children, delay = 0 }: MaterializeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
