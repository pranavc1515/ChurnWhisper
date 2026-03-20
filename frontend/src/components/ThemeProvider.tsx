import { useEffect } from "react"
import { useAppStore } from "@/store/appStore"

function getResolvedTheme(theme: string): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }
  return theme as "light" | "dark"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    const apply = () => {
      const resolved = getResolvedTheme(theme)
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(resolved)
    }
    apply()
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      mq.addEventListener("change", apply)
      return () => mq.removeEventListener("change", apply)
    }
  }, [theme])

  return <>{children}</>
}
