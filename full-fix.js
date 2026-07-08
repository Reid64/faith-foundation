const fs = require('fs');
const path = require('path');

// ─── ENCODING PATTERNS TO FIX ───────────────────────────────────────
const fixes = [
  [/\u00e2\u20ac\u201c/g, '\u2014'],    // corrupted em dash
  [/\u00e2\u20ac\u201d/g, '\u2014'],    // corrupted em dash v2
  [/\u00e2\u20ac\u2122/g, '\u2019'],    // corrupted apostrophe
  [/\u00e2\u20ac\u0153/g, '\u201c'],    // corrupted left quote
  [/\u00e2\u20ac\u009d/g, '\u201d'],    // corrupted right quote
  [/\u00e2\u20ac\u00a2/g, '\u2022'],    // corrupted bullet
  [/\u00e2\u20ac\u2018/g, '\u2018'],    // corrupted left single quote
  [/\u00e2\u0080\u0093/g, '\u2013'],    // corrupted en dash raw
  [/\u00e2\u0080\u0094/g, '\u2014'],    // corrupted em dash raw
  [/\u00e2\u0080\u0099/g, '\u2019'],    // corrupted apostrophe raw
  [/\u00e2\u0080\u009c/g, '\u201c'],    // corrupted left quote raw
  [/\u00e2\u0080\u009d/g, '\u201d'],    // corrupted right quote raw
  [/\u00e2\u0080\u00a2/g, '\u2022'],    // corrupted bullet raw
  [/\u00c2\u00a9/g, '\u00a9'],          // corrupted copyright
  [/\u00c2\u00a0/g, ' '],              // corrupted nbsp
  [/\u00c3\u00a9/g, '\u00e9'],          // corrupted e-acute
  [/\u00c3\u00b1/g, '\u00f1'],          // corrupted n-tilde
  [/\u00c3\u0097/g, '\u00d7'],          // corrupted multiplication
  [/\u00ef\u00bf\u00bd/g, ''],          // replacement character
  [/\u00c3\u00a2\u00e2\u201a\u00ac\u00e2\u201e\u00a2/g, '\u2019'], // triple apostrophe
  [/\u00c3\u00a2\u00e2\u201a\u00ac\u201c/g, '\u2014'],             // triple dash
  [/\u00c3\u00a2\u00c2\u0080\u00c2\u0094/g, '\u2014'],             // quad em dash
  [/\u00c3\u00a2\u00c2\u0080\u00c2\u0099/g, '\u2019'],             // quad apostrophe
  [/Â©/g, '\u00a9'],                    // visible corrupted copyright
  [/Â®/g, '\u00ae'],                    // visible corrupted registered
  [/Â /g, ' '],                         // visible corrupted nbsp
  [/â—†/g, '\u25C6'],                   // corrupted diamond
  [/âœ¦/g, '\u2726'],                   // corrupted star  
  [/âŒ‚/g, '\u2602'],                   // corrupted umbrella
  [/â"€/g, '\u2500'],                   // corrupted box drawing
  [/â•/g, '\u2550'],                    // corrupted double line
  [/Ã©/g, '\u00e9'],                    // corrupted e-acute v2
  [/Ã±/g, '\u00f1'],                    // corrupted n-tilde v2
  [/Ã¢/g, '\u00e2'],                    // corrupted a-circumflex
  [/ðŸ /g, ''],                         // corrupted emoji fragment (remove)
  [/ðŸ¡/g, '\uD83C\uDFE1'],            // house emoji
  [/ðŸ—ï¸/g, '\uD83C\uDFD7\uFE0F'],    // construction emoji
  [/ðŸ\u008F\u009B/g, '\uD83C\uDFDB'], // classical building
  [/â›ª/g, '\u26EA'],                   // church emoji
];

let totalFound = 0;
let totalFixed = 0;
const filesFixed = [];

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) {
      if (['node_modules', '.next', '.git', 'out'].includes(f)) return;
      return walk(fp);
    }
    if (!/\.(ts|tsx|js|jsx)$/.test(f)) return;

    let t = fs.readFileSync(fp, 'utf8');
    const orig = t;
    let hits = [];

    fixes.forEach(([pattern, replacement]) => {
      const matches = t.match(pattern);
      if (matches) {
        hits.push({ pattern: pattern.toString().slice(1, 30), count: matches.length });
        totalFound += matches.length;
        totalFixed += matches.length;
        t = t.replace(pattern, replacement);
      }
    });

    if (hits.length > 0) {
      console.log('\n' + fp);
      hits.forEach(h => console.log('  ' + h.count + 'x ' + h.pattern));
    }

    if (t !== orig) {
      // Remove BOM if present
      if (t.charCodeAt(0) === 0xFEFF) t = t.slice(1);
      fs.writeFileSync(fp, t, 'utf8');
      filesFixed.push(fp);
    }
  });
}

