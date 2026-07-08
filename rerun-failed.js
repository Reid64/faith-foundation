const fs = require("fs");
const https = require("https");
const { execSync } = require("child_process");
const path = require("path");

const INPUT = "foundation-directory-full.csv";
const OUTPUT = "foundations-with-websites.csv";
const ZIP_BASE = "https://apps.irs.gov/pub/epostcard/990/xml/2025";
const TEMP_DIR = path.join(process.cwd(), "temp_990");
const FAILED_BATCHES = ["2025_TEOS_XML_11B", "2025_TEOS_XML_05A"];

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
  console.log("Loading existing websites from previous run...");
  const outRaw = fs.readFileSync(OUTPUT, "utf8");
  const outLines = outRaw.split("\n");
  const outHeaders = outLines[0].split(",");
  const wsIdx = outHeaders.indexOf("website_990");
  const einIdx2 = outHeaders.indexOf("ein");
  const websites = new Map();
  for (let i = 1; i < outLines.length; i++) {
    const cols = outLines[i].split(",");
    const ein = (cols[einIdx2] || "").replace(/[^0-9]/g, "");
    const ws = (cols[cols.length - 1] || "").trim();
    if (ein && ws) websites.set(ein, ws);
  }
  console.log("Loaded " + websites.size + " existing websites\n");

  console.log("Loading index to find failed batch entries...");
  const indexPath = path.join(TEMP_DIR, "index_2025.csv");
  const indexCsv = fs.readFileSync(indexPath, "utf8");
  const indexLines = indexCsv.split("\n");

  const raw = fs.readFileSync(INPUT, "utf8");
  const lines = raw.split("\n");
  const headers = lines[0].split(",");
  const einIdx = headers.indexOf("ein");
  const einSet = new Set();
  for (let i = 1; i < lines.length; i++) {
    const ein = (lines[i].split(",")[einIdx] || "").replace(/[^0-9]/g, "");
    if (ein.length >= 8) einSet.add(ein);
  }

  const batchToEins = new Map();
  const einToObj = new Map();
  for (let i = 1; i < indexLines.length; i++) {
    if (!indexLines[i].trim()) continue;
    const cols = parseCSVLine(indexLines[i]);
    const ein = (cols[2] || "").trim();
    const objId = (cols[8] || "").trim();
    const batch = (cols[9] || "").trim();
    if (einSet.has(ein) && !einToObj.has(ein) && FAILED_BATCHES.includes(batch)) {
      einToObj.set(ein, objId);
      if (!batchToEins.has(batch)) batchToEins.set(batch, []);
      batchToEins.get(batch).push({ ein, objId });
    }
  }

  for (const [batch, entries] of batchToEins) {
    const zipUrl = ZIP_BASE + "/" + batch + ".zip";
    const zipPath = path.join(TEMP_DIR, batch + ".zip");
    const extractDir = path.join(TEMP_DIR, batch);
    console.log("\n" + batch + " (" + entries.length + " foundations)");
    if (!fs.existsSync(zipPath)) {
      process.stdout.write("  Downloading ZIP...");
      const ok = await downloadToFile(zipUrl, zipPath);
      if (!ok) { console.log(" FAILED"); continue; }
      console.log(" done (" + Math.round(fs.statSync(zipPath).size / 1024 / 1024) + " MB)");
    } else {
      console.log("  ZIP cached (" + Math.round(fs.statSync(zipPath).size / 1024 / 1024) + " MB)");
    }
    process.stdout.write("  Extracting (PowerShell, may take a few minutes)...");
    try {
      if (!fs.existsSync(extractDir)) fs.mkdirSync(extractDir, { recursive: true });
      execSync('powershell -Command "Expand-Archive -Path \'' + zipPath + '\' -DestinationPath \'' + extractDir + '\' -Force"', { stdio: "pipe", timeout: 900000 });
      console.log(" done");
    } catch (e) { console.log(" FAILED: " + e.message.substring(0, 100)); continue; }
    process.stdout.write("  Scanning XMLs...");
    let batchFound = 0;
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
  }

  const finalLines = [headers.join(",") + ",website_990"];
  for (let i = 1; i < lines.length; i++) {
    const e = (lines[i].split(",")[einIdx] || "").replace(/[^0-9]/g, "");
    finalLines.push(lines[i] + "," + (websites.get(e) || ""));
  }
  fs.writeFileSync(OUTPUT, finalLines.join("\n"));
  console.log("\n=== COMPLETE ===");
  console.log("Total websites now: " + websites.size);
})();
