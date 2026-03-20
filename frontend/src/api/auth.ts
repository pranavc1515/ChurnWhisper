import { apiClient, setAccessToken, clearAccessToken } from "./client"
import type { User, LoginRequest, RegisterRequest } from "@/types/auth"

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
  }
}

export interface RefreshResponse {
  success: boolean
  data: {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
  }
}

export async function register(data: RegisterRequest) {
  const res = await apiClient.post<AuthResponse>("/api/auth/register", data)
  if (res.data.success && res.data.data.access_token) {
    setAccessToken(res.data.data.access_token)
  }
  return res.data
}

export async function login(data: LoginRequest) {
  const res = await apiClient.post<AuthResponse>("/api/auth/login", data)
  if (res.data.success && res.data.data.access_token) {
    setAccessToken(res.data.data.access_token)
  }
  return res.data
}

export async function logout() {
  await apiClient.post("/api/auth/logout")
  clearAccessToken()
}

export async function getMe() {
  const res = await apiClient.get<{ success: boolean; data: User }>(
    "/api/auth/me"
  )
  return res.data.data
}

export async function forgotPassword(email: string) {
  const res = await apiClient.post("/api/auth/forgot-password", { email })
  return res.data
}

export async function resetPassword(token: string, newPassword: string) {
  const res = await apiClient.post("/api/auth/reset-password", {
    token,
    new_password: newPassword,
  })
  return res.data
}
