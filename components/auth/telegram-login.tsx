"use client"

import { useEffect, useRef } from "react"

// Renders Telegram's official Login Widget. On success Telegram redirects the
// top window to `data-auth-url` (/api/auth/telegram) with the signed payload.
export function TelegramLogin({ botUsername }: { botUsername: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Telegram rejects a username with a leading "@" or surrounding whitespace
    // with an "Username invalid" error, so normalize it before use.
    const normalizedUsername = botUsername.trim().replace(/^@/, "")
    if (!normalizedUsername) return

    container.innerHTML = ""
    const script = document.createElement("script")
    script.src = "https://telegram.org/js/telegram-widget.js?22"
    script.async = true
    script.setAttribute("data-telegram-login", normalizedUsername)
    script.setAttribute("data-size", "large")
    script.setAttribute("data-radius", "20")
    script.setAttribute("data-request-access", "write")
    script.setAttribute("data-auth-url", "/api/auth/telegram")
    container.appendChild(script)

    return () => {
      container.innerHTML = ""
    }
  }, [botUsername])

  return (
    <div className="flex justify-center">
      <div ref={containerRef} aria-label="Log in with Telegram" />
    </div>
  )
}
