import { CatalogManager } from "@/components/admin/catalog-manager"
import { getAllAchievements, getAllMissions, getAllStreakMilestones } from "@/lib/catalog"

export const dynamic = "force-dynamic"

export default async function AdminCatalogPage() {
  const [missions, achievements, milestones] = await Promise.all([
    getAllMissions(),
    getAllAchievements(),
    getAllStreakMilestones(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Catalog</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the missions, achievements, and streak milestones members see across the app.
        </p>
      </div>

      <CatalogManager missions={missions} achievements={achievements} milestones={milestones} />
    </div>
  )
}
