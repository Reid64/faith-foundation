/**
 * Photo catalog for the FAITH Foundation site.
 *
 * These were previously hotlinked from images.unsplash.com. On 2026-08-14 the
 * `veteran` photo was deleted upstream and started returning 404, which left
 * the /programs/veterans hero blank on the live site until an audit caught it.
 * Every photo is now downloaded and served from /public/photos, so no page can
 * be broken by a third party removing an asset.
 *
 * All files were fetched at 2000px wide (the largest size any call site asked
 * for) and are cropped by CSS `object-cover` at the point of use, which is why
 * `img()` no longer needs to build a sized URL.
 *
 * `output: "export"` + `images.unoptimized` (see next.config.mjs) means these
 * are referenced from plain <img> tags throughout.
 */

/**
 * Photo key -> file served from /public/photos.
 *
 * WebP, capped at 1600px wide. These were JPEGs at 2000px until 2026-08-15,
 * which Lighthouse mobile scored as 426 KiB of oversized-image waste and
 * 201 KiB of format waste on /about/ alone — enough to push LCP past four
 * seconds. Converting the catalog cut 10.44 MB of photography to 3.27 MB
 * (-69%) with no visible change, because 1600px is still wider than any box
 * the site renders.
 *
 * Regenerate with `node scripts/optimize-photos.js` after adding a JPEG here.
 * The source JPEGs are kept on disk as the archival originals.
 *
 * NOTE: the four real FAITH Foundation home photographs in `src/lib/media.ts`
 * are deliberately NOT in this catalog and stay JPEG — they are already
 * well-compressed, and WebP made one of them 14% larger.
 */
export const IMAGES = {
  // Homes & housing
  modernHome: "/photos/modern-home.webp",
  suburbanHome: "/photos/suburban-home.webp",
  cozyHome: "/photos/cozy-home.webp",
  newKeys: "/photos/new-keys.webp",
  houseInterior: "/photos/house-interior.webp",

  // Families & people
  familyTogether: "/photos/family-together.webp",
  familyOutdoors: "/photos/family-outdoors.webp",
  parentChild: "/photos/parent-child.webp",
  friendsGroup: "/photos/friends-group.webp",
  diversePeople: "/photos/diverse-people.webp",
  olderCouple: "/photos/older-couple.webp",

  // Community, volunteers, gatherings
  volunteersHands: "/photos/volunteers-hands.webp",
  volunteersBoxes: "/photos/volunteers-boxes.webp",
  communityGathering: "/photos/community-gathering.webp",
  teamMeeting: "/photos/team-meeting.webp",
  peopleTalking: "/photos/people-talking.webp",

  // Education & finance
  classroom: "/photos/classroom.webp",
  studying: "/photos/studying.webp",
  finance: "/photos/finance.webp",
  planning: "/photos/planning.webp",
  handshake: "/photos/handshake.webp",

  // Veterans & service
  veteran: "/photos/veteran-saluting.webp",
  flag: "/photos/flag.webp",

  // Texture / landscape
  texasHills: "/photos/texas-hills.webp",
  sunrise: "/photos/sunrise.webp",
} as const;

export type ImageKey = keyof typeof IMAGES;

/**
 * Path for a catalog key.
 *
 * The width/height parameters are accepted and ignored. They exist because call
 * sites were written against the old Unsplash URL builder, which baked a crop
 * into the query string. Self-hosted files ship at a single size and every call
 * site already constrains the visible box with CSS, so the arguments no longer
 * change anything. They are kept so the ~19 existing call sites did not all
 * need editing, and so passing a size stays harmless rather than becoming a
 * type error.
 */
export function img(key: ImageKey, _w?: number, _h?: number): string {
  return IMAGES[key];
}
