export type MissionType =
  | "check-in"
  | "visit"
  | "discover"
  | "telegram"
  | "social"
  | "app"
  | "code"
  | "quiz"
  | "custom"

export type MissionStatus = "todo" | "in-progress" | "completed"

export type Mission = {
  id: string
  type: MissionType
  title: string
  description: string
  points: number
  xp: number
  required: boolean
  status: MissionStatus
  cta: string
  verification: "instant" | "timed-visit" | "code" | "telegram" | "manual"
  durationSeconds?: number
}

export type DailyDrop = {
  id: string
  date: string
  title: string
  subtitle: string
  missions: Mission[]
}

export type RewardStatus = "Locked" | "Eligible" | "Pending" | "Awarded" | "Claimed" | "Expired"

export type RewardCategory =
  | "Airtime"
  | "Data"
  | "Cash"
  | "Voucher"
  | "Subscription"
  | "Code"
  | "Physical"
  | "Mystery"
  | "Prize Pool"

export type Reward = {
  id: string
  name: string
  description: string
  category: RewardCategory
  value: string
  status: RewardStatus
  requirement: string
  proScoreGate?: number
  spotsLeft?: number
  totalSpots?: number
  expiresIn?: string
}

export type Level = {
  name: string
  minXp: number
  color: string
}

export type Achievement = {
  id: string
  name: string
  description: string
  unlocked: boolean
  progress?: number
  goal?: number
  shareable: boolean
  points?: number
}

export type StreakMilestone = {
  day: number
  label: string
  reward: string
  reached: boolean
}

export type ActivityItem = {
  id: string
  icon: "points" | "xp" | "streak" | "reward" | "referral" | "achievement"
  title: string
  meta: string
  time: string
  amount?: string
}

export type NotificationItem = {
  id: string
  title: string
  body: string
  time: string
  unread: boolean
  kind: "drop" | "reward" | "referral" | "system" | "surprise"
}

export type Referral = {
  id: string
  name: string
  status: "Joined" | "Active" | "Qualified"
  joinedAgo: string
  pointsEarned: number
}

export type CommunityDrop = {
  id: string
  title: string
  description: string
  current: number
  target: number
  unit: string
  endsIn: string
  reward: string
}
