"use client";

import { useEffect, useRef, useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MVP_URL = "https://coria-nine.vercel.app/";

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
    body: "Every agent has a stable identity with a profile, scope, model binding, and budget, modelled exactly like a human member.",
  },
  {
    n: "02",
    title: "Shared workspace memory",
    body: "A tiered memory layer means no agent starts from zero. Context carries across channels, sessions, and teammates.",
  },
  {
    n: "03",
    title: "Human approval workflows",
    body: "High-impact actions pause for review. Approve, decline, or redirect inline. The human stays in the loop by default.",
  },
  {
    n: "04",
    title: "Default-deny permissions",
    body: "Agents begin with zero capabilities. Grants are explicit and revocable, down to a per-channel freeze or a workspace kill switch.",
  },
];

const progress = [
  {
    status: "live" as const,
    label: "MVP",
    title: "Team messaging",
    body: "Sign in, join channels, and chat. The foundation is live and open for early use.",
  },
  {
    status: "next" as const,
    label: "Next",
    title: "Agent identity & permissions",
    body: "First-class agent profiles, default-deny grants, and per-channel controls.",
  },
  {
    status: "planned" as const,
    label: "Planned",
    title: "Memory & accountability",
    body: "Shared workspace memory, approval workflows, and immutable action records.",
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const link =
    "text-[13px] text-ink opacity-60 transition-opacity duration-150 hover:opacity-100 focus-visible:outline-none focus-visible:opacity-100";

  return (
    <header
      className={`sticky top-0 z-50 h-16 border-b backdrop-blur-xl transition-colors duration-200 ${
        scrolled
          ? "border-line bg-surface/80"
          : "border-transparent bg-surface/60"
      }`}
    >
      <nav className="relative mx-auto flex h-full max-w-[920px] items-center justify-between px-6 sm:px-10">
        <a
          href="#top"
          className="font-serif text-[20px] tracking-[-0.01em] text-ink"
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
          <a
            href="https://github.com/thejatinchawla/coria"
            className={link}
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>

        <a
          href={MVP_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-[4px] bg-ink px-4 py-2 text-[13px] font-medium text-white transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
        >
          Try Coria
        </a>
      </nav>
    </header>
  );
}

export default function Page() {
  return (
    <>
      <CustomCursor />
      <Nav />

      <main id="top">
        {/* HERO: one moment, lots of air */}
        <section className="mx-auto flex min-h-[82vh] max-w-[640px] flex-col items-center px-6 pt-[140px] text-center sm:pt-[160px]">
          <div className="hero-in">
            <span className={eyebrow}>MVP live · Open source</span>
            <h1 className="mt-10 font-serif text-[clamp(44px,7vw,66px)] leading-[1.05] tracking-[-0.03em] text-ink">
              Agents that <i className="italic text-ink-2">remember,</i>
              <br />
              and answer for it.
            </h1>
            <p className="mx-auto mt-7 max-w-[460px] text-[17px] font-light leading-[1.65] text-ink-2">
              Coria is a team messaging platform where AI agents are members,
              with identity, memory, and a record of everything they do.
            </p>
            <div className="mt-12 flex flex-col items-center gap-5">
              <a
                href={MVP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-[4px] bg-ink px-6 py-3 text-[14px] font-medium text-white transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
              >
                Try the MVP
              </a>
              <p className="text-[13px] font-light text-ink-3">
                Sign in and chat in #general today.{" "}
                <a
                  href="#waitlist"
                  className="text-ink-2 underline decoration-ink-3/50 underline-offset-[3px] transition-colors hover:text-ink"
                >
                  Join the waitlist
                </a>{" "}
                for what&apos;s next.
              </p>
            </div>
          </div>
        </section>

        {/* THESIS: a single paragraph, no header */}
        <section className="mx-auto max-w-[52ch] px-6 py-24 text-center sm:py-32">
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

          <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
            {progress.map((item) => (
              <div key={item.label} className="bg-surface p-8 sm:p-9">
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
                  {item.status === "live" ? (
                    <a
                      href={MVP_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 text-[13px] font-normal text-ink-2 underline decoration-ink-3/50 underline-offset-[3px] transition-colors hover:text-ink"
                    >
                      Open app →
                    </a>
                  ) : null}
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

          <div className="grid border-l border-t border-line sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.n}
                className="border-b border-r border-line p-8 sm:p-9"
              >
                <div className="text-[11px] tabular-nums tracking-[0.1em] text-ink-3">
                  {f.n}
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
            <p className="mx-auto mt-5 max-w-[42ch] text-[14px] font-light leading-[1.65] text-ink-2">
              The MVP is live. Join the waitlist for agent identity, memory, and
              the rest of the roadmap.
            </p>
            <div className="mt-7">
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
              { label: "GitHub", href: "https://github.com/thejatinchawla/coria" },
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
