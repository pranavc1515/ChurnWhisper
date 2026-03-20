import { Link } from "react-router-dom"

const links = {
  Product: [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#pricing", label: "Pricing" },
  ],
  Company: [
    { href: "/auth", label: "Login" },
    { href: "/auth?tab=register", label: "Sign Up" },
  ],
  Legal: [
    { href: "#", label: "Privacy" },
    { href: "#", label: "Terms" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-3">
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-display text-sm font-semibold text-muted-foreground uppercase">
                {title}
              </h4>
              <ul className="mt-4 space-y-2">
                {items.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex items-center justify-between border-t border-border pt-8">
          <Link to="/" className="font-display font-bold text-foreground">
            ChurnWhisper
          </Link>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ChurnWhisper
          </p>
        </div>
      </div>
    </footer>
  )
}
