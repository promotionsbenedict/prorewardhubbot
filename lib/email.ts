import "server-only"
import { Resend } from "resend"
import { pointsToUsd } from "@/lib/wallet"

const resend = new Resend(process.env.RESEND_API_KEY)

// The `from` domain must exactly match the verified Resend domain. Fall back to
// the Resend sandbox sender if the domain env var is somehow missing so calls
// still succeed in preview rather than throwing.
const DOMAIN = process.env.RESEND_EMAIL_DOMAIN
const FROM = DOMAIN ? `Pro Reward Hub <notifications@${DOMAIN}>` : "Pro Reward Hub <onboarding@resend.dev>"

const BRAND = "#7c5cff"

function shell(heading: string, bodyHtml: string) {
  return `
  <div style="margin:0;padding:24px;background:#0b0b12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#14141f;border:1px solid #262636;border-radius:16px;overflow:hidden;">
      <div style="padding:20px 28px;border-bottom:1px solid #262636;">
        <span style="font-size:16px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">Pro Reward Hub</span>
      </div>
      <div style="padding:28px;">
        <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:#ffffff;font-weight:700;">${heading}</h1>
        <div style="font-size:14px;line-height:1.6;color:#b4b4c6;">${bodyHtml}</div>
      </div>
      <div style="padding:18px 28px;border-top:1px solid #262636;font-size:12px;color:#6b6b80;">
        You're receiving this because you have a Pro Reward Hub account.
      </div>
    </div>
  </div>`
}

function badge(label: string, color: string) {
  return `<span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${color}22;color:${color};font-size:12px;font-weight:600;">${label}</span>`
}

function detailRow(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 0;color:#6b6b80;font-size:13px;">${label}</td>
    <td style="padding:8px 0;color:#e6e6f0;font-size:13px;text-align:right;font-weight:600;">${value}</td>
  </tr>`
}

type WithdrawalEmail = {
  to: string
  name: string
  amount: number
  method: string
  withdrawalId: number
}

// Never let a notification failure break the core mutation. Log and continue.
async function safeSend(opts: {
  to: string
  subject: string
  html: string
  idempotencyKey: string
}) {
  try {
    const { error } = await resend.emails.send(
      { from: FROM, to: [opts.to], subject: opts.subject, html: opts.html },
      { idempotencyKey: opts.idempotencyKey },
    )
    if (error) {
      console.error("[v0] Resend send failed:", error.message)
      return { ok: false }
    }
    return { ok: true }
  } catch (err) {
    console.error("[v0] Resend threw:", err instanceof Error ? err.message : err)
    return { ok: false }
  }
}

export async function sendWithdrawalRequested(e: WithdrawalEmail) {
  const details = `<table style="width:100%;border-collapse:collapse;margin:20px 0;border-top:1px solid #262636;">
    ${detailRow("Amount", `${e.amount.toLocaleString()} points`)}
    ${detailRow("Cash value", pointsToUsd(e.amount))}
    ${detailRow("Payout method", e.method)}
    ${detailRow("Status", "In review")}
  </table>`
  return safeSend({
    to: e.to,
    subject: "We received your withdrawal request",
    idempotencyKey: `withdrawal-requested/${e.withdrawalId}`,
    html: shell(
      "Withdrawal request received",
      `<p style="margin:0 0 8px;">Hi ${e.name || "there"},</p>
       <p style="margin:0 0 8px;">We've received your request and put ${badge("In review", "#f5a623")} on it. Your points are held securely while our team processes the payout.</p>
       ${details}
       <p style="margin:0;">We'll email you again as soon as the status changes.</p>`,
    ),
  })
}

export async function sendWithdrawalPaid(e: WithdrawalEmail) {
  const details = `<table style="width:100%;border-collapse:collapse;margin:20px 0;border-top:1px solid #262636;">
    ${detailRow("Amount", `${e.amount.toLocaleString()} points`)}
    ${detailRow("Cash value", pointsToUsd(e.amount))}
    ${detailRow("Payout method", e.method)}
    ${detailRow("Status", "Paid")}
  </table>`
  return safeSend({
    to: e.to,
    subject: "Your withdrawal has been paid",
    idempotencyKey: `withdrawal-paid/${e.withdrawalId}`,
    html: shell(
      "Payout on its way",
      `<p style="margin:0 0 8px;">Hi ${e.name || "there"},</p>
       <p style="margin:0 0 8px;">Good news — your withdrawal is ${badge("Paid", "#2ecc71")}. Expect the funds through your chosen method shortly.</p>
       ${details}
       <p style="margin:0;">Thanks for being part of Pro Reward Hub.</p>`,
    ),
  })
}

export async function sendWithdrawalRejected(e: WithdrawalEmail) {
  const details = `<table style="width:100%;border-collapse:collapse;margin:20px 0;border-top:1px solid #262636;">
    ${detailRow("Amount refunded", `${e.amount.toLocaleString()} points`)}
    ${detailRow("Cash value", pointsToUsd(e.amount))}
    ${detailRow("Payout method", e.method)}
    ${detailRow("Status", "Rejected")}
  </table>`
  return safeSend({
    to: e.to,
    subject: "Your withdrawal was rejected — points refunded",
    idempotencyKey: `withdrawal-rejected/${e.withdrawalId}`,
    html: shell(
      "Withdrawal not approved",
      `<p style="margin:0 0 8px;">Hi ${e.name || "there"},</p>
       <p style="margin:0 0 8px;">Your withdrawal was ${badge("Rejected", "#ff5c5c")} and the full amount has been refunded to your balance — no points lost.</p>
       ${details}
       <p style="margin:0;">If you think this was a mistake, reach out to support and we'll take another look.</p>`,
    ),
  })
}
