import type { Metadata } from "next"
import { MissionCard } from "@/components/dashboard/mission-card"
import { FeaturedMissionCard } from "@/components/dashboard/home-widgets"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getDashboardData } from "@/lib/dashboard"

export const metadata: Metadata = {
  title: "Missions",
  description: "Complete missions to earn Points and XP.",
}

export default async function MissionsPage() {
  const { missions } = await getDashboardData()
  const all = missions
  const required = all.filter((m) => m.required)
  const bonus = all.filter((m) => !m.required)
  const completed = all.filter((m) => m.status === "completed")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Missions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete missions from today&apos;s Drop to earn Points, XP, and keep your streak.
        </p>
      </div>

      <FeaturedMissionCard />

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="required">Required</TabsTrigger>
          <TabsTrigger value="bonus">Bonus</TabsTrigger>
          <TabsTrigger value="done">Done</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4 flex flex-col gap-3">
          {all.map((m) => (
            <MissionCard key={m.id} mission={m} />
          ))}
        </TabsContent>
        <TabsContent value="required" className="mt-4 flex flex-col gap-3">
          {required.map((m) => (
            <MissionCard key={m.id} mission={m} />
          ))}
        </TabsContent>
        <TabsContent value="bonus" className="mt-4 flex flex-col gap-3">
          {bonus.map((m) => (
            <MissionCard key={m.id} mission={m} />
          ))}
        </TabsContent>
        <TabsContent value="done" className="mt-4 flex flex-col gap-3">
          {completed.length > 0 ? (
            completed.map((m) => <MissionCard key={m.id} mission={m} />)
          ) : (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No completed missions yet today.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
