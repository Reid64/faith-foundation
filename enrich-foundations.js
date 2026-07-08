const fs = require("fs");
const https = require("https");
const path = require("path");

const INPUT = "foundation-directory-full.csv";
const OUTPUT = "foundation-directory-enriched.csv";
const DELAY_MS = 1200; // ProPublica rate limit: ~50 req/min

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Benavora-Enrichment/1.0" } }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => resolve({ status: res.statusCode, body }));
    }).on("error", reject);
  });
}

async function enrichEIN(ein) {
  try {
    const { status, body } = await fetch(`https://projects.propublica.org/nonprofits/api/v2/organizations/${ein}.json`);
    if (status !== 200) return null;
    const data = JSON.parse(body);
    const org = data.organization || {};
    const filing = (data.filings_with_data || [])[0] || {};
    const officers = (filing.officers || []).map(o => o.name).filter(Boolean).join("; ");
    return {
      website: org.website || "",
      officers: officers,
      total_revenue: org.total_revenue || "",
      total_assets: org.total_assets || "",
    };
  } catch { return null; }
}

(async () => {
  const raw = fs.readFileSync(INPUT, "utf8");
  const lines = raw.split("\n");
  const headers = lines[0].split(",");
  const einIdx = headers.indexOf("ein");
  if (einIdx === -1) { console.error("No 'ein' column found"); process.exit(1); }

  const enrichedHeaders = [...headers.map(h => h.trim()), "pp_website", "pp_officers", "pp_total_revenue", "pp_total_assets"];
  const outLines = [enrichedHeaders.join(",")];
  
  const total = lines.length - 1;
  let enriched = 0;
  let found = 0;

  console.log("Enriching " + total + " records via ProPublica API...");
  console.log("Estimated time: " + Math.round(total * DELAY_MS / 1000 / 60) + " minutes");

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = lines[i].split(",");
    const ein = (cols[einIdx] || "").replace(/[^0-9]/g, "");
    if (!ein || ein.length < 8) {
      outLines.push(lines[i] + ",,,,");
      continue;
    }

    const result = await enrichEIN(ein);
    enriched++;

    if (result && (result.website || result.officers)) {
      found++;
      const wrap = v => String(v).includes(",") ? '"' + v + '"' : v;
      outLines.push(lines[i] + "," + wrap(result.website) + "," + wrap(result.officers) + "," + result.total_revenue + "," + result.total_assets);
    } else {
      outLines.push(lines[i] + ",,,,");
    }

    if (enriched % 100 === 0) {
      console.log("[" + enriched + "/" + total + "] " + found + " enriched so far. Saving checkpoint...");
      fs.writeFileSync(OUTPUT, outLines.join("\n"));
    }

    await sleep(DELAY_MS);
  }

  fs.writeFileSync(OUTPUT, outLines.join("\n"));
  console.log("\n=== COMPLETE ===");
  console.log("Total processed: " + enriched);
  console.log("Total enriched: " + found);
  console.log("Output: " + OUTPUT);
  process.exit(0);
})();
