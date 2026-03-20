import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { AppShell } from "@/components/layout/AppShell"
import { apiClient } from "@/api/client"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function AccountDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useQuery({
    queryKey: ["account", id],
    queryFn: () =>
      apiClient.get<{ success: boolean; data: Record<string, unknown> }>(
        `/api/accounts/${id}`
      ).then((r) => r.data.data),
    enabled: !!id,
  })
  const { data: scoreHistory } = useQuery({
    queryKey: ["account-score-history", id],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: Array<{ score: number; calculated_at: string }> }>(
          `/api/accounts/${id}/score-history`
        )
        .then((r) => r.data.data),
    enabled: !!id,
  })

  if (isLoading || !data) {
    return (
      <AppShell>
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppShell>
    )
  }

  const acc = data as {
    account_name: string
    company_size?: string
    plan_tier?: string
    monthly_revenue?: number
    contract_renewal_date?: string
    current_health_score?: number
    current_risk_level?: string
    latest_score?: {
      score: number
      risk_level: string
      risk_factors: Array<{ title: string; description: string; severity: string }>
      recommended_actions: Array<{ title: string; description: string; urgency: string }>
      account_summary: string
      churn_prediction?: { probability_30_days?: number; primary_churn_trigger?: string }
    }
  }
  const latest = acc.latest_score
  const score = acc.current_health_score ?? 0

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{acc.account_name}</h1>
            <p className="text-muted-foreground">
              {acc.company_size} · {acc.plan_tier}
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-lg border p-6 text-center">
            <div
              className={cn(
                "text-4xl font-bold",
                score <= 30 && "text-destructive",
                score > 60 && "text-green-600"
              )}
            >
              {score}
            </div>
            <p className="text-sm text-muted-foreground">Health Score</p>
            <p className="mt-2 text-sm font-medium">{acc.current_risk_level}</p>
          </div>
          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">Revenue at Risk</p>
            <p className="text-xl font-bold">
              {score <= 30 && acc.monthly_revenue
                ? formatCurrency(acc.monthly_revenue)
                : "—"}
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">Contract Renewal</p>
            <p className="text-xl font-bold">
              {acc.contract_renewal_date
                ? format(new Date(acc.contract_renewal_date), "MMM d, yyyy")
                : "—"}
            </p>
          </div>
        </div>
        {latest && (
          <>
            <div className="rounded-lg border p-6">
              <h3 className="font-medium mb-4">Risk Factors</h3>
              {latest.risk_factors?.length ? (
                <ul className="space-y-3">
                  {latest.risk_factors.map((rf, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium">{rf.title}</span>
                      <p className="text-muted-foreground mt-1">{rf.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No risk factors identified.</p>
              )}
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="font-medium mb-4">Recommended Actions</h3>
              {latest.recommended_actions?.length ? (
                <ul className="space-y-3">
                  {latest.recommended_actions.map((a, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium">{a.title}</span>
                      <p className="text-muted-foreground mt-1">{a.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No actions recommended.</p>
              )}
            </div>
            {latest.account_summary && (
              <div className="rounded-lg border p-6">
                <h3 className="font-medium mb-4">Account Summary</h3>
                <p className="text-sm text-muted-foreground">{latest.account_summary}</p>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
