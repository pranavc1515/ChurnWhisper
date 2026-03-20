import { useAppStore } from "@/store/appStore"
import { Moon, Sun, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useAppStore()

  const cycle = () => {
    if (theme === "dark") setTheme("light")
    else if (theme === "light") setTheme("system")
    else setTheme("dark")
  }

  return (
    <button
      onClick={cycle}
      className={cn(
        "rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
        className
      )}
      title={`Theme: ${theme} (click to cycle)`}
    >
      {theme === "dark" && <Moon className="h-4 w-4" />}
      {theme === "light" && <Sun className="h-4 w-4" />}
      {theme === "system" && <Monitor className="h-4 w-4" />}
    </button>
  )
}
