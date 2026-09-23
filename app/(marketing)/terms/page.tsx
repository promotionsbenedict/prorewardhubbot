import type { Metadata } from "next"
import { PageHero } from "@/components/marketing/page-hero"
import { LegalLayout, LegalSection } from "@/components/marketing/legal-content"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Pro Reward Hub.",
}

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms of Service" subtitle="Last updated September 17, 2026" />
      <LegalLayout>
        <LegalSection title="1. Acceptance of terms">
          <p>
            By creating an account or using Pro Reward Hub, you agree to these Terms of Service. If you do not agree,
            please do not use the platform. These terms apply to all visitors, members, and contributors.
          </p>
        </LegalSection>
        <LegalSection title="2. Accounts and eligibility">
          <p>
            You must provide accurate information when registering and keep your credentials secure. One account per
            person is permitted. You are responsible for all activity that occurs under your account.
          </p>
        </LegalSection>
        <LegalSection title="3. Points, XP, and rewards">
          <p>
            Points and XP have no cash value except as explicitly offered through the rewards catalog. Rewards are
            subject to availability, verification, and eligibility requirements including your level and Pro Score. We
            may adjust reward requirements and availability at any time.
          </p>
        </LegalSection>
        <LegalSection title="4. Fair use and anti-abuse">
          <p>
            Automated activity, multiple accounts, fraudulent verification, and any attempt to manipulate the rewards
            system are strictly prohibited. Violations may result in forfeiture of Points, rewards, and account
            suspension. Your Pro Score reflects genuine, consistent participation.
          </p>
        </LegalSection>
        <LegalSection title="5. Missions and partner content">
          <p>
            Some missions involve third-party projects and channels. We do not control third-party content and are not
            responsible for it. Completing a mission does not constitute an endorsement of any third party.
          </p>
        </LegalSection>
        <LegalSection title="6. Changes to the service">
          <p>
            We may modify, suspend, or discontinue any part of the platform at any time. We will make reasonable efforts
            to communicate significant changes to active members.
          </p>
        </LegalSection>
        <LegalSection title="7. Contact">
          <p>Questions about these terms can be sent to our support team via the Support page.</p>
        </LegalSection>
      </LegalLayout>
    </>
  )
}
