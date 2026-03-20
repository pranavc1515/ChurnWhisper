import { Link } from "react-router-dom"
import { DotGrid } from "@/components/animations"

export function CTASection() {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <DotGrid dotSize={2} gap={30} opacity={0.1} pingEnabled={false} />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          Stop losing customers to silence.
        </h2>
        <Link
          to="/auth?tab=register"
          className="mt-8 inline-block rounded-md bg-primary px-8 py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-[0_0_30px_hsl(var(--brand-primary)/0.3)]"
        >
          Start Protecting Revenue →
        </Link>
      </div>
    </section>
  )
}
