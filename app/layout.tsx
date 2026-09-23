import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["500", "600", "700", "800"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://prorewardhub.org"),
  title: {
    default: "Pro Reward Hub — Daily Drops, Missions & Real Rewards",
    template: "%s · Pro Reward Hub",
  },
  description:
    "Pro Reward Hub is a mobile-first rewards platform. Complete Daily Drops and missions, build streaks, earn Points and XP, invite friends, and claim real rewards.",
  applicationName: "Pro Reward Hub",
  manifest: "/manifest.webmanifest",
  keywords: ["rewards", "daily drops", "missions", "streaks", "referrals", "points", "engagement"],
  openGraph: {
    title: "Pro Reward Hub",
    description: "Complete Daily Drops, build streaks, and claim real rewards.",
    url: "https://prorewardhub.org",
    siteName: "Pro Reward Hub",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    title: "Pro Reward Hub",
    statusBarStyle: "black-translucent",
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9fd" },
    { media: "(prefers-color-scheme: dark)", color: "#191823" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jakarta.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
