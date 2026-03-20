import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AppShell } from "@/components/layout/AppShell"
import { AlertDropdown } from "@/components/alerts/AlertDropdown"
import { StatCard } from "@/components/dashboard/StatCard"
import { RiskDonutChart } from "@/components/dashboard/RiskDonutChart"
import { ScoreChangeAlerts } from "@/components/dashboard/ScoreChangeAlerts"
import { AccountsTable } from "@/components/dashboard/AccountsTable"
import { RecalcButton } from "@/components/upload/RecalcButton"
import { getDashboardSummary } from "@/api/dashboard"
import { getAccounts } from "@/api/accounts"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

export function DashboardPage() {
  const [riskFilter, setRiskFilter] = useState<string | null>(null)
  const { data: summary, isLoading } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: getDashboardSummary,
  })
  const { data: accountsData } = useQuery({
    queryKey: ["accounts", riskFilter],
    queryFn: () =>
      getAccounts({
        page: 1,
        per_page: 25,
        sort: "current_health_score",
        order: "asc",
        risk_level: riskFilter || undefined,
      }),
  })

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppShell>
    )
  }

  const s = summary || {
    total_accounts: 0,
    critical_count: 0,
    attention_count: 0,
    healthy_count: 0,
    revenue_at_risk: 0,
    risk_distribution: {},
    biggest_drops: [],
    biggest_gains: [],
  }

  return (
    <AppShell>
      <div className="border-b bg-card px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <RecalcButton />
          <AlertDropdown />
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Accounts" value={s.total_accounts} />
          <StatCard
            title="Critical / At Risk"
            value={s.critical_count}
            variant="critical"
            onClick={() => setRiskFilter(riskFilter === "critical" ? null : "critical")}
          />
          <StatCard
            title="Needs Attention"
            value={s.attention_count}
            variant="attention"
            onClick={() => setRiskFilter(riskFilter === "elevated" ? null : "elevated")}
          />
          <StatCard
            title="Healthy"
            value={s.healthy_count}
            variant="healthy"
            onClick={() => setRiskFilter(riskFilter === "healthy" ? null : "healthy")}
          />
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Revenue at Risk</h3>
          <p className="mt-1 text-2xl font-bold text-destructive">
            {formatCurrency(s.revenue_at_risk)}/month
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-4">Risk Distribution</h3>
            <RiskDonutChart data={s.risk_distribution} />
          </div>
          <div>
            <h3 className="font-medium mb-4">Score Changes</h3>
            <ScoreChangeAlerts drops={s.biggest_drops} gains={s.biggest_gains} />
          </div>
        </div>
        <div>
          <div className="flex gap-2 mb-4">
            {(["All", "Critical", "High Risk", "Needs Attention", "Healthy"] as const).map(
              (f) => {
                const val =
                  f === "All" ? null : f === "Critical" ? "critical" : f === "High Risk" ? "high" : f === "Needs Attention" ? "elevated" : "healthy"
                return (
                  <button
                    key={f}
                    onClick={() => setRiskFilter(riskFilter === val ? null : val)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium",
                      riskFilter === val
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {f}
                  </button>
                )
              }
            )}
          </div>
          <AccountsTable accounts={accountsData?.data ?? []} />
        </div>
      </div>
    </AppShell>
  )
}
