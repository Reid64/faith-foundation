"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { isInternalRoute } from "@/lib/chrome";

type Msg = { role: "user" | "assistant"; content: string };

const OPENING =
  "Hi — I'm the FAITH Foundation intake assistant. Tell me a little about your housing situation and what kind of help you're looking for, and I'll point you to the right program.";

/**
 * Public intake assistant.
 *
 * Rendered from the root layout but hidden on the admin and login routes — the
 * same `isInternalRoute` check SiteHeader and SiteFooter use, so the internal
 * shell stays free of public chrome.
 *
 * Nothing here claims a submission that did not happen: the confirmation only
 * appears when the API reports that the contact row actually committed, and a
 * failed save says so and points at the application form.
 */
export default function IntakeChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: OPENING },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [sessionId] = useState(
    () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  );
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  if (isInternalRoute(pathname)) return null;

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text || pending) return;

    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setPending(true);
    setNotice(null);

    try {
      const res = await fetch("/api/ai/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The opening line is ours, not the model's — sending it back would
        // have the assistant treat its own greeting as conversation history.
        body: JSON.stringify({ messages: next.slice(1), sessionId }),
      });

      const payload = await res.json();

      if (!res.ok) {
        setNotice(payload?.error ?? "Something went wrong. Please try the form.");
        setPending(false);
        return;
      }

      setMessages([...next, { role: "assistant", content: payload.response }]);
      if (payload.complete) setComplete(true);
      if (payload.save_failed) {
        setNotice(
          "We could not save your details automatically. Please use the application form so nothing is lost."
        );
      }
    } catch {
      setNotice(
        "We could not reach the assistant. Please use the application form and we will be in touch."
      );
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open the intake assistant"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition hover:brightness-110"
        style={{ backgroundColor: "#16243F", color: "#FAF8F1" }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-5.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8Z" />
        </svg>
        Get Help
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="FAITH Foundation intake assistant"
      className="fixed inset-x-0 bottom-0 z-40 flex h-[85vh] flex-col rounded-t-2xl shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:h-[32rem] sm:w-[24rem] sm:rounded-2xl"
      style={{ backgroundColor: "#FAF8F1", border: "1px solid rgba(22,36,63,0.15)" }}
    >
      <header
        className="flex items-center justify-between gap-3 rounded-t-2xl px-4 py-3"
        style={{ backgroundColor: "#16243F", color: "#FAF8F1" }}
      >
        <div>
          <p className="text-sm font-semibold">FAITH Foundation</p>
          <p className="text-xs" style={{ color: "rgba(250,248,241,0.7)" }}>
            Intake assistant
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close the intake assistant"
          className="rounded-lg px-2 py-1 text-lg leading-none"
          style={{ color: "#FAF8F1" }}
        >
          ×
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <p
              className="max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
              style={
                m.role === "user"
                  ? { backgroundColor: "#16243F", color: "#FAF8F1" }
                  : {
                      backgroundColor: "#ffffff",
                      color: "#16243F",
                      border: "1px solid rgba(22,36,63,0.1)",
                    }
              }
            >
              {m.content}
            </p>
          </div>
        ))}

        {pending ? (
          <div className="flex justify-start">
            <p
              className="rounded-2xl px-3.5 py-2.5 text-sm"
              style={{
                backgroundColor: "#ffffff",
                color: "rgba(22,36,63,0.5)",
                border: "1px solid rgba(22,36,63,0.1)",
              }}
            >
              <span className="inline-flex gap-1" aria-label="Assistant is typing">
                <span className="animate-pulse">•</span>
                <span className="animate-pulse [animation-delay:150ms]">•</span>
                <span className="animate-pulse [animation-delay:300ms]">•</span>
              </span>
            </p>
          </div>
        ) : null}

        {complete ? (
          <div
            className="rounded-2xl px-4 py-3 text-sm"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #C9A227",
              color: "#16243F",
            }}
          >
            <p className="font-semibold">Your details are with us.</p>
            <p className="mt-1 leading-relaxed">
              A team member will review them and be in touch within two business
              days. You can also complete the full application now.
            </p>
            <Link
              href="/apply"
              className="mt-3 inline-block rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: "#C9A227", color: "#16243F" }}
            >
              Apply Online
            </Link>
          </div>
        ) : null}

        {notice ? (
          <p
            role="alert"
            className="rounded-xl px-3 py-2 text-sm"
            style={{
              backgroundColor: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
            }}
          >
            {notice}{" "}
            <Link href="/apply" className="font-semibold underline">
              Open the application form
            </Link>
          </p>
        ) : null}

        <div ref={endRef} />
      </div>

      <form
        onSubmit={send}
        className="flex items-center gap-2 border-t px-3 py-3"
        style={{ borderColor: "rgba(22,36,63,0.1)" }}
      >
        <label htmlFor="intake-input" className="sr-only">
          Your message
        </label>
        <input
          id="intake-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message…"
          maxLength={2000}
          disabled={pending}
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: "rgba(22,36,63,0.2)", backgroundColor: "#fff", color: "#16243F" }}
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
          style={{ backgroundColor: "#16243F", color: "#FAF8F1" }}
        >
          Send
        </button>
      </form>

      <p
        className="px-4 pb-3 text-[11px] leading-relaxed"
        style={{ color: "rgba(22,36,63,0.5)" }}
      >
        This assistant collects information for a person to review. It cannot
        decide eligibility or approve assistance.
      </p>
    </div>
  );
}
