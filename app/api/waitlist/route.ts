// Waitlist endpoint. Accepts JSON `{ email }`, then:
//   1. PERSISTS the signup (so it's never lost, even if email delivery fails):
//        - upserts a contact in Brevo (visible/exportable in the dashboard)
//        - appends to data/waitlist.jsonl on disk
//   2. Best-effort sends two emails via Brevo:
//        - a notification to WAITLIST_NOTIFY_EMAIL
//        - a thank-you confirmation to the signup
//
// The request succeeds as long as the signup was stored somewhere; email
// failures (e.g. spam filtering, unverified domain) no longer drop the lead.
//
// Configure BREVO_API_KEY, WAITLIST_FROM_EMAIL, WAITLIST_FROM_NAME,
// WAITLIST_NOTIFY_EMAIL (and optional BREVO_LIST_ID) in .env.local. See
// .env.example. Note: data/waitlist.jsonl needs a writable filesystem; on
// read-only serverless hosts (e.g. Vercel) the Brevo contact is the store.

import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs"; // we use the filesystem

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.WAITLIST_FROM_EMAIL || "";
const FROM_NAME = process.env.WAITLIST_FROM_NAME || "Coria";
const NOTIFY = process.env.WAITLIST_NOTIFY_EMAIL || "developer@sysbioz.com";
const BREVO_LIST_ID = process.env.BREVO_LIST_ID
  ? Number(process.env.BREVO_LIST_ID)
  : undefined;

// Public origin (e.g. https://coria.com) used to load the logo image in emails.
// Email clients can't render inline SVG, so we need an absolute URL to logo.png.
// If unset, emails fall back to a plain serif "Coria" wordmark.
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  ""
).replace(/\/$/, "");

// Landing page the "Coria" link in emails points to. Defaults to the deployed
// site; override with NEXT_PUBLIC_SITE_URL / SITE_URL.
const HOME_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://coria-landing-page.vercel.app"
).replace(/\/$/, "");

const WAITLIST_FILE = path.join(process.cwd(), "data", "waitlist.jsonl");

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// --- Persistence -----------------------------------------------------------

async function saveToFile(email: string, iso: string): Promise<boolean> {
  try {
    await mkdir(path.dirname(WAITLIST_FILE), { recursive: true });
    await appendFile(WAITLIST_FILE, JSON.stringify({ email, ts: iso }) + "\n", "utf8");
    return true;
  } catch (err) {
    console.error("[waitlist] file persist failed:", err);
    return false;
  }
}

async function addBrevoContact(email: string): Promise<boolean> {
  if (!BREVO_API_KEY) return false;
  try {
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email,
        updateEnabled: true, // upsert: don't error if the contact already exists
        ...(BREVO_LIST_ID ? { listIds: [BREVO_LIST_ID] } : {}),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Brevo contacts ${res.status}: ${detail}`);
    }
    return true;
  } catch (err) {
    console.error("[waitlist] Brevo contact upsert failed:", err);
    return false;
  }
}

// --- Email -----------------------------------------------------------------

type BrevoEmail = {
  to: { email: string }[];
  subject: string;
  htmlContent: string;
  textContent: string;
  replyTo?: { email: string };
};

async function sendEmail(msg: BrevoEmail): Promise<void> {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY as string,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ sender: { email: FROM_EMAIL, name: FROM_NAME }, ...msg }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Brevo responded ${res.status}: ${detail}`);
  }
}

const brandHeader = SITE_URL
  ? `<img src="${SITE_URL}/logo.png" width="36" height="36" alt="Coria" style="display:block;border:0;outline:none;margin:0 0 24px" />`
  : `<div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:0.5px;color:#0A0A0A;margin-bottom:28px">Coria</div>`;

const shellOpen =
  `<div style="background:#FAFAF7;padding:40px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">` +
  `<div style="max-width:480px;margin:0 auto">` +
  brandHeader;
const shellClose = `</div></div>`;

// Social links — kept in sync with the landing page footer.
const GITHUB_URL = "https://github.com/thejatinchawla/coria";
const LINKEDIN_URL = "https://www.linkedin.com/in/jatin-chawla-2a167720a/";
// Icons are hosted PNGs (email clients can't render inline SVG). They load from
// the deployed site; alt text falls back to the name if images are blocked.
const socialRow =
  `<p style="margin:0 0 14px;line-height:0">` +
  `<a href="${GITHUB_URL}" target="_blank" style="text-decoration:none;display:inline-block;margin-right:14px">` +
  `<img src="${HOME_URL}/github.png" width="20" height="20" alt="GitHub" style="display:inline-block;border:0;outline:none" /></a>` +
  `<a href="${LINKEDIN_URL}" target="_blank" style="text-decoration:none;display:inline-block">` +
  `<img src="${HOME_URL}/linkedin.png" width="20" height="20" alt="LinkedIn" style="display:inline-block;border:0;outline:none" /></a>` +
  `</p>`;

