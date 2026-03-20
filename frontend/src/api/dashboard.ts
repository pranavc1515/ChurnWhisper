import { apiClient } from "./client"

export interface DashboardSummary {
  total_accounts: number
  critical_count: number
  attention_count: number
  healthy_count: number
  revenue_at_risk: number
  risk_distribution: Record<string, number>
  biggest_drops: Array<{ account: string; from: number; to: number; change: number }>
  biggest_gains: Array<{ account: string; from: number; to: number; change: number }>
}

export async function getDashboardSummary() {
  const res = await apiClient.get<{ success: boolean; data: DashboardSummary }>(
    "/api/dashboard/summary"
  )
  return res.data.data
}

export interface Alert {
  id: string
  type: string
  title: string
  message: string
  severity: string
  read: boolean
  created_at: string | null
}

export async function getAlerts() {
  const res = await apiClient.get<{
    success: boolean
    data: { alerts: Alert[]; unread_count: number }
  }>("/api/dashboard/alerts")
  return res.data.data
}

export async function markAlertRead(alertId: string) {
  await apiClient.put(`/api/dashboard/alerts/${alertId}/read`)
}
