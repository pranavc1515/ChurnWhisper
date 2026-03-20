import { DotGrid } from "@/components/animations/DotGrid"
import { RadarPing } from "@/components/animations/RadarPing"

export function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-background">
      <DotGrid dotSize={2} gap={30} opacity={0.15} pingEnabled />
      <RadarPing color="green" frequency={3000} maxPings={5} />
    </div>
  )
}
