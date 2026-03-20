import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types/auth"
import * as authApi from "@/api/auth"
import { setAccessToken, clearAccessToken } from "@/api/client"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    name: string
    email: string
    password: string
    company_name?: string
    role?: string
  }) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  initAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      login: async (email, password) => {
        const res = await authApi.login({ email, password })
        set({
          user: res.data.user,
          isAuthenticated: true,
        })
      },

      register: async (data) => {
        const res = await authApi.register(data)
        set({
          user: res.data.user,
          isAuthenticated: true,
        })
      },

      logout: async () => {
        try {
          await authApi.logout()
        } finally {
          clearAccessToken()
          set({ user: null, isAuthenticated: false })
        }
      },

      fetchUser: async () => {
        try {
          const user = await authApi.getMe()
          set({ user, isAuthenticated: true })
        } catch {
          clearAccessToken()
          set({ user: null, isAuthenticated: false })
        }
      },

      initAuth: async () => {
        set({ isLoading: true })
        try {
          await get().fetchUser()
        } catch {
          set({ user: null, isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: "churnwhisper-auth",
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
)
