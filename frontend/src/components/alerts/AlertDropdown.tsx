import { useQuery } from "@tanstack/react-query"
import { getAlerts, markAlertRead } from "@/api/dashboard"
import { format } from "date-fns"
import { useState } from "react"

export function AlertDropdown() {
  const [open, setOpen] = useState(false)
  const { data, refetch } = useQuery({
    queryKey: ["alerts"],
    queryFn: getAlerts,
  })
  const unread = data?.unread_count ?? 0
  const alerts = data?.alerts ?? []

  async function handleRead(id: string) {
    await markAlertRead(id)
    refetch()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-full p-2 hover:bg-muted"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-1 w-80 rounded-lg border bg-card shadow-lg">
            <div className="border-b p-3 font-medium">Alerts</div>
            <div className="max-h-64 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  No alerts
                </div>
              ) : (
                alerts.map((a: { id: string; title: string; read: boolean; created_at: string | null }) => (
                  <div
                    key={a.id}
                    onClick={() => handleRead(a.id)}
                    className={`border-b p-3 text-sm last:border-0 ${
                      !a.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <p className="font-medium">{a.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {a.created_at && format(new Date(a.created_at), "MMM d, HH:mm")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
