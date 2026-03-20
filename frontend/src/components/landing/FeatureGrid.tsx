import { motion } from "framer-motion"
import { GlowCard } from "@/components/animations"

const features = [
  {
    icon: "🎯",
    title: "AI Health Scores",
    desc: "Every account scored 0-100 with risk level and confidence.",
  },
  {
    icon: "🔍",
    title: "Signal Cross-Ref",
    desc: "Tickets, NPS, and usage data analyzed holistically.",
  },
  {
    icon: "📋",
    title: "Retention Playbook",
    desc: "AI generates specific actions with talk tracks.",
  },
  {
    icon: "📊",
    title: "Revenue at Risk Tracker",
    desc: "See exactly how much MRR is at risk today.",
  },
  {
    icon: "⏰",
    title: "Renewal Alerts",
    desc: "Flag at-risk accounts near contract end.",
  },
  {
    icon: "📧",
    title: "Smart Alerts",
    desc: "Get notified instantly when a score drops.",
  },
]

export function FeatureGrid() {
  return (
    <section id="features" className="relative py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          className="font-display text-3xl font-bold text-center sm:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Why CS teams choose ChurnWhisper
        </motion.h2>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.05 + Math.floor(i / 3) * 0.15 }}
            >
              <GlowCard glowColor="green">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-display font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
