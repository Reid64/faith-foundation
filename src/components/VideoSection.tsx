"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type VideoSectionProps = {
  src: string;
  poster?: string;
  children: ReactNode;
  /** Overlay treatment. "navy" (default) | "dark" | "gold". */
  overlay?: "navy" | "dark" | "gold";
  className?: string;
};

// Neutral, low-tint scrims — just enough darkening to carry white text, with a
// warm green cast (never the old heavy blue) where an accent helps.
const OVERLAYS: Record<NonNullable<VideoSectionProps["overlay"]>, string> = {
  navy: "bg-gradient-to-br from-charcoal/80 via-charcoal/55 to-green-deep/55",
  dark: "bg-gradient-to-t from-black/85 via-black/55 to-black/70",
  gold: "bg-gradient-to-br from-charcoal/75 via-charcoal/50 to-gold-dark/40",
};

/**
 * Full-bleed section with a muted, looping video background and a gradient
 * overlay. The clip only begins playing once scrolled into view to save
 * bandwidth, and is skipped entirely under prefers-reduced-motion.
 */
export default function VideoSection({
  src,
  poster,
  children,
  overlay = "navy",
  className = "",
}: VideoSectionProps) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().then(() => setActive(true)).catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={`relative overflow-hidden bg-charcoal ${className}`}>
      {poster && (
        <img src={poster} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      )}
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        poster={poster}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className={`absolute inset-0 ${OVERLAYS[overlay]}`} />
      <div className="relative z-10">{children}</div>
    </section>
  );
}


