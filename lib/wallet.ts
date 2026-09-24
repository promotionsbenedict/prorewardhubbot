import "server-only"

import { cache } from "react"
import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { profile, withdrawal } from "@/lib/db/schema"
import { requireUser, makeReferralCode } from "@/lib/dashboard"

// Reward-economy conversion. 100 points = $1.00. Members must withdraw at
// least 500 points ($5.00) in a single request.
export const POINTS_PER_USD = 100
export const MIN_WITHDRAWAL = 500

export const WITHDRAWAL_METHODS = ["PayPal", "Crypto (USDT)", "Bank transfer"] as const
export type WithdrawalMethod = (typeof WITHDRAWAL_METHODS)[number]

export function pointsToUsd(points: number): string {
  return (points / POINTS_PER_USD).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })
}

export type WithdrawalRow = {
  id: number
  amount: number
  method: string
  destination: string
  status: string
  note: string | null
  createdAt: Date
  resolvedAt: Date | null
}

export type WalletData = {
  balance: number
  pendingTotal: number
  withdrawnTotal: number
  withdrawals: WithdrawalRow[]
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

export const getWalletData = cache(async (): Promise<WalletData> => {
  const sessionUser = await requireUser()
  const prof = await ensureProfile(sessionUser.id, sessionUser.name)

  const withdrawals = await db
    .select()
    .from(withdrawal)
    .where(eq(withdrawal.userId, sessionUser.id))
    .orderBy(desc(withdrawal.createdAt))

  const pendingTotal = withdrawals
    .filter((w) => w.status === "Pending" || w.status === "Approved")
    .reduce((sum, w) => sum + w.amount, 0)
  const withdrawnTotal = withdrawals
    .filter((w) => w.status === "Paid")
    .reduce((sum, w) => sum + w.amount, 0)

  return {
    balance: prof.points,
    pendingTotal,
    withdrawnTotal,
    withdrawals,
  }
})
