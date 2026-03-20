import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "Free",
    features: [
      { text: "25 accounts", included: true },
      { text: "Manual recalc", included: true },
      { text: "Basic playbook", included: true },
      { text: "Email alerts", included: false },
      { text: "CSV export", included: false },
    ],
    cta: "Start Free",
    href: "/auth?tab=register",
    recommended: false,
  },
  {
    name: "Growth",
    price: "₹1,999/month",
    features: [
      { text: "500 accounts", included: true },
      { text: "Auto weekly", included: true },
      { text: "Full playbook", included: true },
      { text: "Email alerts", included: true },
      { text: "CSV + CRM export", included: true },
    ],
    cta: "Start Trial →",
    href: "/auth?tab=register",
    recommended: true,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-8 md:grid-cols-2">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              className={`relative rounded-xl border bg-card p-8 ${
                p.recommended
                  ? "border-primary shadow-[0_0_30px_hsl(var(--brand-primary)/0.15)]"
                  : "border-border"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              {p.recommended && (
                <span className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  RECOMMENDED
                </span>
              )}
              <h3 className="font-display text-xl font-semibold">{p.name}</h3>
              <p className="mt-2 text-2xl font-bold">{p.price}</p>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2 text-sm">
                    {f.included ? (
                      <Check className="h-4 w-4 text-brand-primary" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={f.included ? "" : "text-muted-foreground"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to={p.href}
                className={`mt-8 block w-full rounded-md py-3 text-center font-medium transition-colors ${
                  p.recommended
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-input hover:bg-muted"
                }`}
              >
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
