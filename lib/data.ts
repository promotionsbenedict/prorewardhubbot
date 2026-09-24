import type { CommunityDrop, Level, Reward } from "./types"

// Static catalog / definitions only. All per-user state (points, XP, streak,
// completions, redemptions, referrals, activity, notifications) is stored in
// the database and read through lib/dashboard.ts. Nothing in this file is
// user-specific demo data.

export const levels: Level[] = [
  { name: "Starter", minXp: 0, color: "oklch(0.7 0.02 286)" },
  { name: "Active", minXp: 1500, color: "oklch(0.7 0.15 220)" },
  { name: "Bronze", minXp: 4000, color: "oklch(0.66 0.13 55)" },
  { name: "Silver", minXp: 7500, color: "oklch(0.78 0.02 286)" },
  { name: "Gold", minXp: 12000, color: "oklch(0.82 0.16 82)" },
  { name: "Elite", minXp: 20000, color: "oklch(0.66 0.22 288)" },
]

export function levelInfo(xp: number) {
  let current = levels[0]
  let next: Level | null = null
  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i].minXp) {
      current = levels[i]
      next = levels[i + 1] ?? null
    }
  }
  const floor = current.minXp
  const ceil = next ? next.minXp : current.minXp
  const progress = next ? Math.round(((xp - floor) / (ceil - floor)) * 100) : 100
  return { current, next, progress, toNext: next ? next.minXp - xp : 0 }
}

// Daily Drop header copy. The mission list itself is admin-managed and loaded
// from the database via lib/catalog.ts.
export const dailyDropMeta = {
  date: "Today's Daily Drop",
  title: "Today's Daily Drop",
  subtitle: "Complete the required missions to keep your streak alive",
}

export const featuredMission = {
  id: "feat-1",
  title: "Discover Project: Lumen Wallet",
  description: "Be one of the first to explore Lumen Wallet before its public launch.",
  points: 300,
  xp: 100,
  tag: "Featured",
}

export const rewards: Reward[] = [
  {
    id: "r1",
    name: "$5 Airtime Top-up",
    description: "Instant mobile airtime credited to your number.",
    category: "Airtime",
    value: "$5.00",
    status: "Eligible",
    requirement: "Reach 4,000 Points",
  },
  {
    id: "r2",
    name: "1GB Mobile Data",
    description: "One gigabyte of mobile data valid for 30 days.",
    category: "Data",
    value: "1 GB",
    status: "Eligible",
    requirement: "Complete 3 Daily Drops",
  },
  {
    id: "r3",
    name: "$25 Cash Payout",
    description: "Direct cash reward paid to a linked wallet.",
    category: "Cash",
    value: "$25.00",
    status: "Locked",
    requirement: "Reach Silver level",
    proScoreGate: 80,
  },
  {
    id: "r4",
    name: "Premium Streaming Pass",
    description: "One month of premium streaming access.",
    category: "Subscription",
    value: "1 Month",
    status: "Eligible",
    requirement: "Reach 6,000 Points",
  },
  {
    id: "r5",
    name: "Weekly Prize Pool",
    description: "Entry into the shared weekly prize pool draw.",
    category: "Prize Pool",
    value: "$500 Pool",
    status: "Eligible",
    requirement: "Active this week",
    spotsLeft: 1240,
    totalSpots: 5000,
    expiresIn: "3 days",
  },
  {
    id: "r6",
    name: "Mystery Reward Box",
    description: "A surprise reward unlocked at a 30-day streak.",
    category: "Mystery",
    value: "???",
    status: "Locked",
    requirement: "Reach a 30-day streak",
  },
  {
    id: "r7",
    name: "$10 Gift Voucher",
    description: "Redeemable voucher for popular online stores.",
    category: "Voucher",
    value: "$10.00",
    status: "Eligible",
    requirement: "Reach 2,000 Points",
  },
  {
    id: "r8",
    name: "Elite Merch Drop",
    description: "Limited-edition physical merchandise pack.",
    category: "Physical",
    value: "Limited",
    status: "Locked",
    requirement: "Reach Elite level",
    proScoreGate: 90,
  },
]

// Global community goal config. The live `current` value is computed from the
// aggregate of all verified mission completions in lib/dashboard.ts.
export const communityDrop: CommunityDrop = {
  id: "cd1",
  title: "Community Drop: 100K Verified Actions",
  description: "Everyone wins when we hit the global goal together. Every verified mission counts.",
  current: 0,
  target: 100000,
  unit: "verified actions",
  endsIn: "4 days",
  reward: "Global prize pool unlocked for all active members",
}
