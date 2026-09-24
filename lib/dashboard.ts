import "server-only"

import { cache } from "react"
import { headers } from "next/headers"
import { and, count, desc, eq, gte, inArray } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { activityLog, missionCompletion, profile, redemption, user } from "@/lib/db/schema"
import { communityDrop as communityDropConfig, rewards as rewardCatalog } from "@/lib/data"
import { getAchievementDefs, getMissionCatalog, type AchievementDef } from "@/lib/catalog"
import type { Achievement, ActivityItem, CommunityDrop, Mission, NotificationItem, Referral, Reward } from "@/lib/types"

export type LiveUser = {
  id: string
  name: string
  handle: string
  initials: string
  memberSince: string
  points: number
  xp: number
  proScore: number
  streak: number
  telegramConnected: boolean
  referralCode: string
}

export type DashboardData = {
  user: LiveUser
  missions: Mission[]
  activity: ActivityItem[]
  rewards: Reward[]
  achievements: Achievement[]
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "PR"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function makeReferralCode(name: string): string {
  const base = (name.split(/\s+/)[0] || "PRO").replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 6) || "PRO"
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `${base}${suffix}`
}

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)))
}

type AchievementStats = { completions: number; streak: number; activeReferrals: number }

// Maps an achievement's metric onto the member's current progress value.
function metricValue(metric: string, stats: AchievementStats): number {
  switch (metric) {
    case "streak":
      return stats.streak
    case "referrals":
      return stats.activeReferrals
    case "drops":
    case "missions":
      return stats.completions
    default:
      return stats.completions
  }
}

function deriveAchievements(defs: AchievementDef[], stats: AchievementStats): Achievement[] {
  return defs.map((def) => {
    const current = metricValue(def.metric, stats)
    // "custom" achievements (e.g. Early Member) unlock for everyone.
    const unlocked = def.metric === "custom" ? true : current >= def.goal
    const showProgress = !unlocked && def.goal > 1
    return {
      id: def.id,
      name: def.title,
      description: def.description,
      unlocked,
      progress: showProgress ? Math.min(current, def.goal) : undefined,
      goal: showProgress ? def.goal : undefined,
      shareable: true,
      points: def.points || undefined,
    }
  })
}

async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

export const requireUser = cache(async () => {
  const user = await getSessionUser()
  if (!user) throw new Error("Unauthorized")
  return user
})

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

export const getDashboardData = cache(async (): Promise<DashboardData> => {
  const sessionUser = await requireUser()
  const prof = await ensureProfile(sessionUser.id, sessionUser.name)

  const start = startOfToday()

  const [allCompletions, redemptions, activityRows, activeReferrals, missionCatalog, achievementDefs] =
    await Promise.all([
      db.select().from(missionCompletion).where(eq(missionCompletion.userId, sessionUser.id)),
      db.select().from(redemption).where(eq(redemption.userId, sessionUser.id)),
      db
        .select()
        .from(activityLog)
        .where(eq(activityLog.userId, sessionUser.id))
        .orderBy(desc(activityLog.createdAt))
        .limit(12),
      countActiveReferrals(sessionUser.id),
      getMissionCatalog(),
      getAchievementDefs(),
    ])

  const totalCompletions = allCompletions.length
  const completedTodayIds = new Set(
    allCompletions.filter((c) => c.createdAt >= start).map((c) => c.missionId),
  )
  const redeemedIds = new Set(redemptions.map((r) => r.rewardId))

  const missions: Mission[] = missionCatalog.map((m) => {
    const done = completedTodayIds.has(m.id)
    return { ...m, status: done ? "completed" : "todo", cta: done ? "Done" : m.cta }
  })

  const rewards: Reward[] = rewardCatalog.map((r) =>
    redeemedIds.has(r.id) && (r.status === "Eligible" || r.status === "Awarded")
      ? { ...r, status: "Pending" as const }
      : r,
  )

  const activity: ActivityItem[] = activityRows.map((a) => ({
    id: String(a.id),
    icon: a.icon as ActivityItem["icon"],
    title: a.title,
    meta: a.meta,
    time: relativeTime(a.createdAt),
    amount: a.amount ?? undefined,
  }))

  const proScore = clampScore(35 + prof.streak * 4 + totalCompletions * 1.2 + redemptions.length * 3)

  const user: LiveUser = {
    id: sessionUser.id,
    name: sessionUser.name,
    handle: `@${(sessionUser.name.split(/\s+/)[0] || "member").toLowerCase()}`,
    initials: initialsOf(sessionUser.name),
    memberSince: formatMonthYear(sessionUser.createdAt ?? prof.createdAt),
    points: prof.points,
    xp: prof.xp,
    proScore,
    streak: prof.streak,
    telegramConnected: prof.telegramConnected,
    referralCode: prof.referralCode,
  }

  return {
    user,
    missions,
    activity,
    rewards,
    achievements: deriveAchievements(achievementDefs, {
      completions: totalCompletions,
      streak: prof.streak,
      activeReferrals,
    }),
  }
})

