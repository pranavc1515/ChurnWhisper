import { Link } from "react-router-dom"
import type { Account } from "@/api/accounts"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface AccountsTableProps {
  accounts: Account[]
  onFilter?: (risk: string) => void
}

function RiskBadge({ level }: { level?: string }) {
  const colors: Record<string, string> = {
    critical: "bg-red-500/20 text-red-700",
    high: "bg-orange-500/20 text-orange-700",
    elevated: "bg-yellow-500/20 text-yellow-700",
    attention: "bg-amber-500/20 text-amber-700",
    healthy: "bg-green-500/20 text-green-700",
    champion: "bg-emerald-500/20 text-emerald-700",
  }
  return (
    <span
      className={cn(
        "rounded px-2 py-0.5 text-xs font-medium",
        colors[level || ""] || "bg-muted text-muted-foreground"
      )}
    >
      {level || "—"}
    </span>
  )
}

export function AccountsTable({ accounts, onFilter }: AccountsTableProps) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Account</th>
            <th className="px-4 py-3 text-left font-medium">Score</th>
            <th className="px-4 py-3 text-left font-medium">Risk</th>
            <th className="px-4 py-3 text-left font-medium">Revenue</th>
            <th className="px-4 py-3 text-left font-medium">Renewal</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {accounts.map((a) => (
            <tr key={a.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{a.account_name}</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "font-mono",
                    (a.current_health_score ?? 100) <= 30 && "text-destructive",
                    (a.current_health_score ?? 0) > 60 && "text-green-600"
                  )}
                >
                  {a.current_health_score ?? "—"}
                </span>
              </td>
              <td className="px-4 py-3">
                <RiskBadge level={a.current_risk_level} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {a.monthly_revenue != null
                  ? formatCurrency(a.monthly_revenue)
                  : "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {a.contract_renewal_date
                  ? format(new Date(a.contract_renewal_date), "MMM d, yyyy")
                  : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  to={`/accounts/${a.id}`}
                  className="text-primary hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {accounts.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No accounts yet. Upload data to get started.
        </div>
      )}
    </div>
  )
}
