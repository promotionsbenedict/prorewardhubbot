import type {
  Achievement,
  ActivityItem,
  CommunityDrop,
  DailyDrop,
  Level,
  NotificationItem,
  Referral,
  Reward,
  StreakMilestone,
} from "./types"

export const user = {
  name: "Amara Okoye",
  handle: "@amara",
  initials: "AO",
  memberSince: "Mar 2025",
  points: 4820,
  xp: 6350,
  proScore: 74,
  streak: 6,
  telegramConnected: false,
  referralCode: "AMARA24",
}

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

export const dailyDrop: DailyDrop = {
  id: "drop-2026-09-17",
  date: "September 17, 2026",
  title: "Today's Daily Drop",
  subtitle: "Complete the required missions to keep your streak alive",
  missions: [
    {
      id: "m1",
      type: "check-in",
      title: "Daily Check-in",
      description: "Tap in to claim your daily points and keep momentum going.",
      points: 50,
      xp: 20,
      required: true,
      status: "completed",
      cta: "Checked in",
      verification: "instant",
    },
    {
      id: "m2",
      type: "visit",
      title: "Visit Nova Finance",
      description: "Explore the new Nova Finance landing page for 15 seconds.",
      points: 120,
      xp: 40,
      required: true,
      status: "completed",
      cta: "Visit site",
      verification: "timed-visit",
      durationSeconds: 15,
    },
    {
      id: "m3",
      type: "quiz",
      title: "Answer: What is a Daily Drop?",
      description: "Quick question to test what you know about the platform.",
      points: 80,
      xp: 30,
      required: true,
      status: "in-progress",
      cta: "Answer",
      verification: "instant",
    },
    {
      id: "m4",
      type: "telegram",
      title: "Join the Pulse Channel",
      description: "Join our partner Telegram channel for launch alerts.",
      points: 150,
      xp: 50,
      required: false,
      status: "todo",
      cta: "Join channel",
      verification: "telegram",
    },
    {
      id: "m5",
      type: "code",
      title: "Enter Launch Code",
      description: "Found the secret code on our X post? Enter it here.",
      points: 200,
      xp: 60,
      required: false,
      status: "todo",
      cta: "Enter code",
      verification: "code",
    },
  ],
}

export const featuredMission = {
  id: "feat-1",
  title: "Discover Project: Lumen Wallet",
  description: "Be one of the first to explore Lumen Wallet before its public launch.",
  points: 300,
  xp: 100,
  tag: "Featured",
}

export const streakMilestones: StreakMilestone[] = [
  { day: 3, label: "Day 3", reward: "+150 Points", reached: true },
  { day: 7, label: "Day 7", reward: "Bronze Reward Entry", reached: false },
  { day: 14, label: "Day 14", reward: "+500 Points & Badge", reached: false },
  { day: 30, label: "Day 30", reward: "Mystery Reward Drop", reached: false },
]

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
    status: "Pending",
    requirement: "Verification in progress",
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
    status: "Awarded",
    requirement: "Earned from 7-day streak",
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

export const achievements: Achievement[] = [
  { id: "a1", name: "First Drop", description: "Complete your first Daily Drop", unlocked: true, shareable: true, points: 100 },
  { id: "a2", name: "3-Day Streak", description: "Stay active for 3 days in a row", unlocked: true, shareable: true, points: 150 },
  { id: "a3", name: "7-Day Streak", description: "Keep your streak alive for a week", unlocked: false, progress: 6, goal: 7, shareable: true, points: 300 },
  { id: "a4", name: "First Active Referral", description: "Invite a friend who becomes active", unlocked: true, shareable: true, points: 200 },
  { id: "a5", name: "5 Active Referrals", description: "Grow your crew to 5 active members", unlocked: false, progress: 3, goal: 5, shareable: true, points: 500 },
  { id: "a6", name: "Early Member", description: "Joined during the launch season", unlocked: true, shareable: true },
  { id: "a7", name: "30-Day Streak", description: "A full month of daily activity", unlocked: false, progress: 6, goal: 30, shareable: true, points: 1000 },
  { id: "a8", name: "Mission Master", description: "Complete 100 missions", unlocked: false, progress: 47, goal: 100, shareable: false, points: 750 },
]

export const referrals: Referral[] = [
  { id: "ref1", name: "Kwame B.", status: "Qualified", joinedAgo: "5 days ago", pointsEarned: 500 },
  { id: "ref2", name: "Zainab M.", status: "Active", joinedAgo: "1 week ago", pointsEarned: 300 },
  { id: "ref3", name: "Daniel O.", status: "Active", joinedAgo: "2 weeks ago", pointsEarned: 300 },
  { id: "ref4", name: "Fatima S.", status: "Joined", joinedAgo: "3 days ago", pointsEarned: 100 },
  { id: "ref5", name: "Chidi N.", status: "Joined", joinedAgo: "yesterday", pointsEarned: 100 },
]

export const referralStats = {
  total: 12,
  active: 5,
  qualified: 3,
  pointsEarned: 2400,
  missionProgress: { current: 1, goal: 2, label: "Get 2 friends to complete today's Drop" },
}

export const activity: ActivityItem[] = [
  { id: "act1", icon: "points", title: "Daily Check-in", meta: "Daily Drop", time: "2h ago", amount: "+50" },
  { id: "act2", icon: "reward", title: "Visited Nova Finance", meta: "Mission complete", time: "2h ago", amount: "+120" },
  { id: "act3", icon: "referral", title: "Kwame became qualified", meta: "Referral", time: "5h ago", amount: "+500" },
  { id: "act4", icon: "streak", title: "6-day streak reached", meta: "Streak", time: "1d ago" },
  { id: "act5", icon: "achievement", title: "Unlocked First Active Referral", meta: "Achievement", time: "1d ago", amount: "+200" },
  { id: "act6", icon: "xp", title: "Reached 6,350 XP", meta: "Progression", time: "2d ago" },
]

export const notifications: NotificationItem[] = [
  { id: "n1", title: "Surprise Drop is live", body: "A limited-time drop just appeared. 45 minutes left to claim.", time: "12m ago", unread: true, kind: "surprise" },
  { id: "n2", title: "Reward awarded", body: "Your $10 Gift Voucher is ready to claim.", time: "3h ago", unread: true, kind: "reward" },
  { id: "n3", title: "Streak reminder", body: "You are 1 mission away from keeping your 6-day streak.", time: "6h ago", unread: false, kind: "drop" },
  { id: "n4", title: "Referral qualified", body: "Kwame completed 3 days of activity. You earned 500 Points.", time: "5h ago", unread: false, kind: "referral" },
  { id: "n5", title: "New Daily Drop", body: "Today's Drop has 5 missions waiting for you.", time: "9h ago", unread: false, kind: "drop" },
]

export const communityDrop: CommunityDrop = {
  id: "cd1",
  title: "Community Drop: 100K Verified Actions",
  description: "Everyone wins when we hit the global goal together. Every verified mission counts.",
  current: 73821,
  target: 100000,
  unit: "verified actions",
  endsIn: "4 days",
  reward: "Global prize pool unlocked for all active members",
}

export const surpriseDrop = {
  active: true,
  title: "Surprise Drop",
  description: "A flash mission just dropped. Complete it before the timer runs out.",
  points: 250,
  minutesLeft: 45,
}
