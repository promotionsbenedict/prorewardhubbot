"use server"

import { and, count, eq, gte } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { activityLog, missionCompletion, profile, redemption } from "@/lib/db/schema"
import { makeReferralCode } from "@/lib/dashboard"
import { getMissionById } from "@/lib/catalog"
import { rewards as rewardCatalog } from "@/lib/data"

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
  const mission = await getMissionById(missionId)
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

  // Credit the referrer when this member crosses a referral tier. Completions
  // only ever increase, so the exact-count checks fire once each.
  if (prof.referredBy) {
    const totals = await db
      .select({ value: count() })
      .from(missionCompletion)
      .where(eq(missionCompletion.userId, sessionUser.id))
    const totalCompletions = Number(totals[0]?.value ?? 0)
    if (totalCompletions === 1) {
      await creditReferrer(prof.referredBy, 200, `${sessionUser.name} became active`)
    } else if (totalCompletions === 3) {
      await creditReferrer(prof.referredBy, 200, `${sessionUser.name} qualified`)
    }
  }

  revalidatePath("/app")
  revalidatePath("/app/missions")
  revalidatePath("/app/profile")
  return { ok: true }
}

async function creditReferrer(referrerUserId: string, points: number, title: string) {
  const rows = await db.select().from(profile).where(eq(profile.userId, referrerUserId)).limit(1)
  if (!rows.length) return
  await db
    .update(profile)
    .set({ points: rows[0].points + points })
    .where(eq(profile.userId, referrerUserId))
  await db.insert(activityLog).values({
    userId: referrerUserId,
    icon: "referral",
    title,
    meta: "Referral bonus",
    amount: `+${points}`,
  })
  revalidatePath("/app")
  revalidatePath("/app/invite")
}

// Links the current (newly signed-up) user to the referrer that owns `code`.
// Safe to call more than once; it is a no-op if a referrer is already set,
// the code is unknown, or the code belongs to the caller.
export async function claimReferral(code: string): Promise<ActionResult> {
  const trimmed = (code || "").trim().toUpperCase()
  if (!trimmed) return { ok: false }

  let sessionUser
  try {
    sessionUser = await requireSessionUser()
  } catch {
    return { ok: false }
  }

  const prof = await ensureProfile(sessionUser.id, sessionUser.name)
  if (prof.referredBy) return { ok: true }
  if (trimmed === prof.referralCode.toUpperCase()) return { ok: false }

  const rows = await db.select().from(profile).where(eq(profile.referralCode, trimmed)).limit(1)
  const referrer = rows[0]
  if (!referrer || referrer.userId === sessionUser.id) return { ok: false }

  await db.update(profile).set({ referredBy: referrer.userId }).where(eq(profile.userId, sessionUser.id))
  await creditReferrer(referrer.userId, 100, `${sessionUser.name} joined with your link`)
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
