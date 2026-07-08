const fs = require("fs");
const https = require("https");
const { execSync } = require("child_process");
const path = require("path");

const INPUT = "foundation-directory-full.csv";
const OUTPUT = "foundations-with-websites.csv";
const INDEX_URL = "https://apps.irs.gov/pub/epostcard/990/xml/2025/index_2025.csv";
const ZIP_BASE = "https://apps.irs.gov/pub/epostcard/990/xml/2025";
const TEMP_DIR = path.join(process.cwd(), "temp_990");

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line.charAt(i);
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line.charAt(i + 1) === '"') { current += '"'; i++; }
        else { inQuotes = false; }
      } else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { result.push(current); current = ""; }
      else { current += ch; }
    }
  }
  result.push(current);
  return result;
}

function downloadToFile(url, dest) {
  return new Promise((resolve, reject) => {
    const doGet = (u) => {
      https.get(u, r => {
        if (r.statusCode === 301 || r.statusCode === 302) return doGet(r.headers.location);
        if (r.statusCode !== 200) return resolve(false);
        const ws = fs.createWriteStream(dest);
        r.pipe(ws);
        ws.on("finish", () => { ws.close(); resolve(true); });
      }).on("error", reject);
    };
    doGet(url);
  });
}

(async () => {
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
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

  console.log("Step 2: Downloading IRS 990 index...");
  const indexPath = path.join(TEMP_DIR, "index_2025.csv");
  if (!fs.existsSync(indexPath)) {
    const ok = await downloadToFile(INDEX_URL, indexPath);
    if (!ok) { console.error("Failed to download index"); process.exit(1); }
  }
  console.log("Index downloaded.\n");

  console.log("Step 3: Matching EINs to XML batches...");
  const indexCsv = fs.readFileSync(indexPath, "utf8");
  const indexLines = indexCsv.split("\n");
  const idxHeaders = parseCSVLine(indexLines[0]);
  const einCol = 2;
  const objCol = 8;
  const batchCol = 9;
  console.log("Index columns: EIN=" + einCol + " OBJECT_ID=" + objCol + " BATCH=" + batchCol);

  const batchToEins = new Map();
  const einToObj = new Map();
  let matched = 0;
  for (let i = 1; i < indexLines.length; i++) {
    if (!indexLines[i].trim()) continue;
    const cols = parseCSVLine(indexLines[i]);
    const ein = (cols[einCol] || "").trim();
    if (einSet.has(ein) && !einToObj.has(ein)) {
      const objId = (cols[objCol] || "").trim();
      const batch = (cols[batchCol] || "").trim();
      if (!batch) continue;
      einToObj.set(ein, objId);
      matched++;
      if (!batchToEins.has(batch)) batchToEins.set(batch, []);
      batchToEins.get(batch).push({ ein, objId });
    }
  }
  console.log("Matched " + matched + " foundations across " + batchToEins.size + " ZIP batches\n");

  console.log("Step 4: Processing ZIP batches...");
  const websites = new Map();
  let batchNum = 0;
  const totalBatches = batchToEins.size;
  for (const [batch, entries] of batchToEins) {
    batchNum++;
    const zipUrl = ZIP_BASE + "/" + batch + ".zip";
    const zipPath = path.join(TEMP_DIR, batch + ".zip");
    const extractDir = path.join(TEMP_DIR, batch);
    console.log("\n[" + batchNum + "/" + totalBatches + "] " + batch + " (" + entries.length + " foundations)");
    if (!fs.existsSync(zipPath)) {
      process.stdout.write("  Downloading ZIP...");
      const ok = await downloadToFile(zipUrl, zipPath);
      if (!ok) { console.log(" FAILED"); continue; }
      console.log(" done (" + Math.round(fs.statSync(zipPath).size / 1024 / 1024) + " MB)");
    } else {
      console.log("  ZIP cached (" + Math.round(fs.statSync(zipPath).size / 1024 / 1024) + " MB)");
    }
    process.stdout.write("  Extracting...");
    try {
      if (!fs.existsSync(extractDir)) fs.mkdirSync(extractDir, { recursive: true });
      execSync('tar -xf "' + zipPath + '" -C "' + extractDir + '"', { stdio: "pipe", timeout: 600000 });
      console.log(" done");
    } catch (e) { console.log(" FAILED"); continue; }
    process.stdout.write("  Scanning XMLs...");
    let batchFound = 0;
    const objIdSet = new Set(entries.map(e => e.objId));
    function scanDir(dir) {
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const full = path.join(dir, item);
          if (fs.statSync(full).isDirectory()) { scanDir(full); continue; }
          if (!item.endsWith(".xml")) continue;
          const entry = entries.find(e => item.includes(e.objId));
          if (!entry) continue;
          try {
            const xml = fs.readFileSync(full, "utf8");
            const match = xml.match(/<WebsiteAddressTxt>([^<]+)<\/WebsiteAddressTxt>/i) || xml.match(/<WebSiteURL>([^<]+)<\/WebSiteURL>/i) || xml.match(/<WebsiteAddress>([^<]+)<\/WebsiteAddress>/i);
            if (match) { websites.set(entry.ein, match[1].trim()); batchFound++; }
          } catch {}
        }
      } catch {}
    }
    scanDir(extractDir);
    console.log(" found " + batchFound + " websites (total: " + websites.size + ")");
    try { fs.rmSync(extractDir, { recursive: true, force: true }); } catch {}
    try { fs.unlinkSync(zipPath); } catch {}
    const outLines = [headers.join(",") + ",website_990"];
    for (let i = 1; i < lines.length; i++) {
      const e = (lines[i].split(",")[einIdx] || "").replace(/[^0-9]/g, "");
      outLines.push(lines[i] + "," + (websites.get(e) || ""));
    }
    fs.writeFileSync(OUTPUT, outLines.join("\n"));
  }
  console.log("\n=== COMPLETE ===");
  console.log("Matched: " + matched);
  console.log("Websites found: " + websites.size);
  console.log("Output: " + OUTPUT);
})();
