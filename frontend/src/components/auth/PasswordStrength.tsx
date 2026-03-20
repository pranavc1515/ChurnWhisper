import { useMemo } from "react"

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 8) s++
    if (/[A-Z]/.test(password)) s++
    if (/[0-9]/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s
  }, [password])

  const colors = ["bg-brand-danger", "bg-brand-warning", "bg-yellow-500", "bg-brand-primary"]
  const labels = ["Weak", "Fair", "Good", "Strong"]

  return (
    <div className="mt-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < strength ? colors[strength - 1] : "bg-muted"
            }`}
          />
        ))}
      </div>
      {password && (
        <p className="mt-1 text-xs text-muted-foreground">{labels[strength - 1]}</p>
      )}
    </div>
  )
}
