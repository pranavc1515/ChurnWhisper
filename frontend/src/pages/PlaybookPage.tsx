import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { apiClient } from "@/api/client"

export function PlaybookPage() {
  const [exporting, setExporting] = useState(false)
  const { data, isLoading } = useQuery({
    queryKey: ["playbook"],
    queryFn: () =>
      apiClient
        .get<{
          success: boolean
          data: {
            this_week: Array<Record<string, unknown>>
            this_month: Array<Record<string, unknown>>
          }
        }>("/api/playbook")
        .then((r) => r.data.data),
  })
  const { data: stats } = useQuery({
    queryKey: ["playbook-stats"],
    queryFn: () =>
      apiClient
        .get<{
          success: boolean
          data: { actions_pending: number; accounts_with_actions: number }
        }>("/api/playbook/stats")
        .then((r) => r.data.data),
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

  const thisWeek = data?.this_week ?? []
  const thisMonth = data?.this_month ?? []

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Retention Playbook</h1>
          <button
            onClick={async () => {
              setExporting(true)
              try {
                const res = await apiClient.get("/api/playbook/export", {
                  responseType: "blob",
                })
                const url = URL.createObjectURL(res.data)
                const a = document.createElement("a")
                a.href = url
                a.download = "playbook.csv"
                a.click()
                URL.revokeObjectURL(url)
              } finally {
                setExporting(false)
              }
            }}
            disabled={exporting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
        {stats && (
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              {stats.actions_pending} actions pending across {stats.accounts_with_actions} accounts
            </p>
          </div>
        )}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-destructive mb-4">
              This Week (Urgent)
            </h2>
            {thisWeek.length === 0 ? (
              <p className="text-muted-foreground">No urgent actions.</p>
            ) : (
              <div className="space-y-3">
                {thisWeek.map((a, i) => (
                  <div
                    key={i}
                    className="rounded-lg border p-4 flex justify-between items-start"
                  >
                    <div>
                      <p className="font-medium">{a.title as string}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {a.account_name as string} · Score: {a.score as number}
                      </p>
                      <p className="text-sm mt-2">{a.description as string}</p>
                    </div>
                    <Link
                      to={`/accounts/${a.account_id}`}
                      className="text-primary hover:underline text-sm"
                    >
                      View Account
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-medium text-amber-600 mb-4">
              This Month
            </h2>
            {thisMonth.length === 0 ? (
              <p className="text-muted-foreground">No actions this month.</p>
            ) : (
              <div className="space-y-3">
                {thisMonth.map((a, i) => (
                  <div
                    key={i}
                    className="rounded-lg border p-4 flex justify-between items-start"
                  >
                    <div>
                      <p className="font-medium">{a.title as string}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {a.account_name as string} · Score: {a.score as number}
                      </p>
                      <p className="text-sm mt-2">{a.description as string}</p>
                    </div>
                    <Link
                      to={`/accounts/${a.account_id}`}
                      className="text-primary hover:underline text-sm"
                    >
                      View Account
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
