import { motion } from "framer-motion"
import { StepUpload } from "./StepUpload"
import { StepScore } from "./StepScore"
import { StepAct } from "./StepAct"

const steps = [
  {
    num: "01",
    title: "Upload",
    component: StepUpload,
  },
  {
    num: "02",
    title: "AI Scores",
    component: StepScore,
  },
  {
    num: "03",
    title: "Act",
    component: StepAct,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          className="font-display text-3xl font-bold text-center sm:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Three steps to protect your revenue
        </motion.h2>

        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 font-mono text-sm text-muted-foreground">
                  {s.num}
                </div>
                <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                <div className="mt-6">
                  <s.component />
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 w-12 border-t-2 border-dashed border-border" />
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex justify-center gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-2 w-2 rounded-full bg-primary"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
