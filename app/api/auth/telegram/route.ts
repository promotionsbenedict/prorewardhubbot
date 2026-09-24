import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  verifyTelegramAuth,
  isFresh,
  telegramCredentials,
  telegramDisplayName,
  type TelegramAuthData,
} from "@/lib/telegram"

function fail(request: Request, reason: string) {
console.error("[Telegram Login Failed]", reason)

  const url = new URL("/login", process.env.BETTER_AUTH_URL!)
  url.searchParams.set("error", reason)
  return NextResponse.redirect(url)
}

// Telegram's Login Widget redirects here with the signed user payload as query
// params. We verify the signature, then sign the user into Better Auth using a
// synthetic, deterministic email/password derived from their Telegram id.
export async function GET(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return fail(request, "telegram_unavailable")

  const params = Object.fromEntries(new URL(request.url).searchParams.entries())
console.log("[Telegram Debug]", {
  keys: Object.keys(params),
  hasId: !!params.id,
  hasHash: !!params.hash,
  hasAuthDate: !!params.auth_date,
  authDate: params.auth_date,
})
  if (!params.id || !params.hash || !params.auth_date) {
    return fail(request, "telegram_invalid")
  }

  if (!verifyTelegramAuth(params, botToken)) {
    return fail(request, "telegram_invalid")
  }
  if (!isFresh(params.auth_date)) {
    return fail(request, "telegram_expired")
  }

  const data = params as TelegramAuthData
  const { email, password } = telegramCredentials(data.id)
  const name = telegramDisplayName(data)

  // Try to sign in first; if the account doesn't exist yet, create it. Both
  // return a Response carrying the Set-Cookie session header, which we forward
  // onto our redirect so the browser is actually logged in.
  let authResponse: Response
  try {
    authResponse = await auth.api.signInEmail({
      body: { email, password },
      asResponse: true,
    })
  } catch {
    authResponse = new Response(null, { status: 401 })
  }

  if (!authResponse.ok) {
    try {
      authResponse = await auth.api.signUpEmail({
        body: { email, password, name, image: data.photo_url },
        asResponse: true,
      })
    } catch {
      return fail(request, "telegram_failed")
    }
  }

  if (!authResponse.ok) {
    return fail(request, "telegram_failed")
  }

  const redirect = NextResponse.redirect(
  new URL("/app", process.env.BETTER_AUTH_URL!)
)
  const setCookie = authResponse.headers.getSetCookie()
  for (const cookie of setCookie) {
    redirect.headers.append("set-cookie", cookie)
  }
  return redirect
}
