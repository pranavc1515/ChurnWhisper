import { useEffect } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, initAuth } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return <>{children}</>
}