function confirmationHtml(): string {
  return (
    shellOpen +
    `<p style="font-size:15px;line-height:1.6;color:#0A0A0A;margin:0 0 16px">Thanks for your interest in <a href="${HOME_URL}/" style="color:#0A0A0A;text-decoration:underline">Coria</a>.</p>` +
    `<p style="font-size:15px;line-height:1.6;color:#5A5A5A;margin:0 0 16px">You're on the early-access waitlist. Coria is a team messaging platform where AI agents are first-class members, with identity, memory, and accountability. We'll be in touch as we open access.</p>` +
    `<p style="font-size:15px;line-height:1.6;color:#5A5A5A;margin:0 0 28px">The Coria team</p>` +
    `<hr style="border:none;border-top:1px solid #E8E8E4;margin:0 0 16px" />` +
    socialRow +
    `<p style="font-size:12px;line-height:1.6;color:#999;margin:0">You received this because you joined the waitlist at Coria. If this wasn't you, you can safely ignore it.</p>` +
    shellClose
  );
}

const confirmationText =
  `Thanks for your interest in Coria (${HOME_URL}/).\n\n` +
  "You're on the early-access waitlist. Coria is a team messaging platform where " +
  "AI agents are first-class members, with identity, memory, and accountability. " +
  "We'll be in touch as we open access.\n\nThe Coria team" +
  `\n\nGitHub: ${GITHUB_URL}\nLinkedIn: ${LINKEDIN_URL}`;

function notificationHtml(email: string, when: string): string {
  const safe = escapeHtml(email);
  return (
    shellOpen +
    `<p style="font-size:15px;line-height:1.6;color:#0A0A0A;margin:0 0 16px">New waitlist signup</p>` +
    `<p style="font-size:15px;line-height:1.6;color:#5A5A5A;margin:0 0 8px">Email: <strong style="color:#0A0A0A">${safe}</strong></p>` +
    `<p style="font-size:13px;line-height:1.6;color:#999;margin:0 0 24px">${escapeHtml(when)}</p>` +
    `<hr style="border:none;border-top:1px solid #E8E8E4;margin:0 0 16px" />` +
    socialRow +
    shellClose
  );
}

// --- Handler ---------------------------------------------------------------

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
  const now = new Date();
  const iso = now.toISOString();
  const human = now.toUTCString();

  // 1) Capture the signup durably first, independent of email delivery.
  const [savedFile, savedContact] = await Promise.all([
    saveToFile(clean, iso),
    addBrevoContact(clean),
  ]);

  // If we couldn't store it anywhere, ask the user to retry.
  if (!savedFile && !savedContact) {
    return Response.json(
      { error: "Could not record your request. Please try again." },
      { status: 502 }
    );
  }

  // 2) Best-effort emails. The signup is already saved, so failures here don't
  //    fail the request, they're just logged.
  let emailed: boolean | "partial" = false;
  if (BREVO_API_KEY && FROM_EMAIL) {
    try {
      await sendEmail({
        to: [{ email: NOTIFY }],
        replyTo: { email: clean },
        subject: `New Coria waitlist signup: ${clean}`,
        htmlContent: notificationHtml(clean, human),
        textContent: `New waitlist signup\n\nEmail: ${clean}\n${human}\n\nGitHub: ${GITHUB_URL}\nLinkedIn: ${LINKEDIN_URL}`,
      });
      try {
        await sendEmail({
          to: [{ email: clean }],
          replyTo: { email: NOTIFY },
          subject: "Thanks for your interest in Coria",
          htmlContent: confirmationHtml(),
          textContent: confirmationText,
        });
        emailed = true;
      } catch (err) {
        console.error("[waitlist] confirmation email failed (signup saved):", err);
        emailed = "partial";
      }
    } catch (err) {
      console.error("[waitlist] notification email failed (signup saved):", err);
      emailed = false;
    }
  }

  return Response.json({
    ok: true,
    stored: { file: savedFile, brevoContact: savedContact },
    emailed,
  });
}
