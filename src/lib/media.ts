/**
 * Local media catalog — videos, photography, and the brand logo shipped in
 * /public. These are the real FAITH Foundation assets and take priority over
 * any stock imagery across the site.
 */

/** Brand logo — official FAITH Foundation logo (transparent PNG, emblem + wordmark). */
export const LOGO = "/Images/faith-foundation-logo.png";

/** Alias kept for existing imports — same official logo asset. */
export const LOGO_DARK = "/Images/faith-foundation-logo.png";

/** Fullscreen / section-background video clips (4K landscape unless noted). */
export const VIDEOS = {
  /** Hero clip — flagship landscape loop for the homepage. */
  hero: "/videos/hero-720p.mp4",
  /** Highest-fidelity 60fps clip — the Programs overview statement. */
  programs: "/videos/programs-720p.mp4",
  /** Partnership section background. */
  partnership: "/videos/partnership-720p.mp4",
  /** Housing-voucher section background. */
  housing: "/videos/housing-720p.mp4",
  /** Vertical 1080×1920 clip — inline portrait media. */
  vertical: "/videos/8293116-hd_1080_1920_25fps.mp4",
} as const;

/**
 * Every landscape hero-grade clip, in play order. The homepage hero cycles
 * through this list rather than looping a single video.
 */
export const HERO_VIDEOS = [
  "/videos/hero-720p.mp4",
] as const;

/** Real photography of affordable / modular homes. */
export const PHOTOS = {
  /** Slate-grey modern home, lakeside, full wrap porch. */
  modern: "/photos/home-modern.jpg",
  /** Warm timber cabin in an open Texas field. */
  cabin: "/photos/home-cabin.jpg",
  /** Black home glowing at dusk with string lights + firepit. */
  evening: "/photos/home-evening.png",
  /** Bright yellow family home under a clear blue sky. */
  yellow: "/photos/home-yellow.png",
} as const;

export type PhotoKey = keyof typeof PHOTOS;




