"use client";

import { useEffect, useRef, useState } from "react";
import { ProductPreview } from "@/components/ProductPreview";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const APP_URL = "https://coria-app.vercel.app/";
const GITHUB_URL = "https://github.com/thejatinchawla/coria";

async function submitWaitlist(email: string): Promise<boolean> {
  try {
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

const eyebrow = "text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3";

const features = [
  {
    n: "01",
    title: "First-class agent identity",
    body: "Every agent has a name, @mention slug, avatar, and tool allowlist, modelled like a teammate. Create custom agents or start with @divv in every workspace.",
    live: true,
  },
  {
    n: "02",
    title: "Shared workspace memory",
    body: "Messages embed on send. Agents retrieve channel context and search across the workspace with workspace_search, so there are no cold starts.",
    live: true,
  },
  {
    n: "03",
    title: "Human approval workflows",
    body: "High-impact tool calls pause in chat. Approve or decline GitHub comments and PRs inline. A five-gate broker runs before every external write.",
    live: true,
  },
  {
    n: "04",
    title: "Default-deny permissions",
    body: "Agents get only the tools you allow. Workspace kill switch, monthly budgets, and per-agent pause. Revocation at every level.",
    live: true,
  },
];

const progress = [
  {
    status: "live" as const,
    label: "Live",
    title: "Team messaging",
    body: "Channels, threads, pins, search, and teammate DMs. Hybrid or humans-only channels. Real-time chat built on Supabase.",
  },
  {
    status: "live" as const,
    label: "Live",
    title: "Agents & @mentions",
    body: "Streaming invoke, custom agents, keyword triggers, reasoning traces, and agent DMs. @mention any agent in channel or DM.",
  },
  {
    status: "live" as const,
    label: "Live",
    title: "Memory & RAG",
    body: "Channel embeddings on send, thread-aware retrieval, and workspace-wide search so agents answer with team context.",
  },
  {
    status: "live" as const,
    label: "Live",
    title: "Approvals & audit",
    body: "Action blocks in chat, pending-approval badges, and a filterable audit log with 30-day JSON export.",
  },
  {
    status: "live" as const,
    label: "Live",
    title: "Integrations",
    body: "GitHub OAuth for read and approved writes. Web search via Tavily. Groq or Anthropic LLM keys per workspace.",
  },
  {
    status: "next" as const,
    label: "Next",
    title: "Polish & scale",
    body: "Agent templates, unread badges, in-app cron triggers, agent-to-agent delegation, and cross-channel citations.",
  },
];

const principles = [
  {
    num: "I",
    title: "Agent-native, not retrofitted",
    body: "Identity, channels, permissions: every primitive assumes teams of people and agents from the first line.",
  },
  {
    num: "II",
    title: "Humans always in control",
    body: "Default-deny permissions, explicit approvals, and revocation at every level. The human is never out of the loop.",
  },
  {
    num: "III",
    title: "Auditable by design",
    body: "Every action leaves a reasoning trace and an immutable record. No black boxes, nothing to reconstruct later.",
  },
];

function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  // Only enable for real mouse pointers, and never when motion is reduced.
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (fine.matches && !reduced.matches) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("has-custom-cursor");

    // Target = true pointer; dot follows tightly, ring lags (the "flow").
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let dx = mx;
    let dy = my;
    let rx = mx;
    let ry = my;
    let scale = 1;
    let targetScale = 1;
    let pressing = false;
    let shown = false;
    let raf = 0;

    const interactive = "a, button, input, textarea, select, label, [role='button']";

    const show = () => {
      if (shown) return;
      shown = true;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      show();
    };
    const onOver = (e: MouseEvent) => {
      const hit = (e.target as Element | null)?.closest?.(interactive);
      targetScale = hit ? 1.9 : 1;
      ring.style.backgroundColor = hit ? "rgba(255,255,255,0.12)" : "transparent";
    };
    const onDown = () => {
      pressing = true;
    };
    const onUp = () => {
      pressing = false;
    };
    const onLeave = () => {
      shown = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };
    const onEnter = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      show();
    };

    const render = () => {
      // Lerp toward the target; ring's smaller factor gives it the trailing flow.
      dx += (mx - dx) * 0.45;
      dy += (my - dy) * 0.45;
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;

      const ts = targetScale * (pressing ? 0.82 : 1);
      scale += (ts - scale) * 0.18;

      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale})`;
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-5 w-5 rounded-full border border-white opacity-0 mix-blend-difference will-change-transform"
        style={{
          transform: "translate3d(-100px, -100px, 0)",
          transition: "opacity 250ms ease, background-color 200ms ease",
        }}
      />
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-[6px] w-[6px] rounded-full bg-white opacity-0 mix-blend-difference will-change-transform"
        style={{
          transform: "translate3d(-100px, -100px, 0)",
          transition: "opacity 250ms ease",
        }}
      />
    </>
  );
}

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "done" | "error"
  >("idle");
  const [invalid, setInvalid] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setStatus("submitting");
    const ok = await submitWaitlist(email.trim());
    setStatus(ok ? "done" : "error");
  }

  const done = status === "done";

  return (
    <div className="relative mx-auto max-w-[420px]">
      {/* Form + note, fades out on success */}
      <div
        className={`transition-opacity duration-300 ${
          done ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        aria-hidden={done}
      >
        <form
          onSubmit={onSubmit}
          noValidate
          className="flex items-stretch overflow-hidden rounded-[4px] border border-line bg-white transition-[border-color,box-shadow] duration-150 focus-within:border-ink-3 focus-within:shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (invalid) setInvalid(false);
            }}
            placeholder="Work email address"
            aria-label="Work email address"
            aria-invalid={invalid}
            disabled={status === "submitting"}
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-[14px] font-light text-ink outline-none placeholder:text-ink-3"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="whitespace-nowrap bg-ink px-5 py-3 text-[13px] font-medium text-white transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 disabled:opacity-50"
          >
            Request access
          </button>
        </form>
        <p className="mt-3.5 text-[12px] font-light text-ink-3">
          {invalid
            ? "Enter a valid email address."
            : status === "error"
              ? "Something went wrong. Please try again."
              : "No spam. Unsubscribe anytime."}
        </p>
      </div>

      {/* Success message, fades in, same gray as the placeholder, no icon */}
      <p
        className={`absolute inset-x-0 top-0 flex h-[46px] items-center justify-center text-[13px] text-ink-3 transition-opacity duration-500 ${
          done ? "opacity-100 delay-200" : "pointer-events-none opacity-0"
        }`}
        role="status"
        aria-live="polite"
      >
        {done ? "On the list. We'll be in touch." : ""}
      </p>
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const link =
    "text-[13px] text-ink opacity-60 transition-opacity duration-150 hover:opacity-100 focus-visible:outline-none focus-visible:opacity-100";

  const mobileLink =
    "block rounded-[4px] px-3 py-2.5 text-[15px] text-ink hover:bg-line/60";

  return (
    <header
      className={`sticky top-0 z-50 h-16 border-b backdrop-blur-xl transition-colors duration-200 ${
        scrolled || menuOpen
          ? "border-line bg-surface/80"
          : "border-transparent bg-surface/60"
      }`}
    >
      <nav className="relative mx-auto flex h-full max-w-[920px] items-center justify-between gap-3 px-5 sm:px-10">
        <a
          href="#top"
          className="font-serif text-[20px] tracking-[-0.01em] text-ink"
          onClick={() => setMenuOpen(false)}
        >
          Coria
        </a>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 sm:flex">
          <a href="#progress" className={link}>
            Progress
          </a>
          <a href="#features" className={link}>
            Features
          </a>
          <a href="#principles" className={link}>
            Principles
          </a>
          <a href={GITHUB_URL} className={link} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-[4px] text-ink sm:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M4 5h16" />
                <path d="M4 12h16" />
                <path d="M4 19h16" />
              </svg>
            )}
          </button>

          <a
            href={APP_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-[4px] bg-ink px-3 py-2 text-[12px] font-medium text-white transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 sm:px-4 sm:text-[13px]"
          >
            Try Coria
          </a>
        </div>
      </nav>

      {menuOpen ? (
        <div
          id="mobile-nav"
          className="border-t border-line bg-surface/95 px-5 py-4 sm:hidden"
        >
          <div className="flex flex-col gap-1">
            {[
              { label: "Progress", href: "#progress" },
              { label: "Features", href: "#features" },
              { label: "Principles", href: "#principles" },
              { label: "GitHub", href: GITHUB_URL, external: true },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={mobileLink}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default function Page() {
  return (
    <>
      <CustomCursor />
      <Nav />

      <main id="top">
        {/* HERO: full viewport, copy + product */}
        <section className="hero-viewport relative flex h-[calc(100svh-4rem)] min-h-0 flex-col overflow-hidden lg:grid lg:grid-cols-2 lg:grid-rows-1">
          <div className="hero-in flex shrink-0 flex-col justify-center px-5 py-5 sm:px-8 sm:py-8 lg:min-h-0 lg:shrink lg:px-14 lg:py-16 xl:px-20">
            <div className="mx-auto w-full max-w-[34rem] text-center lg:mx-0 lg:text-left">
              <span className={eyebrow}>
                v3 live ·{" "}
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink-2 underline decoration-ink-3/50 underline-offset-[3px] transition-colors hover:text-ink"
                >
                  Open source
                </a>
              </span>
              <h1 className="mt-4 font-serif text-[clamp(28px,7.2vw,58px)] leading-[1.06] tracking-[-0.03em] text-ink sm:mt-6 lg:mt-10">
                Agents that <i className="italic text-ink-2">act,</i>
                <br />
                with your team&apos;s permission.
              </h1>
              <p className="mt-3 text-[14px] font-light leading-[1.6] text-ink-2 sm:mt-5 sm:text-[16px] sm:leading-[1.65] lg:max-w-[42ch] lg:text-[17px]">
                An AI-native team workspace with channels, multiple agents,
                human-in-the-loop approvals, and governance built in.
              </p>
              <div className="mt-5 flex flex-col items-center gap-3 sm:mt-8 sm:items-stretch sm:gap-4 lg:items-start">
                <div className="flex w-full max-w-[20rem] flex-col gap-2.5 sm:max-w-none sm:w-auto sm:flex-row sm:gap-3">
                  <a
                    href={APP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex justify-center rounded-[4px] bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 sm:px-6 sm:py-3 sm:text-[14px]"
                  >
                    Try Coria
                  </a>
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex justify-center rounded-[4px] border border-line bg-white px-5 py-2.5 text-[13px] font-medium text-ink transition-colors duration-150 hover:border-ink-3 hover:bg-line/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 sm:px-6 sm:py-3 sm:text-[14px]"
                  >
                    View on GitHub
                  </a>
                </div>
                <p className="hidden max-w-[38ch] text-[13px] font-light text-ink-3 sm:block">
                  Open #general and mention @divv today.{" "}
                  <a
                    href="#waitlist"
                    className="text-ink-2 underline decoration-ink-3/50 underline-offset-[3px] transition-colors hover:text-ink"
                  >
                    Join the waitlist
                  </a>{" "}
                  for templates, notifications, and what&apos;s next.
                </p>
              </div>
            </div>
          </div>

          <div className="hero-in flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-t border-line px-3 py-3 sm:px-5 sm:py-5 lg:border-t-0 lg:border-l lg:px-8 lg:py-8">
            <ProductPreview fill />
          </div>
        </section>

        {/* THESIS: a single paragraph, no header */}
        <section
          id="thesis"
          className="mx-auto max-w-[52ch] scroll-mt-24 px-6 py-24 text-center sm:py-32"
        >
          <p className="font-serif text-[clamp(22px,3vw,25px)] leading-[1.5] tracking-[-0.01em] text-ink">
            Messaging tools were built for people, with AI bolted on as an
            afterthought. Coria starts from a different premise: an agent is a
            member, with a name, a memory, and a record of everything it does.{" "}
            <span className="text-ink-2">
              Identity, permissions, and accountability are primitives here, not
              plugins.
            </span>
          </p>
        </section>

        {/* PROGRESS */}
        <section
          id="progress"
          className="mx-auto max-w-[920px] scroll-mt-24 px-6 sm:px-10"
        >
          <div className="grid items-start gap-x-12 gap-y-5 border-t border-line py-12 md:grid-cols-[0.8fr_1.2fr]">
            <span className={`${eyebrow} md:pt-1`}>Progress</span>
            <h2 className="font-serif text-[clamp(27px,3.6vw,38px)] leading-[1.12] tracking-[-0.02em] text-ink">
              What&apos;s <i className="italic text-ink-2">live</i> today.
            </h2>
          </div>

          <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {progress.map((item) => (
              <div key={item.title} className="bg-surface p-8 sm:p-9">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      item.status === "live"
                        ? "bg-ink"
                        : item.status === "next"
                          ? "bg-ink-3"
                          : "bg-line"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-3">
                    {item.label}
                  </span>
                </div>
                <h3 className="mt-5 text-[15px] font-medium tracking-[-0.01em] text-ink">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-[13px] font-light leading-[1.65] text-ink-2">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="features"
          className="mx-auto max-w-[920px] scroll-mt-24 px-6 sm:px-10"
        >
          <div className="grid items-start gap-x-12 gap-y-5 border-t border-line py-12 md:grid-cols-[0.8fr_1.2fr]">
            <span className={`${eyebrow} md:pt-1`}>
              What makes Coria different
            </span>
            <h2 className="font-serif text-[clamp(27px,3.6vw,38px)] leading-[1.12] tracking-[-0.02em] text-ink">
              Agents as <i className="italic text-ink-2">teammates,</i> not
              bolt-ons.
            </h2>
          </div>

          <div className="mb-12 max-w-[52ch] border-t border-line pt-10">
            <span className={eyebrow}>In the product</span>
            <h3 className="mt-4 font-serif text-[clamp(22px,2.8vw,28px)] leading-[1.15] tracking-[-0.02em] text-ink">
              @mention an agent like any teammate.
            </h3>
            <p className="mt-3 text-[13px] font-light leading-[1.65] text-ink-2">
              Mention @divv or any custom agent in channel or DM. Risky actions,
              like posting to GitHub, pause for Approve or Decline right in
              chat.
            </p>
          </div>

          <div className="grid border-l border-t border-line sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.n}
                className="border-b border-r border-line p-8 sm:p-9"
              >
                <div className="flex items-center gap-2 text-[11px] tabular-nums tracking-[0.1em] text-ink-3">
                  <span>{f.n}</span>
                  {"live" in f && f.live ? (
                    <span className="rounded-[3px] border border-line px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-ink-2">
                      Live
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-5 text-[15px] font-medium tracking-[-0.01em] text-ink">
                  {f.title}
                </h3>
                <p className="mt-2.5 text-[13px] font-light leading-[1.65] text-ink-2">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* PRINCIPLES */}
        <section
          id="principles"
          className="mx-auto max-w-[920px] scroll-mt-24 px-6 py-24 sm:px-10 sm:py-28"
        >
          <div className="grid items-start gap-x-12 gap-y-5 md:grid-cols-[0.8fr_1.2fr]">
            <span className={`${eyebrow} md:pt-1`}>Principles</span>
            <h2 className="font-serif text-[clamp(27px,3.6vw,38px)] leading-[1.12] tracking-[-0.02em] text-ink">
              What stays <i className="italic text-ink-2">fixed.</i>
            </h2>
          </div>

          <div className="mt-16 grid gap-10 sm:gap-12 md:grid-cols-3">
            {principles.map((p) => (
              <div key={p.num}>
                <div className="text-[11px] tracking-[0.1em] text-ink-3">
                  {p.num}
                </div>
                <h3 className="mt-4 text-[14px] font-medium tracking-[-0.01em] text-ink">
                  {p.title}
                </h3>
                <p className="mt-2.5 text-[13px] font-light leading-[1.65] text-ink-2">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* PRE-FOOTER WAITLIST: quiet single row */}
        <section id="waitlist" className="scroll-mt-24 border-t border-line">
          <div className="mx-auto max-w-[920px] px-6 py-20 text-center sm:px-10">
            <span className={eyebrow}>Stay in the loop</span>
            <h2 className="mx-auto mt-5 max-w-[20ch] font-serif text-[clamp(27px,3.6vw,38px)] leading-[1.12] tracking-[-0.02em] text-ink">
              Memory, approvals, and audit are{" "}
              <i className="italic text-ink-2">live.</i>
            </h2>
            <p className="mx-auto mt-4 max-w-[40ch] text-[14px] font-light leading-[1.65] text-ink-2">
              Join the list for agent templates, notifications, and what we ship
              next.
            </p>
            <div className="mt-8">
              <WaitlistForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[920px] flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row sm:px-10">
          <p className="text-[12px] font-light text-ink-3">
            Coria · Building in public · 2026
          </p>
          <nav className="flex gap-6" aria-label="Social and external links">
            {[
              { label: "GitHub", href: GITHUB_URL },
              { label: "LinkedIn", href: "https://www.linkedin.com/in/jatin-chawla-2a167720a/" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="text-[12px] text-ink opacity-50 transition-opacity duration-150 hover:opacity-100 focus-visible:outline-none focus-visible:opacity-100"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}
