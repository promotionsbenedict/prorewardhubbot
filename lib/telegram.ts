import "server-only"
import crypto from "crypto"

export type TelegramAuthData = {
  id: string
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: string
  hash: string
}

// Telegram signs the login payload with HMAC-SHA256 using SHA256(bot_token) as
// the key. We recompute it and constant-time compare to prove the data really
// came from Telegram and wasn't tampered with.
export function verifyTelegramAuth(data: Record<string, string>, botToken: string): boolean {
  const { hash, ...rest } = data
  if (!hash) return false

  const dataCheckString = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key]}`)
    .join("\n")

  const secretKey = crypto.createHash("sha256").update(botToken).digest()
  const computed = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex")

  const a = Buffer.from(computed, "hex")
  const b = Buffer.from(hash, "hex")
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

// Reject stale payloads to prevent replay of a captured login URL.
export function isFresh(authDate: string, maxAgeSeconds = 300): boolean {
  const ts = Number(authDate)
  if (!Number.isFinite(ts)) return false
  const now = Math.floor(Date.now() / 1000)
  return now - ts <= maxAgeSeconds && ts <= now + 60
}

// Map a Telegram identity onto a Better Auth email/password account. The email
// is synthetic and stable per Telegram id; the password is derived from the
// server secret so it's deterministic, never stored anywhere, and unguessable
// without BETTER_AUTH_SECRET.
export function telegramCredentials(id: string) {
  const secret = process.env.BETTER_AUTH_SECRET ?? ""
  const password = crypto.createHmac("sha256", secret).update(`telegram:${id}`).digest("hex")
  return {
    email: `tg-${id}@telegram.local`,
    password, // 64 hex chars, satisfies min length
  }
}

export function telegramDisplayName(data: TelegramAuthData): string {
  const full = [data.first_name, data.last_name].filter(Boolean).join(" ").trim()
  return full || data.username || `Telegram ${data.id}`
}
