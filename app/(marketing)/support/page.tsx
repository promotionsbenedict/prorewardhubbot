import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, LifeBuoy, MessageCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHero } from "@/components/marketing/page-hero"

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with your Pro Reward Hub account, rewards, and missions.",
}

const channels = [
  {
    icon: Send,
    title: "Telegram support",
    body: "Fastest response. Message our support bot for account and reward help.",
    action: "@prorewardhub_bot",
    href: "https://t.me/prorewardhub_bot",
  },
  {
    icon: BookOpen,
    title: "Help center",
    body: "Browse guides on Daily Drops, streaks, Pro Score, and claiming rewards.",
    action: "Read the FAQ",
    href: "/faq",
  },
  {
    icon: MessageCircle,
    title: "Community",
    body: "Join other members, share wins, and get tips on maximizing rewards.",
    action: "Join the channel",
    href: "https://t.me/prorewardhub_bot",
  },
]

export default function SupportPage() {
  return (
    <>
      <PageHero
        eyebrow="Support"
        title="We are here to help"
        subtitle="Reach us through your preferred channel, or send a message and we will get back to you."
      />

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {channels.map((c) => (
            <div key={c.title} className="flex flex-col rounded-2xl border border-border bg-card p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <c.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{c.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              <Button render={<Link href={c.href} />} nativeButton={false} variant="outline" className="mt-4 rounded-full">
                {c.action}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 rounded-3xl border border-border bg-card/40 p-8 lg:grid-cols-[1fr_1.2fr] lg:p-10">
          <div className="flex flex-col justify-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-accent/15 text-accent">
              <LifeBuoy className="size-5" />
            </span>
            <h2 className="font-display text-2xl font-bold text-foreground">Send us a message</h2>
            <p className="text-muted-foreground">
              Fill in the form and our team will respond by email. Include your handle so we can find your account
              faster.
            </p>
          </div>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">How can we help?</Label>
              <textarea
                id="message"
                rows={4}
                placeholder="Describe your issue…"
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
            <Button type="submit" className="rounded-full justify-self-start">
              Send message
            </Button>
          </form>
        </div>
      </section>
    </>
  )
}
