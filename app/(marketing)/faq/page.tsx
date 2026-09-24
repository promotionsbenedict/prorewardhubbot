import type { Metadata } from "next"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { PageHero } from "@/components/marketing/page-hero"

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about Pro Reward Hub — Daily Drops, Points, XP, streaks, rewards, and more.",
}

const faqs = [
  {
    q: "Is Pro Reward Hub free to use?",
    a: "Yes. Creating an account and completing Daily Drops is completely free. You earn Points and XP simply by showing up and completing missions.",
  },
  {
    q: "What is the difference between Points and XP?",
    a: "Points are your spendable balance — you redeem them for rewards like airtime, data, and cash. XP is permanent progression that never decreases and determines your level from Starter to Elite.",
  },
  {
    q: "How do streaks work?",
    a: "Complete the required missions in your Daily Drop each day to keep your streak alive. Streaks unlock milestone rewards at day 3, 7, 14, and 30, and boost how much you earn.",
  },
  {
    q: "What is a Pro Score?",
    a: "Your Pro Score is a trust rating from 0 to 100 built on consistent, genuine activity. A higher score unlocks premium reward tiers and protects the reward pool from abuse.",
  },
  {
    q: "How do referrals pay out?",
    a: "You earn in stages: when a friend joins, when they become active, and when they qualify by staying consistent. This rewards you for bringing in members who genuinely engage.",
  },
  {
    q: "How do I claim a reward?",
    a: "Once you meet a reward's requirement and have enough Points, it becomes Eligible. Claim it from your dashboard and it moves through verification to Awarded, then delivered.",
  },
  {
    q: "Do I need Telegram to participate?",
    a: "No, but connecting Telegram unlocks partner missions and bonus points, plus real-time alerts for Surprise Drops and rewards.",
  },
  {
    q: "What are Surprise Drops?",
    a: "Surprise Drops are limited-time flash missions that appear without warning. They carry bonus rewards and expire quickly, so staying connected helps you catch them.",
  },
]

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Questions, answered"
        subtitle="Everything you need to know about earning and claiming on Pro Reward Hub."
      />
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <Accordion className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-display text-base font-semibold">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-10 text-center">
          <h2 className="font-display text-xl font-bold text-foreground">Still have questions?</h2>
          <p className="max-w-sm text-muted-foreground">
            Our support team is here to help you get the most out of Pro Reward Hub.
          </p>
          <Button render={<Link href="/support" />} nativeButton={false} className="rounded-full">
            Contact support
          </Button>
        </div>
      </section>
    </>
  )
}
