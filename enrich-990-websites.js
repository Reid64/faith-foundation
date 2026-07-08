const fs = require("fs");
const https = require("https");

const INPUT = "foundation-directory-full.csv";
const OUTPUT = "foundations-with-websites.csv";
const DELAY_MS = 500;
const INDEX_URL = "https://s3.amazonaws.com/irs-form-990/index_2023.csv";

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function download(url) {
  return new Promise((resolve, reject) => {
    const doGet = (u) => {
      https.get(u, r => {
        if (r.statusCode === 301 || r.statusCode === 302) return doGet(r.headers.location);
        if (r.statusCode !== 200) return resolve(null);
        let body = "";
        r.on("data", c => body += c);
        r.on("end", () => resolve(body));
      }).on("error", reject);
    };
    doGet(url);
  });
}

(async () => {
  console.log("Step 1: Loading foundation EINs...");
  const raw = fs.readFileSync(INPUT, "utf8");
  const lines = raw.split("\n");
  const headers = lines[0].split(",");
  const einIdx = headers.indexOf("ein");
  const einSet = new Set();
  for (let i = 1; i < lines.length; i++) {
    const ein = (lines[i].split(",")[einIdx] || "").replace(/[^0-9]/g, "");
    if (ein.length >= 8) einSet.add(ein);
  }
  console.log("Loaded " + einSet.size + " EINs\n");

  console.log("Step 2: Downloading IRS 990 e-file index (large file, may take a few minutes)...");
  const indexCsv = await download(INDEX_URL);
  if (!indexCsv) { console.error("Failed to download index. Try index_2023.csv instead."); process.exit(1); }

  const indexLines = indexCsv.split("\n");
  const idxHeaders = indexLines[0].split(",");
  const einCol = idxHeaders.indexOf("EIN");
  const objCol = idxHeaders.indexOf("OBJECT_ID");

  console.log("Index has " + (indexLines.length - 1) + " filings");

  const einToObj = new Map();
  for (let i = 1; i < indexLines.length; i++) {
    const cols = indexLines[i].split(",");
    const ein = (cols[einCol] || "").trim();
    if (einSet.has(ein) && !einToObj.has(ein)) {
      einToObj.set(ein, (cols[objCol] || "").trim());
    }
  }
  console.log("Matched " + einToObj.size + " of " + einSet.size + " foundations\n");

  console.log("Step 3: Downloading XMLs and extracting websites...");
  const websites = new Map();
  let processed = 0;
  let found = 0;

  for (const [ein, objId] of einToObj) {
    if (!objId) continue;
    const xml = await download("https://s3.amazonaws.com/irs-form-990/" + objId + "_public.xml");
    processed++;
    if (xml) {
      const match = xml.match(/<WebsiteAddressTxt>([^<]+)<\/WebsiteAddressTxt>/i) ||
                    xml.match(/<WebSiteURL>([^<]+)<\/WebSiteURL>/i) ||
                    xml.match(/<WebsiteAddress>([^<]+)<\/WebsiteAddress>/i);
      if (match) { websites.set(ein, match[1].trim()); found++; }
    }
    if (processed % 100 === 0) {
      console.log("[" + processed + "/" + einToObj.size + "] Websites found: " + found);
      const outLines = [headers.join(",") + ",website_990"];
      for (let i = 1; i < lines.length; i++) {
        const e = (lines[i].split(",")[einIdx] || "").replace(/[^0-9]/g, "");
        outLines.push(lines[i] + "," + (websites.get(e) || ""));
      }
      fs.writeFileSync(OUTPUT, outLines.join("\n"));
    }
    await sleep(DELAY_MS);
  }

  const outLines = [headers.join(",") + ",website_990"];
  for (let i = 1; i < lines.length; i++) {
    const e = (lines[i].split(",")[einIdx] || "").replace(/[^0-9]/g, "");
    outLines.push(lines[i] + "," + (websites.get(e) || ""));
  }
  fs.writeFileSync(OUTPUT, outLines.join("\n"));
  console.log("\n=== COMPLETE ===");
  console.log("Processed: " + processed);
  console.log("Websites found: " + found);
  console.log("Output: " + OUTPUT);
})();
