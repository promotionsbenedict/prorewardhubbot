import "server-only"

import { cache } from "react"
import { headers } from "next/headers"
import { count, desc, eq, sum } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { activityLog, missionCompletion, profile, redemption, user, withdrawal } from "@/lib/db/schema"

export type AdminContext = {
  user: { id: string; name: string; email: string } | null
  role: string
  isAdmin: boolean
  adminsExist: boolean
}

// Resolved once per request. Roles live on the `user` table (not in the Better
// Auth session), so we read the role directly from the database.
export const getAdminContext = cache(async (): Promise<AdminContext> => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return { user: null, role: "user", isAdmin: false, adminsExist: false }
  }

  const [me] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)
  const role = me?.role ?? "user"

  const [admins] = await db.select({ c: count() }).from(user).where(eq(user.role, "admin"))
  const adminsExist = (admins?.c ?? 0) > 0

  return {
    user: { id: session.user.id, name: session.user.name, email: session.user.email },
    role,
    isAdmin: role === "admin",
    adminsExist,
  }
})

export type AdminOverview = {
  totalUsers: number
  totalPoints: number
  pendingRedemptions: number
  totalRedemptions: number
  missionsCompleted: number
  pendingWithdrawals: number
  pointsWithdrawn: number
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const [users] = await db.select({ c: count() }).from(user)
  const [pts] = await db.select({ s: sum(profile.points) }).from(profile)
  const [pending] = await db
    .select({ c: count() })
    .from(redemption)
    .where(eq(redemption.status, "Pending"))
  const [redeemed] = await db.select({ c: count() }).from(redemption)
  const [missions] = await db.select({ c: count() }).from(missionCompletion)
  const [pendingWd] = await db
    .select({ c: count() })
    .from(withdrawal)
    .where(eq(withdrawal.status, "Pending"))
  const [paidWd] = await db
    .select({ s: sum(withdrawal.amount) })
    .from(withdrawal)
    .where(eq(withdrawal.status, "Paid"))

  return {
    totalUsers: users?.c ?? 0,
    totalPoints: Number(pts?.s ?? 0),
    pendingRedemptions: pending?.c ?? 0,
    totalRedemptions: redeemed?.c ?? 0,
    missionsCompleted: missions?.c ?? 0,
    pendingWithdrawals: pendingWd?.c ?? 0,
    pointsWithdrawn: Number(paidWd?.s ?? 0),
  }
}

export type AdminWithdrawalRow = {
  id: number
  userId: string
  amount: number
  method: string
  destination: string
  status: string
  createdAt: Date
  userName: string | null
  userEmail: string | null
}

export async function getAdminWithdrawals(): Promise<AdminWithdrawalRow[]> {
  return db
    .select({
      id: withdrawal.id,
      userId: withdrawal.userId,
      amount: withdrawal.amount,
      method: withdrawal.method,
      destination: withdrawal.destination,
      status: withdrawal.status,
      createdAt: withdrawal.createdAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(withdrawal)
    .leftJoin(user, eq(user.id, withdrawal.userId))
    .orderBy(desc(withdrawal.createdAt))
}

export type AdminUserRow = {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
  points: number | null
  xp: number | null
  streak: number | null
}

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      points: profile.points,
      xp: profile.xp,
      streak: profile.streak,
    })
    .from(user)
    .leftJoin(profile, eq(profile.userId, user.id))
    .orderBy(desc(user.createdAt))
}

export type AdminRedemptionRow = {
  id: number
  rewardName: string
  cost: number
  status: string
  createdAt: Date
  userName: string | null
  userEmail: string | null
}

export async function getAdminRedemptions(): Promise<AdminRedemptionRow[]> {
  return db
    .select({
      id: redemption.id,
      rewardName: redemption.rewardName,
      cost: redemption.cost,
      status: redemption.status,
      createdAt: redemption.createdAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(redemption)
    .leftJoin(user, eq(user.id, redemption.userId))
    .orderBy(desc(redemption.createdAt))
}

// Small helper used by the redemptions overview widget.
export async function getRecentActivityCount(): Promise<number> {
  const [rows] = await db.select({ c: count() }).from(activityLog)
  return rows?.c ?? 0
}
