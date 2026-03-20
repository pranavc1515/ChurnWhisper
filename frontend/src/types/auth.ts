export interface User {
  id: string
  name: string
  email: string
  company_name?: string
  role?: string
  avatar_url?: string
  created_at: string
  last_login?: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  company_name?: string
  role?: string
}
