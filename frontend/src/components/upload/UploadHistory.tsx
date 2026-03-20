import { useQuery } from "@tanstack/react-query"
import { getUploadHistory } from "@/api/upload"
import { format } from "date-fns"

export function UploadHistory() {
  const { data: history, isLoading } = useQuery({
    queryKey: ["upload-history"],
    queryFn: getUploadHistory,
  })

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading...</div>
  if (!history?.length) return <div className="text-sm text-muted-foreground">No uploads yet.</div>

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Recent uploads</h3>
      <div className="rounded-md border divide-y max-h-48 overflow-y-auto">
        {history.map((u) => (
          <div
            key={u.id}
            className="flex justify-between items-center px-3 py-2 text-sm"
          >
            <div>
              <span className="font-medium">{u.file_name}</span>
              <span className="ml-2 text-muted-foreground">({u.file_type})</span>
            </div>
            <div className="text-muted-foreground text-xs">
              {u.row_count} rows · {u.new_accounts_detected} new accounts
              {u.uploaded_at && ` · ${format(new Date(u.uploaded_at), "MMM d")}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
