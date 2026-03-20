import { AppShell } from "@/components/layout/AppShell"
import { useAppStore } from "@/store/appStore"
import { Moon, Sun, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

export function SettingsPage() {
  const { theme, setTheme } = useAppStore()

  return (
    <AppShell>
      <div className="p-6 max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Profile, scoring thresholds, and alert preferences.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display font-semibold">Appearance</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose light mode, dark mode, or follow your system preference.
          </p>
          <div className="mt-4 flex gap-2">
            {[
              { value: "light" as const, icon: Sun, label: "Light" },
              { value: "dark" as const, icon: Moon, label: "Dark" },
              { value: "system" as const, icon: Monitor, label: "System" },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                  theme === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
