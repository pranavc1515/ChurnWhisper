import { apiClient } from "./client"

export async function triggerRecalculate() {
  const res = await apiClient.post<{ success: boolean; data: { job_id: string } }>(
    "/api/scores/recalculate"
  )
  return res.data.data.job_id
}

export async function getRecalcStatus(jobId: string) {
  const res = await apiClient.get<{ success: boolean; data: Record<string, unknown> }>(
    `/api/scores/status/${jobId}`
  )
  return res.data.data
}
