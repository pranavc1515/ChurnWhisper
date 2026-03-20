import { apiClient } from "./client"

export interface UploadPreviewResponse {
  columns: string[]
  suggested_mapping: Record<string, string>
}

export async function previewTickets(file: File) {
  const form = new FormData()
  form.append("file", file)
  const res = await apiClient.post<{ success: boolean; data: UploadPreviewResponse }>(
    "/api/upload/preview/tickets",
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  )
  return res.data.data
}

export async function previewNps(file: File) {
  const form = new FormData()
  form.append("file", file)
  const res = await apiClient.post<{ success: boolean; data: UploadPreviewResponse }>(
    "/api/upload/preview/nps",
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  )
  return res.data.data
}

export async function previewUsage(file: File) {
  const form = new FormData()
  form.append("file", file)
  const res = await apiClient.post<{ success: boolean; data: UploadPreviewResponse }>(
    "/api/upload/preview/usage",
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  )
  return res.data.data
}

export async function uploadTickets(file: File, mapping: Record<string, string>) {
  const form = new FormData()
  form.append("file", file)
  form.append("mapping", JSON.stringify(mapping))
  const res = await apiClient.post<{
    success: boolean
    data: {
      upload_id: string
      tickets_imported: number
      new_accounts_detected: number
      warnings: string[]
    }
  }>("/api/upload/tickets", form)
  return res.data.data
}

export async function uploadNps(file: File, mapping: Record<string, string>) {
  const form = new FormData()
  form.append("file", file)
  form.append("mapping", JSON.stringify(mapping))
  const res = await apiClient.post<{
    success: boolean
    data: {
      upload_id: string
      responses_imported: number
      new_accounts_detected: number
      warnings: string[]
    }
  }>("/api/upload/nps", form)
  return res.data.data
}

export async function uploadUsage(file: File, mapping: Record<string, string>) {
  const form = new FormData()
  form.append("file", file)
  form.append("mapping", JSON.stringify(mapping))
  const res = await apiClient.post<{
    success: boolean
    data: {
      upload_id: string
      events_imported: number
      new_accounts_detected: number
      warnings: string[]
    }
  }>("/api/upload/usage", form)
  return res.data.data
}

export async function getUploadHistory() {
  const res = await apiClient.get<{
    success: boolean
    data: Array<{
      id: string
      file_name: string
      file_type: string
      row_count: number
      new_accounts_detected: number
      status: string
      uploaded_at: string | null
    }>
  }>("/api/upload/history")
  return res.data.data
}
