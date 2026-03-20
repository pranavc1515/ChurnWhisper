import { Navbar } from "@/components/landing/Navbar"
import { Hero } from "@/components/landing/Hero"
import { ProblemSection } from "@/components/landing/ProblemSection"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { FeatureGrid } from "@/components/landing/FeatureGrid"
import { BeforeAfter } from "@/components/landing/BeforeAfter"
import { MetricsSection } from "@/components/landing/MetricsSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { CTASection } from "@/components/landing/CTASection"
import { Footer } from "@/components/landing/Footer"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <FeatureGrid />
        <BeforeAfter />
        <MetricsSection />
        <PricingSection />
        <CTASection />
        <Footer />
      </main>
    </div>
  )
}
