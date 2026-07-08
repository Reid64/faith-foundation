import { type ReactNode } from "react";

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
 * Fullscreen, muted, autoplaying video hero.
 *
 * A SINGLE <video> element plays one clip on a native loop. There is no
 * JavaScript that swaps `src` or crossfades between clips — that source
 * swapping was the cause of the previous stutter. The element is promoted to
 * its own GPU layer (`translateZ(0)` + `will-change: transform`) so the browser
 * composites it smoothly.
 */
export default function HeroVideo({
  src,
  sources,
  poster,
  children,
  className = "min-h-[100svh]",
}: HeroVideoProps) {
  const clip = (sources && sources.length ? sources[0] : src) ?? "";

  return (
    <section className={`relative flex items-center overflow-hidden bg-charcoal ${className}`}>
      <video
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        poster={poster}
        className="absolute inset-0 h-full w-full object-cover [transform:translateZ(0)] [will-change:transform]"
      >
        <source src={clip} type="video/mp4" />
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


