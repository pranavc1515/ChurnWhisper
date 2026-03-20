import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ScoreCounter, PulseElement } from "@/components/animations"

const accounts = [
  { name: "Acme Corp", score: 12, status: "critical" },
  { name: "MegaRetail", score: 28, status: "high" },
  { name: "BrightTech", score: 91, status: "safe" },
]

export function DashboardMockup() {
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setCycle((c) => c + 1), 10000)
    return () => clearInterval(t)
  }, [])

  return (
    <motion.div
      className="relative mx-auto max-w-2xl rounded-xl border border-border bg-card p-6 shadow-2xl"
      style={{ transform: "perspective(800px) rotateY(2deg)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      <div className="mb-4 flex items-center gap-2 text-xs font-mono text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-brand-danger animate-pulse" />
        LIVE
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 rounded-lg border border-border bg-muted/50 p-3">
          <div className="text-xs text-muted-foreground">CRITICAL</div>
          <ScoreCounter value={12} color="red" size="medium" pulse />
        </div>
        <div className="flex-1 rounded-lg border border-border bg-muted/50 p-3">
          <div className="text-xs text-muted-foreground">HIGH</div>
          <ScoreCounter value={28} color="amber" size="medium" />
        </div>
        <div className="flex-1 rounded-lg border border-border bg-muted/50 p-3">
          <div className="text-xs text-muted-foreground">SAFE</div>
          <ScoreCounter value={91} color="green" size="medium" />
        </div>
      </div>

      <div className="space-y-2">
        {accounts.map((a, i) => (
          <motion.div
            key={a.name}
            className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-4 py-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
          >
            <span className="font-medium">{a.name}</span>
            <span
              className={`font-mono font-semibold ${
                a.status === "critical"
                  ? "text-brand-danger"
                  : a.status === "high"
                  ? "text-brand-warning"
                  : "text-brand-primary"
              }`}
            >
              {a.status === "critical" ? (
                <PulseElement>
                  <span>{a.score}</span>
                </PulseElement>
              ) : (
                a.score
              )}
            </span>
          </motion.div>
        ))}
      </div>

      {cycle > 0 && (
        <motion.div
          className="mt-4 rounded-md border border-brand-danger/50 bg-brand-danger/10 px-4 py-2 text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ⚠️ Acme Corp: Exit intent detected in latest ticket
        </motion.div>
      )}
    </motion.div>
  )
}
