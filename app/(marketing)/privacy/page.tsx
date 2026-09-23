import type { Metadata } from "next"
import { PageHero } from "@/components/marketing/page-hero"
import { LegalLayout, LegalSection } from "@/components/marketing/legal-content"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Pro Reward Hub collects, uses, and protects your data.",
}

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" subtitle="Last updated September 17, 2026" />
      <LegalLayout>
        <LegalSection title="1. Information we collect">
          <p>
            We collect the information you provide when you register, such as your name, phone number or email, and
            optional connected accounts like Telegram. We also collect activity data — mission completions, streaks,
            Points, and XP — to operate the rewards system.
          </p>
        </LegalSection>
        <LegalSection title="2. How we use your data">
          <p>
            Your data is used to run Daily Drops, calculate Points, XP, and your Pro Score, deliver rewards, prevent
            fraud, and improve the platform. We use activity signals to protect the reward pool from abuse.
          </p>
        </LegalSection>
        <LegalSection title="3. Verification and rewards">
          <p>
            To deliver certain rewards, we may need to verify your identity or contact details. Reward delivery
            information is used only to fulfill the reward you claimed.
          </p>
        </LegalSection>
        <LegalSection title="4. Sharing">
          <p>
            We do not sell your personal data. We share limited data with reward and verification providers strictly to
            fulfill rewards, and with service providers who help us operate the platform under confidentiality
            obligations.
          </p>
        </LegalSection>
        <LegalSection title="5. Your choices">
          <p>
            You can update your profile, disconnect linked accounts, and request account deletion at any time. Deleting
            your account removes your personal data, subject to records we must retain for fraud prevention and legal
            compliance.
          </p>
        </LegalSection>
        <LegalSection title="6. Security">
          <p>
            We use industry-standard measures to protect your data. No system is perfectly secure, so we encourage you
            to use a strong password and keep your account credentials private.
          </p>
        </LegalSection>
        <LegalSection title="7. Contact">
          <p>For privacy questions or data requests, reach us through the Support page.</p>
        </LegalSection>
      </LegalLayout>
    </>
  )
}
