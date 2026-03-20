import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { UploadZone } from "@/components/upload/UploadZone"
import { ColumnMapper } from "@/components/upload/ColumnMapper"
import { UploadHistory } from "@/components/upload/UploadHistory"
import * as uploadApi from "@/api/upload"
import { toast } from "sonner"
import { AppShell } from "@/components/layout/AppShell"
import { cn } from "@/lib/utils"

type UploadType = "tickets" | "nps" | "usage"

export function UploadPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<UploadType>("tickets")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<{ columns: string[]; suggested_mapping: Record<string, string> } | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)

  const previewFn =
    activeTab === "tickets"
      ? uploadApi.previewTickets
      : activeTab === "nps"
      ? uploadApi.previewNps
      : uploadApi.previewUsage
  const uploadFn =
    activeTab === "tickets"
      ? uploadApi.uploadTickets
      : activeTab === "nps"
      ? uploadApi.uploadNps
      : uploadApi.uploadUsage

  async function handleFileSelect(f: File) {
    setFile(f)
    setPreview(null)
    setMapping({})
    try {
      const data = await previewFn(f)
      setPreview(data)
      setMapping(data.suggested_mapping || {})
    } catch {
      toast.error("Failed to preview file")
      setFile(null)
    }
  }

  async function handleUpload() {
    if (!file || !preview) return
    const required =
      activeTab === "tickets"
        ? ["ticket_id", "account_name", "created_date", "subject"]
        : activeTab === "nps"
        ? ["account_name", "score", "date"]
        : ["account_name", "event_type", "count_last_30_days", "count_previous_30_days"]
    const missing = required.filter((r) => !mapping[r]?.trim())
    if (missing.length) {
      toast.error(`Please map required fields: ${missing.join(", ")}`)
      return
    }
    setUploading(true)
    try {
      const result = await uploadFn(file, mapping)
      toast.success(
        `${result.tickets_imported ?? result.responses_imported ?? result.events_imported} rows imported, ${result.new_accounts_detected} new accounts`
      )
      queryClient.invalidateQueries({ queryKey: ["upload-history"] })
      setFile(null)
      setPreview(null)
      setMapping({})
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <AppShell>
    <div className="p-8">
      <h1 className="text-2xl font-bold">Upload Data</h1>
      <p className="mt-1 text-muted-foreground">
        Import support tickets, NPS surveys, or usage data from CSV files.
      </p>

      <div className="mt-6 flex gap-2 rounded-md bg-muted p-1">
        {(["tickets", "nps", "usage"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setActiveTab(t)
              setFile(null)
              setPreview(null)
              setMapping({})
            }}
            className={cn(
              "rounded px-4 py-2 text-sm font-medium",
              activeTab === t ? "bg-background shadow" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "tickets" ? "Support Tickets" : t === "nps" ? "NPS Surveys" : "Usage Data"}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <UploadZone onFileSelect={handleFileSelect} />
          {preview && (
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-medium mb-4">Column mapping</h3>
              <ColumnMapper
                type={activeTab}
                csvColumns={preview.columns}
                mapping={mapping}
                onChange={setMapping}
              />
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Import"}
              </button>
            </div>
          )}
        </div>
        <div>
          <UploadHistory />
        </div>
      </div>
    </div>
    </AppShell>
  )
}
