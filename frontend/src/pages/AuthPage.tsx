import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { LoginForm } from "@/components/auth/LoginForm"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { AuthBackground } from "@/components/auth/AuthBackground"
import { ThemeToggle } from "@/components/landing/ThemeToggle"
import { CountUp } from "@/components/animations"
import { cn } from "@/lib/utils"

export function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get("tab") || "login"
  const activeTab = tab === "register" ? "register" : "login"

  const setActiveTab = (t: "login" | "register") => {
    setSearchParams(t === "login" ? {} : { tab: "register" })
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <AuthBackground />

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="rounded-xl border border-border bg-card/95 backdrop-blur-xl p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-foreground">
                Churn
              </span>
              <span className="font-display text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Whisper
              </span>
            </Link>
          </div>

          <div className="mb-6 flex border-b border-border">
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={cn(
                "flex-1 pb-3 text-sm font-medium transition-colors",
                activeTab === "login"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={cn(
                "flex-1 pb-3 text-sm font-medium transition-colors",
                activeTab === "register"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign Up
            </button>
          </div>

          {activeTab === "login" ? <LoginForm /> : <RegisterForm />}

          <div className="mt-6 flex items-center gap-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <a
            href="#"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-input py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </a>

          {activeTab === "register" && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className="text-primary hover:underline"
              >
                Log in
              </button>
            </p>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </p>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Protecting{" "}
          <span className="font-mono font-semibold text-primary">
            ₹<CountUp value={2} suffix=".4Cr" duration={3} /> in revenue
          </span>{" "}
          across{" "}
          <span className="font-mono font-semibold text-primary">
            <CountUp value={847} duration={3} /> accounts
          </span>
        </p>
      </motion.div>
    </div>
  )
}
