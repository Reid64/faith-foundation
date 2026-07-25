"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type HeroVideoProps = {
  /** Background clip. */
  src?: string;
  /** Accepted for backwards-compat; only the first clip is used. */
  sources?: readonly string[];
  /** Still image painted instantly while the clip buffers. */
  poster?: string;
  /** Overlay content (headline, CTAs). */
  children: ReactNode;
  /** Minimum section height. Defaults to a near-fullscreen hero. */
  className?: string;
};

/**
 * Fullscreen, muted, autoplaying video hero — tuned for fast first paint.
 *
 * The poster is rendered as an eager, high-priority <img> so it paints
 * immediately and serves as the LCP element. The <video> uses
 * `preload="none"` and its <source> is only attached AFTER the page has
 * painted and the browser is idle, so the ~1.5MB clip never competes with
 * the critical render path. Once it can play, it crossfades over the poster.
 */
export default function HeroVideo({
  src,
  sources,
  poster,
  children,
  className = "min-h-[100svh]",
}: HeroVideoProps) {
  const clip = (sources && sources.length ? sources[0] : src) ?? "";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loadVideo, setLoadVideo] = useState(false);
  const [ready, setReady] = useState(false);

  // Defer video loading until after first paint + browser idle.
  useEffect(() => {
    const start = () => setLoadVideo(true);
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(start, { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(start, 1200);
    return () => window.clearTimeout(id);
  }, []);

  // Kick off buffering/playback once the source has been attached.
  useEffect(() => {
    if (!loadVideo) return;
    const v = videoRef.current;
    if (!v) return;
    v.load();
    v.play?.().catch(() => {});
  }, [loadVideo]);

  return (
    <section className={`relative flex items-center overflow-hidden bg-charcoal ${className}`}>
      {/* Instant-painting poster — the LCP element. */}
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          aria-hidden
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <video
        ref={videoRef}
        muted
        loop
        playsInline
        autoPlay
        preload="none"
        onCanPlay={() => setReady(true)}
        className={`absolute inset-0 h-full w-full object-cover [transform:translateZ(0)] [will-change:transform] transition-opacity duration-700 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      >
        {loadVideo && <source src={clip} type="video/mp4" />}
      </video>

      {/* Neutral legibility scrim — no colour cast, only the bottom-left
          darkened just enough to carry white text. */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/55 via-black/20 to-transparent" />

      <div className="relative z-10 w-full">{children}</div>

      {/* Scroll cue */}
      <div className="pointer-events-none absolute inset-x-0 bottom-7 flex justify-center">
        <span className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/40 p-1.5">
          <span className="h-2 w-1 animate-float-slow rounded-full bg-green-light" />
        </span>
      </div>
    </section>
  );
}