// --- Referrals -------------------------------------------------------------

export type ReferralStats = {
  total: number
  active: number
  qualified: number
  pointsEarned: number
  missionProgress: { current: number; goal: number; label: string }
}

export type ReferralData = {
  referrals: Referral[]
  stats: ReferralStats
}

// Points attributed to the referrer per referral, by the tier the referred
// member has reached. These mirror the amounts credited in the mission action.
const REFERRAL_TIER_POINTS = { Joined: 100, Active: 300, Qualified: 500 } as const

async function loadReferralUsage(referrerUserId: string) {
  const referred = await db
    .select({ userId: profile.userId, name: user.name, createdAt: user.createdAt })
    .from(profile)
    .innerJoin(user, eq(profile.userId, user.id))
    .where(eq(profile.referredBy, referrerUserId))

  if (referred.length === 0) {
    return { referred, byUser: new Map<string, { total: number; today: number }>() }
  }

  const ids = referred.map((r) => r.userId)
  const completions = await db
    .select({ userId: missionCompletion.userId, createdAt: missionCompletion.createdAt })
    .from(missionCompletion)
    .where(inArray(missionCompletion.userId, ids))

  const start = startOfToday()
  const byUser = new Map<string, { total: number; today: number }>()
  for (const id of ids) byUser.set(id, { total: 0, today: 0 })
  for (const c of completions) {
    const entry = byUser.get(c.userId)
    if (!entry) continue
    entry.total += 1
    if (c.createdAt >= start) entry.today += 1
  }
  return { referred, byUser }
}

async function countActiveReferrals(referrerUserId: string): Promise<number> {
  const { byUser } = await loadReferralUsage(referrerUserId)
  let active = 0
  for (const v of byUser.values()) if (v.total >= 1) active += 1
  return active
}

export const getReferralData = cache(async (): Promise<ReferralData> => {
  const sessionUser = await requireUser()
  await ensureProfile(sessionUser.id, sessionUser.name)
  const { referred, byUser } = await loadReferralUsage(sessionUser.id)

  const referrals: Referral[] = referred.map((r) => {
    const usage = byUser.get(r.userId) ?? { total: 0, today: 0 }
    const status: Referral["status"] = usage.total >= 3 ? "Qualified" : usage.total >= 1 ? "Active" : "Joined"
    return {
      id: r.userId,
      name: r.name,
      status,
      joinedAgo: relativeTime(r.createdAt),
      pointsEarned: REFERRAL_TIER_POINTS[status],
    }
  })

  const active = referrals.filter((r) => r.status === "Active" || r.status === "Qualified").length
  const qualified = referrals.filter((r) => r.status === "Qualified").length
  const pointsEarned = referrals.reduce((sum, r) => sum + r.pointsEarned, 0)
  let current = 0
  for (const v of byUser.values()) if (v.today >= 1) current += 1

  return {
    referrals,
    stats: {
      total: referrals.length,
      active,
      qualified,
      pointsEarned,
      missionProgress: { current, goal: 2, label: "Get 2 friends to complete today's Drop" },
    },
  }
})

// --- Notifications ---------------------------------------------------------

const ICON_TO_KIND: Record<string, NotificationItem["kind"]> = {
  points: "drop",
  xp: "drop",
  streak: "drop",
  reward: "reward",
  referral: "referral",
  achievement: "system",
}

export const getNotifications = cache(async (): Promise<NotificationItem[]> => {
  const sessionUser = await requireUser()
  const rows = await db
    .select()
    .from(activityLog)
    .where(eq(activityLog.userId, sessionUser.id))
    .orderBy(desc(activityLog.createdAt))
    .limit(8)

  const dayAgo = Date.now() - 86_400_000
  return rows.map((r) => ({
    id: String(r.id),
    title: r.title,
    body: r.amount ? `${r.meta} · ${r.amount}` : r.meta,
    time: relativeTime(r.createdAt),
    unread: r.createdAt.getTime() >= dayAgo,
    kind: ICON_TO_KIND[r.icon] ?? "system",
  }))
})

// --- Community drop --------------------------------------------------------

export const getCommunityDrop = cache(async (): Promise<CommunityDrop> => {
  const rows = await db.select({ value: count() }).from(missionCompletion)
  const current = Number(rows[0]?.value ?? 0)
  return { ...communityDropConfig, current }
})
