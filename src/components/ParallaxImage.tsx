"use client";

import { useEffect, useRef } from "react";

type ParallaxImageProps = {
  src: string;
  alt: string;
  /** Parallax strength in px of travel across the viewport. */
  strength?: number;
  className?: string;
  imgClassName?: string;
  /** Show a thin gold frame offset behind the image. */
  framed?: boolean;
};

/**
 * Image whose inner picture drifts vertically as the section scrolls past,
 * creating a subtle depth/parallax effect. Pure rAF + transform; disabled
 * under prefers-reduced-motion.
 */
export default function ParallaxImage({
  src,
  alt,
  strength = 60,
  className = "",
  imgClassName = "",
  framed = false,
}: ParallaxImageProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const image = imgRef.current;
    if (!wrap || !image) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;
      // progress: -1 (entering bottom) → 1 (leaving top)
      const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      image.style.transform = `translate3d(0, ${(-progress * strength).toFixed(1)}px, 0) scale(1.18)`;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [strength]);

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {framed && (
        <span
          aria-hidden
          className="absolute -bottom-4 -right-4 -z-10 hidden h-full w-full rounded-[2rem] border-2 border-gold/60 sm:block"
        />
      )}
      <div className="relative h-full w-full overflow-hidden rounded-[2rem] shadow-card-lg">
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          className={`h-full w-full object-cover will-change-transform ${imgClassName}`}
          style={{ transform: "scale(1.18)" }}
        />
      </div>
    </div>
  );
}


