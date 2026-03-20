import { motion } from "framer-motion"

const items = [
  "Call Acme Corp this week",
  "Fix PDF export (48hr deadline)",
  "Offer 1 month free credit",
]

export function StepAct() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Get a retention playbook with exact actions and talk tracks for calls.
      </p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.div
            key={item}
            className="flex items-center gap-2 text-sm"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
          >
            <span className="text-brand-primary">☑</span>
            <span>{item} ✓</span>
          </motion.div>
        ))}
      </div>
      <p className="text-xs font-mono text-muted-foreground">
        Score: 12 → 54 (recovery!)
      </p>
    </div>
  )
}
