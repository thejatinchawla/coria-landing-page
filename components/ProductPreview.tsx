"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Geist } from "next/font/google";
import damonAvatar from "@/public/damon.jpg";
import jatinAvatar from "@/public/jatin.jpg";
import klausAvatar from "@/public/klaus.jpg";
import "./product-preview.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const APP_ORIGIN = "https://coria-app.vercel.app";

const channels = [
  { name: "general", active: true },
  { name: "product", active: false },
  { name: "engineering", active: false },
];

const dmAgents = [
  {
    name: "divv",
    slug: "divv",
    color: "#6366f1",
    avatar: `${APP_ORIGIN}/agents/divv-avatar.png`,
  },
];

const MEMBER_AVATARS = {
  jatin: jatinAvatar.src,
  klaus: klausAvatar.src,
  damon: damonAvatar.src,
} as const;

function memberAvatarFor(name: string, avatar?: string) {
  if (avatar) return avatar;
  const key = name.toLowerCase() as keyof typeof MEMBER_AVATARS;
  return MEMBER_AVATARS[key];
}

const dmMembers = [
  { name: "Klaus", initial: "K", avatar: MEMBER_AVATARS.klaus },
  { name: "Jatin", initial: "J", avatar: MEMBER_AVATARS.jatin },
  { name: "Damon", initial: "D", avatar: MEMBER_AVATARS.damon },
];

const previewWorkspaces = [
  { id: "ws-coria", name: "Coria" },
  { id: "ws-algoris", name: "Algoris" },
];

type PreviewMessage =
  | {
      id: string;
      kind: "member";
      name: string;
      initial: string;
      avatar?: string;
      content: string;
      time: string;
    }
  | { id: string; kind: "own"; content: string; time: string }
  | {
      id: string;
      kind: "agent";
      content: string;
      time: string;
      showReasoning?: boolean;
    };

type ActionStatus = "pending" | "approved" | "declined";

const INITIAL_MESSAGES: PreviewMessage[] = [
  {
    id: "m1",
    kind: "member",
    name: "Klaus",
    initial: "K",
    avatar: MEMBER_AVATARS.klaus,
    content: "Shipped the auth fix. Ready for review?",
    time: "9:14 AM",
  },
  {
    id: "m2",
    kind: "own",
    content: "@divv draft a GitHub comment on our pricing decision",
    time: "10:42 AM",
  },
  {
    id: "m3",
    kind: "agent",
    content:
      "Found the pricing thread in #product. I can post a summary comment to the repo, but that needs your approval first.",
    time: "10:42 AM",
    showReasoning: true,
  },
];

function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function nextId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function Icon({
  children,
  className = "",
  width = 16,
  height = 16,
}: {
  children: ReactNode;
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function AgentAvatar({
  name,
  color,
  avatar,
  size = "md",
}: {
  name: string;
  color: string;
  avatar?: string;
  size?: "sm" | "md";
}) {
  const sizeClass =
    size === "sm" ? "coria-preview__avatar--sm" : "coria-preview__avatar--md";
  return (
    <div
      className={`coria-preview__avatar ${sizeClass}`}
      style={{ backgroundColor: avatar ? undefined : color }}
    >
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt="" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );
}

function MemberAvatar({
  name,
  initial,
  avatar,
  size = "md",
}: {
  name?: string;
  initial: string;
  avatar?: string;
  size?: "sm" | "md";
}) {
  const sizeClass =
    size === "sm" ? "coria-preview__avatar--sm" : "coria-preview__avatar--md";
  const photo = name ? memberAvatarFor(name, avatar) : avatar;

  return (
    <div
      className={`coria-preview__avatar ${sizeClass} ${
        photo
          ? "coria-preview__avatar--photo"
          : "coria-preview__avatar--member"
      }`}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={name ? `${name} avatar` : ""} />
      ) : (
        initial
      )}
    </div>
  );
}

