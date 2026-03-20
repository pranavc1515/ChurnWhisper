import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Search, Bell, ChevronLeft, ChevronRight, LogOut, Settings, User } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useAppStore } from "@/store/appStore"
import { ThemeToggle } from "@/components/landing/ThemeToggle"
import { getDashboardSummary } from "@/api/dashboard"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/upload", label: "Upload Data", icon: "📤" },
  { to: "/playbook", label: "Playbook", icon: "📋" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useAppStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [avatarOpen, setAvatarOpen] = useState(false)

  const { data: summary } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: getDashboardSummary,
  })
  const criticalCount = summary?.critical_count ?? 0
  const revenueAtRisk = summary?.revenue_at_risk ?? 0

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-card transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-56"
        )}
      >
        <div className={cn(
          "flex h-16 items-center border-b border-border",
          sidebarCollapsed ? "justify-center px-2" : "justify-between px-4"
        )}>
          {!sidebarCollapsed && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="font-display font-bold text-foreground">Churn</span>
              <span className="font-display font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Whisper
              </span>
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="rounded-md p-1.5 hover:bg-muted transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === item.to
                  ? "border-l-4 border-primary bg-primary/10 text-primary pl-2"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {!sidebarCollapsed && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center gap-2 rounded-md bg-brand-danger/10 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-brand-danger animate-pulse" />
              <div>
                <p className="font-mono font-semibold text-brand-danger">{criticalCount}</p>
                <p className="text-xs text-muted-foreground">Critical accounts</p>
              </div>
            </div>
            <div className="rounded-md bg-muted/50 px-3 py-2">
              <p className="font-mono text-sm font-semibold text-brand-danger">
                {formatCurrency(revenueAtRisk)}
              </p>
              <p className="text-xs text-muted-foreground">at risk</p>
            </div>
          </div>
        )}

        {sidebarCollapsed && (
          <div className="border-t border-border p-2">
            <div className="flex flex-col items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-brand-danger animate-pulse" />
              <span className="font-mono text-xs font-semibold text-brand-danger">
                {criticalCount}
              </span>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-xl px-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="relative rounded-md p-2 hover:bg-muted transition-colors">
              <Bell className="h-5 w-5" />
              {criticalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-danger text-[10px] font-bold text-white">
                  {criticalCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="flex items-center gap-2 rounded-full border-2 border-primary p-1"
              >
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>
                <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">{user?.name}</span>
              </button>

              {avatarOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setAvatarOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-card py-1 shadow-lg z-50">
                    <Link
                      to="/settings"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setAvatarOpen(false)
                        logout()
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
