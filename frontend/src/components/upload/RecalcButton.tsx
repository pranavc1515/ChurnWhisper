import { useState } from "react"
import { triggerRecalculate } from "@/api/scores"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

export function RecalcButton() {
  const [jobId, setJobId] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [status, setStatus] = useState<string>("")
  const queryClient = useQueryClient()

  async function handleRecalc() {
    try {
      const id = await triggerRecalculate()
      setJobId(id)
      setProgress(0)
      const base = import.meta.env.VITE_API_URL || ""
      const url = base ? `${base}/api/scores/stream/${id}` : `/api/scores/stream/${id}`
      const es = new EventSource(url)
      es.addEventListener("progress", (e) => {
        const data = JSON.parse(e.data)
        setProgress(data.progress_pct ?? 0)
        setStatus(data.current_account || "")
        if (data.status === "completed") {
          es.close()
          setJobId(null)
          queryClient.invalidateQueries({ queryKey: ["dashboard"] })
          queryClient.invalidateQueries({ queryKey: ["accounts"] })
          toast.success("Recalculation complete")
        }
      })
      es.addEventListener("error", () => {
        es.close()
        setJobId(null)
      })
    } catch {
      toast.error("Failed to start recalculation")
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleRecalc}
        disabled={!!jobId}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {jobId ? "Recalculating..." : "Recalculate All Health Scores"}
      </button>
      {jobId && (
        <div className="space-y-1">
          <div className="h-2 w-48 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{status}</p>
        </div>
      )}
    </div>
  )
}
