"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

/**
 * Cloudflare Turnstile — the single widget every public form uses.
 *
 * There is exactly one copy of the script tag on the site: the loader below is
 * module-scoped, so ten forms on ten pages share one <script> and one promise.
 *
 * TOKENS ARE SINGLE USE. Cloudflare invalidates a token once siteverify has
 * seen it, and again when it expires (~5 minutes). So the parent form must
 * reset the widget after EVERY submit — success or failure — or the second
 * attempt sends a token the server will correctly reject. That is what the
 * imperative `reset()` handle is for.
 *
 * The site key is public by design (it identifies the widget to Cloudflare).
 * The SECRET key is never touched here — it lives only in the server-side
 * verifier, src/lib/turnstile.ts.
 */

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

/** Set when the widget is configured; forms read this to decide whether to gate. */
export const TURNSTILE_ENABLED = TURNSTILE_SITE_KEY.length > 0;

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: Record<string, unknown>
      ) => string | undefined;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

let loader: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (loader) return loader;

  loader = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Turnstile failed to load"))
      );
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      // Let a later mount try again rather than caching the failure forever.
      loader = null;
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(script);
  });

  return loader;
}

export type TurnstileHandle = { reset: () => void };

export const TurnstileWidget = forwardRef<
  TurnstileHandle,
  {
    /** Fires with a fresh token, and with null whenever the token stops being valid. */
    onVerify: (token: string | null) => void;
    /** `dark` on the navy footer, `light` on the cream/white form cards. */
    theme?: "light" | "dark";
    className?: string;
  }
>(function TurnstileWidget({ onVerify, theme = "light", className }, ref) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const onVerifyRef = useRef(onVerify);
  const [failed, setFailed] = useState(false);

  // Kept in a ref so a parent re-render never re-renders the widget itself.
  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  useImperativeHandle(
    ref,
    () => ({
      reset() {
        if (widgetId.current && window.turnstile) {
          window.turnstile.reset(widgetId.current);
          onVerifyRef.current(null);
        }
      },
    }),
    []
  );

  useEffect(() => {
    if (!TURNSTILE_ENABLED) return;
    let cancelled = false;

    loadTurnstile()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        // React 18 StrictMode mounts effects twice in development; without this
        // the second pass would stack a second widget in the same container.
        if (widgetId.current) return;

        widgetId.current = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme,
          // Fills the available width instead of a fixed 300px block, which is
          // what keeps it inside the form on a 320px phone.
          size: "flexible",
          callback: (token: string) => {
            setFailed(false);
            onVerifyRef.current(token);
          },
          "expired-callback": () => onVerifyRef.current(null),
          "timeout-callback": () => onVerifyRef.current(null),
          "error-callback": () => {
            setFailed(true);
            onVerifyRef.current(null);
          },
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = undefined;
      }
    };
    // `theme` is fixed per form; re-rendering the widget on a theme change is
    // not a case that occurs, and depending on it would churn the widget.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!TURNSTILE_ENABLED) {
    // No site key configured (local development, or a preview without the
    // variable). Say so rather than rendering an invisible gap — a silent
    // no-op here is how a spam gate quietly stops existing.
    return (
      <p
        className={`text-xs ${theme === "dark" ? "text-white/50" : "text-charcoal/50"} ${className ?? ""}`}
      >
        Spam protection is not configured in this environment.
      </p>
    );
  }

  return (
    <div className={className}>
      {/* max-w-full + overflow guard: the widget has a 300px minimum, and this
          keeps it from pushing the form wider than the viewport on a phone. */}
      <div ref={containerRef} className="max-w-full overflow-x-auto" />
      {failed ? (
        <p
          role="alert"
          className={`mt-2 text-xs ${theme === "dark" ? "text-gold-light" : "text-charcoal/70"}`}
        >
          The spam check could not load. Refresh the page, or use the email
          link below.
        </p>
      ) : null}
    </div>
  );
});
