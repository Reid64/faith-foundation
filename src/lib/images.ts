/**
 * Centralized Unsplash photo catalog for the FAITH Foundation site.
 * Using stable images.unsplash.com photo IDs with crop/quality params.
 * `output: "export"` + `images.unsplosh unoptimized` means plain <img> tags
 * are used throughout (see next.config.mjs).
 */

const BASE = "https://images.unsplash.com/photo-";

/** Build a sized Unsplash URL from a photo id. */
export function unsplash(id: string, w = 1600, h?: number) {
  const crop = h ? `&fit=crop&h=${h}` : "&fit=crop";
  return `${BASE}${id}?auto=format&q=80&w=${w}${crop}`;
}

export const IMAGES = {
  // Homes & housing
  modernHome: "1564013799919-ab600027ffc6",
  suburbanHome: "1570129477492-45c003edd2be",
  cozyHome: "1518780664697-55e3ad937233",
  newKeys: "1560518883-ce09059eeffa",
  houseInterior: "1493809842364-78817add7ffb",

  // Families & people
  familyTogether: "1511895426328-dc8714191300",
  familyOutdoors: "1609220136736-443140cffec6",
  parentChild: "1476703993599-0035a21b17a9",
  friendsGroup: "1488521787991-ed7bbaae773c",
  diversePeople: "1543269865-cbf427effbad",
  olderCouple: "1581579438747-1dc8d17bbce4",

  // Community, volunteers, gatherings
  volunteersHands: "1559027615-cd4628902d4a",
  volunteersBoxes: "1593113598332-cd288d649433",
  communityGathering: "1529156069898-49953e39b3ac",
  teamMeeting: "1521737604893-d14cc237f11d",
  peopleTalking: "1517457373958-b7bdd4587205",

  // Education & finance
  classroom: "1524178232363-1fb2b075b655",
  studying: "1499750310107-5fef28a66643",
  finance: "1554224155-6726b3ff858f",
  planning: "1517245386807-bb43f82c33c4",
  handshake: "1521791136064-7986c2920216",

  // Veterans & service
  veteran: "1541252260730-0412e8e2108e",
  flag: "1551731409-43eb3e517a1a",

  // Texture / landscape
  texasHills: "1500382017468-9049fed747ef",
  sunrise: "1470071459604-3b5ec3a7fe05",
} as const;

export type ImageKey = keyof typeof IMAGES;

/** Convenience: full URL for a catalog key. */
export function img(key: ImageKey, w = 1600, h?: number) {
  return unsplash(IMAGES[key], w, h);
}


