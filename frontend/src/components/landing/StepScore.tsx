import { motion } from "framer-motion"

export function StepScore() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        AI cross-references all signals and scores every account 0-100.
      </p>
      <div className="flex justify-center">
        <motion.div
          className="relative h-24 w-24 rounded-full border-4 border-brand-primary"
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-danger"
            initial={{ rotate: 0 }}
            whileInView={{ rotate: -90 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-2xl font-bold text-brand-danger">
              12
            </span>
          </div>
        </motion.div>
      </div>
      <p className="text-center text-xs font-mono text-brand-danger">
        CRITICAL
      </p>
    </div>
  )
}
