import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"
import { cn } from "@/lib/utils"

const links = [
  { to: "#features", label: "Features" },
  { to: "#how-it-works", label: "How It Works" },
  { to: "#pricing", label: "Pricing" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-card/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-display font-bold text-foreground">
            Churn
          </span>
          <span className="text-xl font-display font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Whisper
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.to}
              href={l.to}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:flex" />
          <Link
            to="/auth"
            className="hidden sm:inline-flex rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Login
          </Link>
          <Link
            to="/auth?tab=register"
            className="hidden sm:inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-[0_0_20px_hsl(var(--brand-primary)/0.3)]"
          >
            Start Free →
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md hover:bg-muted"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-xl px-4 py-4 space-y-2">
          {links.map((l) => (
            <a
              key={l.to}
              href={l.to}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-muted-foreground hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-2 flex gap-2">
            <ThemeToggle />
            <Link
              to="/auth"
              className="flex-1 rounded-md border border-input px-4 py-2 text-center text-sm"
            >
              Login
            </Link>
            <Link
              to="/auth?tab=register"
              className="flex-1 rounded-md bg-primary px-4 py-2 text-center text-sm text-primary-foreground"
            >
              Start Free
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
