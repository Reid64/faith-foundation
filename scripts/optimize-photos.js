/**
 * Builds the WebP photo catalog in /public/photos from the archival JPEG
 * originals in /assets/photo-originals.
 *
 * WHY: every photo was downloaded at 2000px and served as a JPEG to every
 * device. Lighthouse mobile flagged 426 KiB of oversized-image waste and
 * 201 KiB of format waste on /about/ alone, pushing LCP past 4 seconds.
 * Converting the catalog cut 10.44 MB to 3.27 MB (-69%).
 *
 * WHAT THIS DOES: writes a WebP into public/photos for each JPEG original, at
 * a 1600px cap — still wider than any box the site renders, so nothing softens
 * visually. `src/lib/images.ts` points at the WebP files, so the whole site
 * switches format from one map.
 *
 * WHY THE ORIGINALS LIVE OUTSIDE /public: anything under /public is uploaded
 * and served. The JPEGs are no longer referenced by any page, so shipping them
 * would push ~10 MB of dead weight to the CDN and leave a trap for whoever next
 * writes a path by hand. They stay in /assets as the source of truth for
 * re-encoding.
 *
 * NOTE: the four real FAITH Foundation home photographs (public/photos/home-*.jpg,
 * referenced from src/lib/media.ts) are deliberately excluded and stay JPEG —
 * they are already well-compressed and WebP made one of them 14% larger.
 *
 * Idempotent: re-running skips files whose WebP is newer than the source.
 *
 * Run: node scripts/optimize-photos.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SRC_DIR = path.join(__dirname, "..", "assets", "photo-originals");
const DIR = path.join(__dirname, "..", "public", "photos");

/**
 * Stock catalogue photography (src/lib/images.ts). Downloaded at 2000px and
 * only ever rendered inside CSS-constrained boxes, so a 1600px cap is
 * invisible.
 */
const MAX_WIDTH = 1600;
const QUALITY = 74;

/**
 * The four real FAITH Foundation home photographs (src/lib/media.ts). These are
 * brand assets, one of which is the homepage hero poster, so they get a
 * separate, more conservative pass: a 1200px cap (still above a 390px phone at
 * 3x DPR) and higher quality.
 *
 * Only re-encode where it actually wins. `home-evening` is already a
 * well-compressed 1200px JPEG and every WebP encoding tried came out LARGER —
 * so it is skipped and stays JPEG. Blanket "convert everything to WebP" would
 * have made that file 9% heavier.
 */
const BRAND_PREFIX = /^home-/;
const BRAND_MAX_WIDTH = 1200;
const BRAND_QUALITY = 72;

async function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`Missing originals directory: ${SRC_DIR}`);
    process.exit(1);
  }
  fs.mkdirSync(DIR, { recursive: true });

  const files = fs
    .readdirSync(SRC_DIR)
    .filter((f) => /\.jpe?g$/i.test(f));
  if (files.length === 0) {
    console.log("No JPEG originals found — nothing to do.");
    return;
  }

  let converted = 0;
  let skipped = 0;
  let beforeTotal = 0;
  let afterTotal = 0;

  let rejected = 0;

  for (const file of files) {
    const isBrand = BRAND_PREFIX.test(file);
    const cap = isBrand ? BRAND_MAX_WIDTH : MAX_WIDTH;
    const quality = isBrand ? BRAND_QUALITY : QUALITY;

    const src = path.join(SRC_DIR, file);
    const dest = path.join(DIR, file.replace(/\.jpe?g$/i, ".webp"));
    const jpegFallback = path.join(DIR, file);

    const srcStat = fs.statSync(src);
    beforeTotal += srcStat.size;

    if (fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= srcStat.mtimeMs) {
      afterTotal += fs.statSync(dest).size;
      skipped += 1;
      continue;
    }

    const image = sharp(src);
    const meta = await image.metadata();
    const width = Math.min(meta.width || cap, cap);

    const buffer = await image
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toBuffer();

    // Never ship a "optimized" file that is bigger than what it replaces.
    if (buffer.length >= srcStat.size) {
      if (!fs.existsSync(jpegFallback)) fs.copyFileSync(src, jpegFallback);
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      afterTotal += srcStat.size;
      rejected += 1;
      console.log(
        `${file.padEnd(28)} ${(srcStat.size / 1024).toFixed(0).padStart(5)} KB -> ` +
          `WebP was larger, keeping JPEG`
      );
      continue;
    }

    fs.writeFileSync(dest, buffer);
    // The JPEG is now unreferenced for this key; don't ship both.
    if (fs.existsSync(jpegFallback)) fs.unlinkSync(jpegFallback);

    afterTotal += buffer.length;
    converted += 1;

    const pct = Math.round((1 - buffer.length / srcStat.size) * 100);
    console.log(
      `${file.padEnd(28)} ${(srcStat.size / 1024).toFixed(0).padStart(5)} KB -> ` +
        `${(buffer.length / 1024).toFixed(0).padStart(5)} KB  (-${pct}%)`
    );
  }

  console.log(
    `\n${converted} converted, ${skipped} already current, ` +
      `${rejected} kept as JPEG (WebP was larger). ` +
      `${(beforeTotal / 1048576).toFixed(2)} MB originals -> ` +
      `${(afterTotal / 1048576).toFixed(2)} MB shipped ` +
      `(-${Math.round((1 - afterTotal / beforeTotal) * 100)}%).`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