console.log('=== FULL ENCODING AUDIT & FIX ===\n');
walk('src');

// ─── FIX CORNERSTONE IMAGES ─────────────────────────────────────────
console.log('\n=== FIXING CORNERSTONE IMAGES ===');
const ccFile = 'src/app/programs/cornerstone-communities/page.tsx';
if (fs.existsSync(ccFile)) {
  let cc = fs.readFileSync(ccFile, 'utf8');
  
  // Remove BOM
  if (cc.charCodeAt(0) === 0xFEFF) cc = cc.slice(1);
  
  // Fix hideImage conditional if present
  cc = cc.replace(/\{!community\.hideImage && /g, '');
  // Remove the matching closing brace (}</div> -> </div>)  
  cc = cc.replace(/<\/div>\}/g, '</div>');
  // Remove hideImage property
  cc = cc.replace(/\s*hideImage:\s*true,?\n/g, '\n');
  
  // Make sure second community uses new-beginnings image
  let imgCount = 0;
  cc = cc.replace(/imageSrc:\s*'[^']*'/g, (match) => {
    imgCount++;
    if (imgCount === 1) return "imageSrc: '/Images/cornerstone-campus.jpg'";
    if (imgCount === 2) return "imageSrc: '/Images/new-beginnings.jpg'";
    return match;
  });

  // Make sure the image renders (not commented out, not placeholder)
  // Check if img tag with community.imageSrc exists
  if (!cc.includes('src={community.imageSrc}')) {
    console.log('  WARNING: No img tag found referencing community.imageSrc');
  } else {
    console.log('  Image tag verified: src={community.imageSrc}');
  }

  // Verify no placeholder text remains
  if (cc.includes('Architectural render coming soon')) {
    console.log('  WARNING: Placeholder text still present - removing');
    // Remove entire placeholder block
    cc = cc.replace(/<div className="absolute inset-0[\s\S]*?Architectural render coming soon[\s\S]*?<\/div>\s*<\/div>/g, '');
  }

  // Remove bg-gray-200 from image container (shows gray when image loads)
  cc = cc.replace(/bg-gray-200\s*/g, '');

  fs.writeFileSync(ccFile, cc, 'utf8');
  console.log('  Cornerstone file updated');
  
  // Verify images exist
  const img1 = 'public/Images/cornerstone-campus.jpg';
  const img2 = 'public/Images/new-beginnings.jpg';
  console.log('  ' + img1 + ': ' + (fs.existsSync(img1) ? 'EXISTS (' + Math.round(fs.statSync(img1).size/1024) + 'KB)' : 'MISSING'));
  console.log('  ' + img2 + ': ' + (fs.existsSync(img2) ? 'EXISTS (' + Math.round(fs.statSync(img2).size/1024) + 'KB)' : 'MISSING'));
}

// ─── SUMMARY ─────────────────────────────────────────────────────────
console.log('\n=== SUMMARY ===');
console.log('Corrupted instances found: ' + totalFound);
console.log('Instances fixed: ' + totalFixed);
console.log('Files modified: ' + filesFixed.length);
filesFixed.forEach(f => console.log('  Fixed: ' + f));
console.log('\nDone. Restart dev server: Remove-Item .next -Recurse -Force; pnpm run dev');
