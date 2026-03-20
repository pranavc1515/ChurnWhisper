import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: number
  variant?: "default" | "critical" | "attention" | "healthy"
  onClick?: () => void
}

export function StatCard({
  title,
  value,
  variant = "default",
  onClick,
}: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border p-4 text-left transition-colors",
        "hover:bg-muted/50",
        variant === "critical" && "border-destructive/50 bg-destructive/5",
        variant === "attention" && "border-amber-500/50 bg-amber-500/5",
        variant === "healthy" && "border-green-500/50 bg-green-500/5",
        !onClick && "cursor-default hover:bg-transparent"
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </button>
  )
}
