// Waitlist endpoint. Accepts JSON `{ email }`, then sends two emails via Resend:
//   1. A notification to WAITLIST_NOTIFY_EMAIL (so you know someone signed up).
//   2. A thank-you confirmation to the person who signed up.
//
// Configure RESEND_API_KEY, WAITLIST_FROM_EMAIL and WAITLIST_NOTIFY_EMAIL in
// .env.local (see .env.example). Without RESEND_API_KEY the signup is logged and
// accepted, but no email is sent.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.WAITLIST_FROM_EMAIL || "Coria <onboarding@resend.dev>";
const NOTIFY = process.env.WAITLIST_NOTIFY_EMAIL || "developer@sysbioz.com";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type ResendPayload = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  reply_to?: string;
};

async function sendEmail(payload: ResendPayload): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend responded ${res.status}: ${detail}`);
  }
}

// --- Email bodies (inline styles; email clients ignore <style> and web fonts) ---

const shellOpen =
  `<div style="background:#FAFAF7;padding:40px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">` +
  `<div style="max-width:480px;margin:0 auto">` +
  `<div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:0.5px;color:#0A0A0A;margin-bottom:28px">Coria</div>`;
const shellClose = `</div></div>`;

function confirmationHtml(): string {
  return (
    shellOpen +
    `<p style="font-size:15px;line-height:1.6;color:#0A0A0A;margin:0 0 16px">Thanks for your interest in Coria.</p>` +
    `<p style="font-size:15px;line-height:1.6;color:#5A5A5A;margin:0 0 16px">You're on the early-access waitlist. Coria is a team messaging platform where AI agents are first-class members — with identity, memory, and accountability. We'll be in touch as we open access.</p>` +
    `<p style="font-size:15px;line-height:1.6;color:#5A5A5A;margin:0 0 28px">— The Coria team</p>` +
    `<hr style="border:none;border-top:1px solid #E8E8E4;margin:0 0 16px" />` +
    `<p style="font-size:12px;line-height:1.6;color:#999;margin:0">You received this because you joined the waitlist at Coria. If this wasn't you, you can safely ignore it.</p>` +
    shellClose
  );
}

const confirmationText =
  "Thanks for your interest in Coria.\n\n" +
  "You're on the early-access waitlist. Coria is a team messaging platform where " +
  "AI agents are first-class members — with identity, memory, and accountability. " +
  "We'll be in touch as we open access.\n\n— The Coria team";

function notificationHtml(email: string, when: string): string {
  const safe = escapeHtml(email);
  return (
    shellOpen +
    `<p style="font-size:15px;line-height:1.6;color:#0A0A0A;margin:0 0 16px">New waitlist signup</p>` +
    `<p style="font-size:15px;line-height:1.6;color:#5A5A5A;margin:0 0 8px">Email: <strong style="color:#0A0A0A">${safe}</strong></p>` +
    `<p style="font-size:13px;line-height:1.6;color:#999;margin:0">${escapeHtml(when)}</p>` +
    shellClose
  );
}

export async function POST(request: Request) {
  let email: unknown;

  try {
    ({ email } = await request.json());
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return Response.json({ error: "A valid email is required." }, { status: 422 });
  }

  const clean = email.trim().toLowerCase();
  const when = new Date().toUTCString();

  // Not configured: don't lose the signup, but be honest that no email went out.
  if (!RESEND_API_KEY) {
    console.warn(
      `[waitlist] RESEND_API_KEY is not set — signup recorded but no email sent: ${clean}`
    );
    return Response.json({ ok: true, emailed: false });
  }

  // 1) Notify the team. This is the critical path — if it fails, surface an error
  //    so the signup isn't silently dropped and the user can retry.
  try {
    await sendEmail({
      from: FROM,
      to: [NOTIFY],
      reply_to: clean,
      subject: `New Coria waitlist signup: ${clean}`,
      html: notificationHtml(clean, when),
      text: `New waitlist signup\n\nEmail: ${clean}\n${when}`,
    });
  } catch (err) {
    console.error("[waitlist] notification email failed:", err);
    return Response.json(
      { error: "Could not record your request. Please try again." },
      { status: 502 }
    );
  }

  // 2) Thank-you to the signup. Best-effort: if the sending domain isn't verified
  //    in Resend yet, this can fail for arbitrary recipients — the signup is still
  //    recorded above, so we don't fail the request.
  try {
    await sendEmail({
      from: FROM,
      to: [clean],
      reply_to: NOTIFY,
      subject: "Thanks for your interest in Coria",
      html: confirmationHtml(),
      text: confirmationText,
    });
  } catch (err) {
    console.error(
      "[waitlist] confirmation email failed (signup still recorded):",
      err
    );
    return Response.json({ ok: true, emailed: "partial" });
  }

  return Response.json({ ok: true, emailed: true });
}
