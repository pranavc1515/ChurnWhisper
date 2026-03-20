import { apiClient } from "./client"

export interface Account {
  id: string
  account_name: string
  company_size?: string
  plan_tier?: string
  monthly_revenue?: number
  contract_renewal_date?: string
  current_health_score?: number
  current_risk_level?: string
  last_score_calculated_at?: string
}

export async function getAccounts(params?: {
  page?: number
  per_page?: number
  sort?: string
  order?: string
  risk_level?: string
  search?: string
}) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.per_page) searchParams.set("per_page", String(params.per_page))
  if (params?.sort) searchParams.set("sort", params.sort)
  if (params?.order) searchParams.set("order", params.order)
  if (params?.risk_level) searchParams.set("risk_level", params.risk_level)
  if (params?.search) searchParams.set("search", params.search)
  const res = await apiClient.get<{
    success: boolean
    data: Account[]
    meta: { page: number; per_page: number; total: number; total_pages: number }
  }>(`/api/accounts?${searchParams}`)
  return res.data
}