function WorkspaceSwitcherPreview() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(previewWorkspaces[0].id);

  const active =
    previewWorkspaces.find((w) => w.id === activeId) ?? previewWorkspaces[0];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div ref={menuRef} className="coria-preview__ws-switcher">
      <button
        type="button"
        className={`coria-preview__ws-btn${open ? " coria-preview__ws-btn--open" : ""}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="coria-preview__ws-name">{active.name}</span>
        <Icon className="coria-preview__ws-chevron" width={16} height={16}>
          <path d="m7 15 5 5 5-5" />
          <path d="m7 9 5-5 5 5" />
        </Icon>
      </button>

      {open ? (
        <div className="coria-preview__ws-menu">
          <p className="coria-preview__ws-menu-label">Workspaces</p>
          <ul className="coria-preview__ws-list" role="listbox">
            {previewWorkspaces.map((workspace) => {
              const selected = workspace.id === activeId;
              return (
                <li key={workspace.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`coria-preview__ws-option${selected ? " coria-preview__ws-option--selected" : ""}`}
                    onClick={() => {
                      setActiveId(workspace.id);
                      setOpen(false);
                    }}
                  >
                    <Icon
                      className="coria-preview__ws-check"
                      width={16}
                      height={16}
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </Icon>
                    <span className="coria-preview__ws-option-name">
                      {workspace.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="coria-preview__ws-menu-divider" />
          <button type="button" className="coria-preview__ws-create">
            <Icon width={16} height={16}>
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </Icon>
            Create workspace
          </button>
        </div>
      ) : null}
    </div>
  );
}

function AiBadge() {
  return (
    <span className="coria-preview__ai-badge">
      <Icon className="inline-block">
        <path d="M12 8V4H8" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" />
        <path d="M20 14h2" />
        <path d="M15 13v2" />
        <path d="M9 13v2" />
      </Icon>
      AI
    </span>
  );
}

function renderContent(text: string) {
  const parts = text.split(/(@divv)/gi);
  return parts.map((part, i) =>
    part.toLowerCase() === "@divv" ? (
      <span key={i} className="coria-preview__mention">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function PreviewMessageRow({ message }: { message: PreviewMessage }) {
  if (message.kind === "own") {
    return (
      <div className="coria-preview__msg-row coria-preview__msg-row--own">
        <div className="coria-preview__bubble coria-preview__bubble--own">
          {renderContent(message.content)}
        </div>
        <div className="coria-preview__msg-meta">
          <span>{message.time}</span>
        </div>
      </div>
    );
  }

  if (message.kind === "agent") {
    return (
      <div className="coria-preview__msg-row">
        <AgentAvatar
          name="divv"
          color="#6366f1"
          avatar={`${APP_ORIGIN}/agents/divv-avatar.png`}
        />
        <div>
          <div className="coria-preview__msg-meta">
            <strong>divv</strong>
            <AiBadge />
            <span>{message.time}</span>
          </div>
          <div className="coria-preview__bubble coria-preview__bubble--agent">
            {message.content}
          </div>
          {message.showReasoning ? (
            <p className="coria-preview__reasoning">› Show reasoning</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="coria-preview__msg-row">
      <MemberAvatar
        name={message.name}
        initial={message.initial}
        avatar={message.avatar}
      />
      <div>
        <div className="coria-preview__msg-meta">
          <strong>{message.name}</strong>
          <span>{message.time}</span>
        </div>
        <div className="coria-preview__bubble coria-preview__bubble--other">
          {message.content}
        </div>
      </div>
    </div>
  );
}

export function ProductPreview({
  compact = false,
  fill = false,
}: {
  compact?: boolean;
  fill?: boolean;
}) {
  const composerId = useId();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<PreviewMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [actionStatus, setActionStatus] = useState<ActionStatus>("pending");

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, actionStatus, scrollToBottom]);

  function appendAgentReply(content: string, showReasoning = false) {
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          kind: "agent",
          content,
          time: formatTime(),
          showReasoning,
        },
      ]);
    }, 600);
  }

  function sendMessage(e?: FormEvent) {
    e?.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      { id: nextId(), kind: "own", content: text, time: formatTime() },
    ]);
    setDraft("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    if (/@divv\b/i.test(text)) {
      appendAgentReply(
        "On it. I can help with that in this demo. Try Approve or Decline on the action below.",
        true,
      );
    }
  }

  function onComposerKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function onDraftChange(value: string) {
    setDraft(value);
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  function approveAction() {
    if (actionStatus !== "pending") return;
    setActionStatus("approved");
    appendAgentReply(
      "Approved. Posted summary comment to thejatinchawla/coria#42.",
    );
  }

  function declineAction() {
    if (actionStatus !== "pending") return;
    setActionStatus("declined");
    appendAgentReply(
      "Understood. I did not post the comment. Let me know if you want a different draft.",
    );
  }

  const showPendingBadge = actionStatus === "pending";
  const canSend = draft.trim().length > 0;

  return (
    <div
      className={`coria-preview ${geist.variable} ${
        fill ? "coria-preview--fill" : compact ? "coria-preview--compact" : "coria-preview--full"
      }`}
      style={{
        fontFamily:
          "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
      }}
      role="region"
      aria-label="Interactive Coria product preview"
    >
      <div className="coria-preview__shell">
        <aside className="coria-preview__sidebar">
          <div className="coria-preview__ws-header">
            <WorkspaceSwitcherPreview />
          </div>

          <nav className="coria-preview__nav">
            {channels.map((ch) => (
              <button
                key={ch.name}
                type="button"
                className={`coria-preview__channel${ch.active ? " coria-preview__channel--active" : ""}`}
              >
                # {ch.name}
              </button>
            ))}
            <div className="coria-preview__new-channel">
              <Icon>
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </Icon>
              New channel
            </div>

            <div className="coria-preview__dm-section">
              <p className="coria-preview__dm-label">Direct messages</p>
              {dmAgents.map((agent) => (
                <button
                  key={agent.slug}
                  type="button"
                  className="coria-preview__dm-row"
                >
                  <AgentAvatar
                    name={agent.name}
                    color={agent.color}
                    avatar={agent.avatar}
                    size="sm"
                  />
                  <span className="coria-preview__dm-name">
                    <span>{agent.name}</span>
                    <AiBadge />
                  </span>
                </button>
              ))}
              {dmMembers.map((member) => (
                <button
                  key={member.name}
                  type="button"
                  className="coria-preview__dm-row"
                >
                  <MemberAvatar
                    name={member.name}
                    initial={member.initial}
                    avatar={member.avatar}
                    size="sm"
                  />
                  <span className="coria-preview__dm-name">
                    <span>{member.name}</span>
                  </span>
                </button>
              ))}
            </div>
          </nav>

          <div className="coria-preview__settings">
            <div className="coria-preview__settings-link">
              <Icon>
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </Icon>
              Settings
            </div>
          </div>

          <div className="coria-preview__user-footer">
            <p className="coria-preview__user-name">Jatin</p>
            <p className="coria-preview__user-email">jatin@coria.app</p>
            <div className="coria-preview__sign-out">
              <Icon>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </Icon>
              Sign out
            </div>
          </div>
        </aside>

        <div className="coria-preview__main">
          <header className="coria-preview__header">
            <div className="coria-preview__header-top">
              <div className="coria-preview__header-leading">
                <button
                  type="button"
                  className="coria-preview__menu-btn"
                  aria-label="Open menu"
                >
                  <Icon width={20} height={20}>
                    <path d="M4 5h16" />
                    <path d="M4 12h16" />
                    <path d="M4 19h16" />
                  </Icon>
                </button>
                <div className="coria-preview__header-titles">
                  <h1 className="coria-preview__channel-title">#general</h1>
                  <span className="coria-preview__channel-sub">
                    Workspace-wide updates and announcements
                  </span>
                </div>
              </div>
              <div className="coria-preview__header-actions">
                {showPendingBadge ? (
                  <span className="coria-preview__pending-badge">
                    <Icon>
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                      <path d="M12 8v4" />
                      <path d="M12 16h.01" />
                    </Icon>
                    1
                  </span>
                ) : null}
                <span className="coria-preview__icon-btn">
                  <Icon className="size-5" width={20} height={20}>
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </Icon>
                </span>
              </div>
            </div>
            <nav className="coria-preview__tabs" aria-label="Channel views">
              <button
                type="button"
                className="coria-preview__tab coria-preview__tab--active"
              >
                <Icon>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </Icon>
                <span className="coria-preview__tab-label">Messages</span>
              </button>
              <button type="button" className="coria-preview__tab">
                <Icon>
                  <path d="M12 17v5" />
                  <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 7 15.66V22h10v-6.34a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 13 10.76V2L12 1 11 2z" />
                </Icon>
                <span className="coria-preview__tab-label">Pins</span>
              </button>
              <button type="button" className="coria-preview__tab">
                <Icon>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </Icon>
                <span className="coria-preview__tab-label">Members</span>
                <span className="coria-preview__tab-count">5</span>
              </button>
            </nav>
          </header>

          <div className="coria-preview__messages">
            <div className="coria-preview__messages-inner">
              {messages.map((message) => (
                <PreviewMessageRow key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {actionStatus === "pending" ? (
            <div className="coria-preview__actions">
              <div className="coria-preview__action-card">
                <p className="coria-preview__action-label">
                  Action requires approval
                </p>
                <p className="coria-preview__action-summary">
                  Post summary comment on pricing discussion
                </p>
                <p className="coria-preview__action-tool">
                  github_post_comment
                </p>
                <div className="coria-preview__action-btns">
                  <button
                    type="button"
                    className="coria-preview__btn-approve"
                    onClick={approveAction}
                  >
                    <Icon>
                      <path d="M20 6 9 17l-5-5" />
                    </Icon>
                    Approve
                  </button>
                  <button
                    type="button"
                    className="coria-preview__btn-decline"
                    onClick={declineAction}
                  >
                    <Icon>
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </Icon>
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <form
            className="coria-preview__composer"
            onSubmit={sendMessage}
          >
            <div className="coria-preview__composer-inner">
              <textarea
                ref={textareaRef}
                id={composerId}
                rows={1}
                value={draft}
                onChange={(e) => onDraftChange(e.target.value)}
                onKeyDown={onComposerKeyDown}
                placeholder="Message #general (@divv…)"
                className="coria-preview__textarea"
                aria-label="Message #general"
              />
              <button
                type="submit"
                className="coria-preview__send"
                aria-label="Send message"
                disabled={!canSend}
              >
                <Icon>
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </Icon>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
