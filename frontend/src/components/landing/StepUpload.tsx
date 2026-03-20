import { motion } from "framer-motion"

const files = ["tickets.csv", "nps.csv", "usage.csv"]

export function StepUpload() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Drop your support tickets, NPS data, and usage logs as CSV files.
      </p>
      <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-4 min-h-[120px]">
        {files.map((f, i) => (
          <motion.div
            key={f}
            className="flex items-center gap-2 text-sm"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
          >
            <span className="text-brand-primary">✓</span>
            <span className="font-mono">{f}</span>
          </motion.div>
        ))}
      </div>
      <p className="text-xs font-mono text-muted-foreground">
        2,847 rows imported
      </p>
    </div>
  )
}
