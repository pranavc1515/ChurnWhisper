import { motion } from "framer-motion"
import { CountUp } from "@/components/animations"

const metrics = [
  { value: 18, prefix: "₹", suffix: "L+", label: "revenue saved /quarter" },
  { value: 23, label: "accounts saved from churn" },
  { value: 4, suffix: " weeks", label: "early warning average" },
  { value: 89, suffix: "%", label: "action completion rate" },
]

export function MetricsSection() {
  return (
    <section className="relative py-24 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              className="rounded-xl border-t-4 border-primary bg-card p-6 shadow-[0_0_20px_hsl(var(--brand-primary)/0.08)]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="font-mono text-3xl font-bold text-primary">
                <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
