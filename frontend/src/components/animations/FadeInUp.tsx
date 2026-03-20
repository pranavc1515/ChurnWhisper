import { motion } from "framer-motion"

interface FadeInUpProps {
  children: React.ReactNode
  delay?: number
}

export function FadeInUp({ children, delay = 0 }: FadeInUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
