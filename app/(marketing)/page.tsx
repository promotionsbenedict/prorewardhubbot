import { Hero } from "@/components/marketing/hero"
import { CtaSection, FeatureGrid, HowItWorksPreview, StatsStrip } from "@/components/marketing/home-sections"

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <HowItWorksPreview />
      <StatsStrip />
      <CtaSection />
    </>
  )
}
