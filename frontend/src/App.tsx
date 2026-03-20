import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import { LandingPage } from "@/pages/LandingPage"
import { AuthPage } from "@/pages/AuthPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { UploadPage } from "@/pages/UploadPage"
import { AccountDetailPage } from "@/pages/AccountDetailPage"
import { PlaybookPage } from "@/pages/PlaybookPage"
import { SettingsPage } from "@/pages/SettingsPage"
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage"
import { useAuthStore } from "@/store/authStore"

function App() {
  const { initAuth } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts/:id"
          element={
            <ProtectedRoute>
              <AccountDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playbook"
          element={
            <ProtectedRoute>
              <PlaybookPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
