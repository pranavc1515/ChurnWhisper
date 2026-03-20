import { motion } from "framer-motion"
import { ScoreCounter } from "@/components/animations"

const signals = [
  {
    icon: "📧",
    title: "TICKETS",
    text: '"Broken again. Trying others."',
  },
  {
    icon: "📊",
    title: "NPS",
    text: "Score dropped from 8 to 3.",
  },
  {
    icon: "📉",
    title: "USAGE",
    text: "Logins dropped 62% in 30 days.",
  },
]

export function ProblemSection() {
  return (
    <section className="relative py-24 px-4">
      <div className="mx-auto max-w-4xl text-center">
        <motion.h2
          className="font-display text-3xl font-bold sm:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Last month, 8 accounts cancelled.
        </motion.h2>
        <motion.p
          className="mt-2 text-xl text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Nobody saw it coming.
        </motion.p>
        <motion.p
          className="mt-6 text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          The warning signs were there. Scattered across 3 tools.
        </motion.p>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {signals.map((s, i) => (
            <motion.div
              key={s.title}
              className="rounded-lg border border-border bg-card p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-xs font-mono text-muted-foreground uppercase">
                {s.title}
              </div>
              <p className="mt-2 text-sm">{s.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-12 rounded-xl border-2 border-brand-danger/50 bg-card p-8 shadow-[0_0_30px_hsl(var(--brand-danger)/0.15)]"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-lg font-medium">
            ChurnWhisper connects the dots
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-3 w-3 rounded-full bg-brand-danger" />
            <ScoreCounter value={12} color="red" size="large" pulse />
            <span className="text-brand-danger font-semibold">— CRITICAL</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
