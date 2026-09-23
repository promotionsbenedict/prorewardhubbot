"use client"

import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TelegramLogin } from "@/components/auth/telegram-login"

// NEXT_PUBLIC vars are inlined at build time, so this reads correctly on the
// client. When the bot username is configured we render Telegram's real Login
// Widget; otherwise we keep the "coming soon" affordance.
const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME

export function TelegramSection({ label }: { label: string }) {
  if (BOT_USERNAME) {
    return <TelegramLogin botUsername={BOT_USERNAME} />
  }

  return (
    <div className="relative">
      <Button variant="outline" disabled className="w-full rounded-full">
        <Send className="size-4" />
        {label}
      </Button>
      <span className="absolute -top-2 right-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
        Soon
      </span>
    </div>
  )
}
