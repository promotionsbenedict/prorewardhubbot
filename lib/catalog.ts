import "server-only"

import { cache } from "react"
import { and, asc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { achievement, mission, streakMilestone } from "@/lib/db/schema"
import type { Mission, StreakMilestone } from "@/lib/types"

// Admin-managed catalog loaders. These read the global mission / achievement /
// streak-milestone definitions from the database (previously hardcoded in
// lib/data.ts). Per-user state is layered on top in lib/dashboard.ts.

export type AchievementDef = {
  id: string
  title: string
  description: string
  icon: string
  points: number
  goal: number
  metric: string
  sortOrder: number
  active: boolean
}

// Active mission definitions, ordered for display. Status is a per-user
// concern, so the base status here is always "todo".
export const getMissionCatalog = cache(async (): Promise<Mission[]> => {
  const rows = await db
    .select()
    .from(mission)
    .where(eq(mission.active, true))
    .orderBy(asc(mission.sortOrder))
  return rows.map(toMission)
})

// Single active mission by id — used when verifying a completion server-side.
export async function getMissionById(id: string): Promise<Mission | null> {
  const rows = await db
    .select()
    .from(mission)
    .where(and(eq(mission.id, id), eq(mission.active, true)))
    .limit(1)
  return rows.length ? toMission(rows[0]) : null
}

function toMission(m: typeof mission.$inferSelect): Mission {
  return {
    id: m.id,
    type: m.type as Mission["type"],
    title: m.title,
    description: m.description,
    points: m.points,
    xp: m.xp,
    required: m.required,
    status: "todo",
    cta: m.cta,
    verification: m.verification as Mission["verification"],
    durationSeconds: m.durationSeconds ?? undefined,
  }
}

// Active achievement definitions, ordered for display.
export const getAchievementDefs = cache(async (): Promise<AchievementDef[]> => {
  const rows = await db
    .select()
    .from(achievement)
    .where(eq(achievement.active, true))
    .orderBy(asc(achievement.sortOrder))
  return rows.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    icon: a.icon,
    points: a.points,
    goal: a.goal,
    metric: a.metric,
    sortOrder: a.sortOrder,
    active: a.active,
  }))
})

// Active streak milestones, ordered by day. Reward is stored as an integer
// number of points and rendered as a label at read time.
export const getStreakMilestones = cache(async (): Promise<StreakMilestone[]> => {
  const rows = await db
    .select()
    .from(streakMilestone)
    .where(eq(streakMilestone.active, true))
    .orderBy(asc(streakMilestone.sortOrder))
  return rows.map((s) => ({
    day: s.day,
    label: s.label,
    reward: `+${s.reward.toLocaleString()} Points`,
    reached: false,
  }))
})

// --- Admin catalog rows ----------------------------------------------------
// These loaders return every row (including inactive) as plain serializable
// objects for the admin management screen.

export type AdminMissionRow = {
  id: string
  type: string
  title: string
  description: string
  points: number
  xp: number
  required: boolean
  cta: string
  verification: string
  durationSeconds: number | null
  sortOrder: number
  active: boolean
}

export type AdminAchievementRow = {
  id: string
  title: string
  description: string
  icon: string
  points: number
  goal: number
  metric: string
  sortOrder: number
  active: boolean
}

export type AdminStreakMilestoneRow = {
  id: string
  day: number
  reward: number
  label: string
  sortOrder: number
  active: boolean
}

export async function getAllMissions(): Promise<AdminMissionRow[]> {
  const rows = await db.select().from(mission).orderBy(asc(mission.sortOrder))
  return rows.map((m) => ({
    id: m.id,
    type: m.type,
    title: m.title,
    description: m.description,
    points: m.points,
    xp: m.xp,
    required: m.required,
    cta: m.cta,
    verification: m.verification,
    durationSeconds: m.durationSeconds,
    sortOrder: m.sortOrder,
    active: m.active,
  }))
}

export async function getAllAchievements(): Promise<AdminAchievementRow[]> {
  const rows = await db.select().from(achievement).orderBy(asc(achievement.sortOrder))
  return rows.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    icon: a.icon,
    points: a.points,
    goal: a.goal,
    metric: a.metric,
    sortOrder: a.sortOrder,
    active: a.active,
  }))
}

export async function getAllStreakMilestones(): Promise<AdminStreakMilestoneRow[]> {
  const rows = await db.select().from(streakMilestone).orderBy(asc(streakMilestone.sortOrder))
  return rows.map((s) => ({
    id: s.id,
    day: s.day,
    reward: s.reward,
    label: s.label,
    sortOrder: s.sortOrder,
    active: s.active,
  }))
}
