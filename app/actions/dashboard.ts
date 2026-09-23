"use server"

import { and, eq, gte } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { activityLog, missionCompletion, profile, redemption } from "@/lib/db/schema"
import { makeReferralCode } from "@/lib/dashboard"
import { dailyDrop, rewards as rewardCatalog } from "@/lib/data"

async function requireSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user
}

async function ensureProfile(userId: string, name: string) {
  const rows = await db.select().from(profile).where(eq(profile.userId, userId)).limit(1)
  if (rows.length) return rows[0]
  const inserted = await db
    .insert(profile)
    .values({ userId, referralCode: makeReferralCode(name) })
    .onConflictDoNothing({ target: profile.userId })
    .returning()
  if (inserted.length) return inserted[0]
  const again = await db.select().from(profile).where(eq(profile.userId, userId)).limit(1)
  return again[0]
}

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export type ActionResult = { ok: boolean; message?: string }

export async function completeMission(missionId: string): Promise<ActionResult> {
  const sessionUser = await requireSessionUser()
  const mission = dailyDrop.missions.find((m) => m.id === missionId)
  if (!mission) return { ok: false, message: "Unknown mission" }

  const prof = await ensureProfile(sessionUser.id, sessionUser.name)
  const start = startOfToday()

  const existing = await db
    .select()
    .from(missionCompletion)
    .where(
      and(
        eq(missionCompletion.userId, sessionUser.id),
        eq(missionCompletion.missionId, missionId),
        gte(missionCompletion.createdAt, start),
      ),
    )
    .limit(1)
  if (existing.length) return { ok: true, message: "Already completed today" }

  await db.insert(missionCompletion).values({
    userId: sessionUser.id,
    missionId,
    points: mission.points,
    xp: mission.xp,
  })

  const updates: Partial<typeof profile.$inferInsert> = {
    points: prof.points + mission.points,
    xp: prof.xp + mission.xp,
  }

  if (mission.type === "check-in") {
    const last = prof.lastCheckIn ? startOfDay(prof.lastCheckIn) : null
    const today = startOfToday()
    let newStreak = 1
    if (last) {
      const diffDays = Math.round((today.getTime() - last.getTime()) / 86400000)
      if (diffDays === 0) newStreak = prof.streak || 1
      else if (diffDays === 1) newStreak = prof.streak + 1
      else newStreak = 1
    }
    updates.streak = newStreak
    updates.lastCheckIn = new Date()
  }

  await db.update(profile).set(updates).where(eq(profile.userId, sessionUser.id))

  await db.insert(activityLog).values({
    userId: sessionUser.id,
    icon: mission.type === "check-in" ? "streak" : "points",
    title: mission.title,
    meta: mission.required ? "Daily Drop mission" : "Bonus mission",
    amount: `+${mission.points}`,
  })

  revalidatePath("/app")
  revalidatePath("/app/missions")
  revalidatePath("/app/profile")
  return { ok: true }
}

export async function redeemReward(rewardId: string): Promise<ActionResult> {
  const sessionUser = await requireSessionUser()
  const reward = rewardCatalog.find((r) => r.id === rewardId)
  if (!reward) return { ok: false, message: "Unknown reward" }
  if (reward.status !== "Eligible" && reward.status !== "Awarded") {
    return { ok: false, message: "This reward is not available to redeem." }
  }

  await ensureProfile(sessionUser.id, sessionUser.name)

  const existing = await db
    .select()
    .from(redemption)
    .where(and(eq(redemption.userId, sessionUser.id), eq(redemption.rewardId, rewardId)))
    .limit(1)
  if (existing.length) return { ok: true, message: "Already requested" }

  await db.insert(redemption).values({
    userId: sessionUser.id,
    rewardId,
    rewardName: reward.name,
    cost: 0,
    status: "Pending",
  })

  await db.insert(activityLog).values({
    userId: sessionUser.id,
    icon: "reward",
    title: `Requested ${reward.name}`,
    meta: "Reward redemption",
    amount: null,
  })

  revalidatePath("/app/rewards")
  revalidatePath("/app")
  return { ok: true }
}
