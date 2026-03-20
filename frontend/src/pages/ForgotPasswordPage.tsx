import { useState } from "react"
import { Link } from "react-router-dom"
import { forgotPassword } from "@/api/auth"
import { cn } from "@/lib/utils"

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch {
      setError("Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 text-center">
          <h2 className="text-lg font-semibold">Check your email</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists, we sent a reset link.
          </p>
          <Link
            to="/auth"
            className="mt-4 inline-block text-sm text-primary hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">Forgot password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email to receive a reset link.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            )}
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <Link
          to="/auth"
          className="mt-4 block text-center text-sm text-primary hover:underline"
        >
          Back to login
        </Link>
      </div>
    </div>
  )
}
