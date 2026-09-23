import "server-only"

import { cache } from "react"
import { headers } from "next/headers"
import { and, desc, eq, gte } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { activityLog, missionCompletion, profile, redemption } from "@/lib/db/schema"
import {
  achievements as achievementDefs,
  dailyDrop,
  referralStats,
  rewards as rewardCatalog,
} from "@/lib/data"
import type { Achievement, ActivityItem, Mission, Reward } from "@/lib/types"

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

function deriveAchievements(stats: {
  completions: number
  streak: number
  activeReferrals: number
}): Achievement[] {
  const test: Record<string, { unlocked: boolean; progress?: number; goal?: number }> = {
    a1: { unlocked: stats.completions >= 1 },
    a2: { unlocked: stats.streak >= 3 },
    a3: { unlocked: stats.streak >= 7, progress: Math.min(stats.streak, 7), goal: 7 },
    a4: { unlocked: stats.activeReferrals >= 1 },
    a5: { unlocked: stats.activeReferrals >= 5, progress: Math.min(stats.activeReferrals, 5), goal: 5 },
    a6: { unlocked: true },
    a7: { unlocked: stats.streak >= 30, progress: Math.min(stats.streak, 30), goal: 30 },
    a8: { unlocked: stats.completions >= 100, progress: Math.min(stats.completions, 100), goal: 100 },
  }
  return achievementDefs.map((def) => {
    const t = test[def.id]
    if (!t) return def
    return {
      ...def,
      unlocked: t.unlocked,
      progress: t.unlocked ? undefined : t.progress,
      goal: t.unlocked ? undefined : t.goal,
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

  const [allCompletions, redemptions, activityRows] = await Promise.all([
    db.select().from(missionCompletion).where(eq(missionCompletion.userId, sessionUser.id)),
    db.select().from(redemption).where(eq(redemption.userId, sessionUser.id)),
    db
      .select()
      .from(activityLog)
      .where(eq(activityLog.userId, sessionUser.id))
      .orderBy(desc(activityLog.createdAt))
      .limit(12),
  ])

  const totalCompletions = allCompletions.length
  const completedTodayIds = new Set(
    allCompletions.filter((c) => c.createdAt >= start).map((c) => c.missionId),
  )
  const redeemedIds = new Set(redemptions.map((r) => r.rewardId))
  const activeReferrals = referralStats.active

  const missions: Mission[] = dailyDrop.missions.map((m) => {
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
    achievements: deriveAchievements({ completions: totalCompletions, streak: prof.streak, activeReferrals }),
  }
})
