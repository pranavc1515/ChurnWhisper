import { Link } from "react-router-dom"
import { DotGrid } from "@/components/animations"
import { DashboardMockup } from "./DashboardMockup"
import { MaterializeIn, FadeInUp } from "@/components/animations"

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
      <DotGrid dotSize={2} gap={30} opacity={0.15} pingEnabled />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <FadeInUp>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <span className="text-foreground">Hear the signals before</span>
            <br />
            <span className="text-foreground">customers say goodbye.</span>
          </h1>
        </FadeInUp>

        <MaterializeIn delay={0.3}>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-powered customer health scores that detect churn risk weeks before
            cancellation. Turn support tickets, NPS surveys, and usage data into
            retention action plans.
          </p>
        </MaterializeIn>

        <MaterializeIn delay={0.5}>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/auth?tab=register"
              className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-[0_0_20px_hsl(var(--brand-primary)/0.3)]"
            >
              Start Protecting Revenue →
            </Link>
            <a
              href="#how-it-works"
              className="rounded-md border border-input px-6 py-3 font-medium hover:bg-muted transition-colors"
            >
              Watch Demo ▶
            </a>
          </div>
        </MaterializeIn>

        <MaterializeIn delay={0.8}>
          <div className="mt-16">
            <DashboardMockup />
          </div>
        </MaterializeIn>

        <MaterializeIn delay={1}>
          <blockquote className="mt-12 text-muted-foreground italic">
            &ldquo;Saved ₹18L in revenue last quarter by catching 12 at-risk
            accounts before they cancelled.&rdquo;
          </blockquote>
        </MaterializeIn>
      </div>
    </section>
  )
}
