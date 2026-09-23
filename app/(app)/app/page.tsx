import type { Metadata } from "next"
import { StatTiles } from "@/components/dashboard/stat-tiles"
import { DailyDropCard } from "@/components/dashboard/daily-drop-card"
import {
  ActivityFeed,
  CommunityDropCard,
  FeaturedMissionCard,
  StreakCard,
  SurpriseDropBanner,
} from "@/components/dashboard/home-widgets"
import { getDashboardData } from "@/lib/dashboard"

export const metadata: Metadata = {
  title: "Home",
  description: "Your Daily Drop, streaks, and rewards at a glance.",
}

export default async function AppHomePage() {
  const { user, missions, activity } = await getDashboardData()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{user.name.split(" ")[0]}</h1>
      </div>

      <SurpriseDropBanner />
      <StatTiles user={user} />
      <DailyDropCard missions={missions} />

      <div className="grid gap-6 lg:grid-cols-2">
        <FeaturedMissionCard />
        <StreakCard streak={user.streak} />
      </div>

      <CommunityDropCard />
      <ActivityFeed activity={activity} />
    </div>
  )
}
