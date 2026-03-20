import { motion } from "framer-motion"

export function BeforeAfter() {
  return (
    <section className="relative py-24 px-4">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          className="font-display text-3xl font-bold text-center sm:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          See ChurnWhisper detect a real churn signal
        </motion.h2>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <motion.div
            className="rounded-xl border border-border bg-muted/30 p-6 opacity-80"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 0.8, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-mono text-sm text-muted-foreground mb-4">
              BEFORE
            </h3>
            <div className="space-y-3 text-sm">
              <p>Ticket: &quot;PDF broken&quot; — Status: Resolved ✓</p>
              <p>Ticket: &quot;PDF AGAIN!&quot; — Status: Open</p>
              <p>NPS: 3/10 😠</p>
              <p>Logins: 120→45 📉</p>
              <p className="italic text-muted-foreground mt-4">
                &quot;Nobody connected these dots.&quot;
              </p>
            </div>
          </motion.div>

          <motion.div
            className="rounded-xl border-2 border-brand-primary/30 bg-card p-6 shadow-[0_0_30px_hsl(var(--brand-primary)/0.1)]"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-mono text-sm text-brand-primary mb-4">
              AFTER
            </h3>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-danger" />
                Health Score: 12
              </p>
              <p className="text-brand-warning">⚠️ EXIT INTENT detected</p>
              <p className="text-muted-foreground">
                Bug reported 2x, marked resolved but NOT
              </p>
              <p className="text-muted-foreground">
                Usage collapsed 82%
              </p>
              <div className="mt-4 rounded-md bg-muted/50 p-3">
                <p className="font-medium">ACTION: Call this week.</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Escalate PDF fix to eng. Offer 1 month free.
                </p>
              </div>
              <p className="italic text-brand-primary mt-2">
                &quot;We saved this account.&quot;
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
