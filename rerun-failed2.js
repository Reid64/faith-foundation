const fs = require("fs");
const https = require("https");
const { execSync } = require("child_process");
const path = require("path");

const INPUT = "foundation-directory-full.csv";
const OUTPUT = "foundations-with-websites.csv";
const ZIP_BASE = "https://apps.irs.gov/pub/epostcard/990/xml/2025";
const TEMP_DIR = path.join(process.cwd(), "temp_990");
const FAILED_BATCHES = ["2025_TEOS_XML_11B", "2025_TEOS_XML_05A"];

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

  console.log("Loading foundation EINs...");
  const raw = fs.readFileSync(INPUT, "utf8");
  const lines = raw.split("\n");
  const headers = lines[0].split(",");
  const einIdx = headers.indexOf("ein");
  const einSet = new Set();
  for (let i = 1; i < lines.length; i++) {
    const ein = (lines[i].split(",")[einIdx] || "").replace(/[^0-9]/g, "");
    if (ein.length >= 8) einSet.add(ein);
  }

  console.log("Loading existing websites...");
  const websites = new Map();
  if (fs.existsSync(OUTPUT)) {
    const existing = fs.readFileSync(OUTPUT, "utf8").split("\n");
    for (let i = 1; i < existing.length; i++) {
      const cols = existing[i].split(",");
      const ein = (cols[0] || "").replace(/[^0-9]/g, "");
      const ws = (cols[cols.length - 1] || "").trim();
      if (ein && ws) websites.set(ein, ws);
    }
  }
  console.log("Existing websites: " + websites.size + "\n");

  for (const batch of FAILED_BATCHES) {
    const zipUrl = ZIP_BASE + "/" + batch + ".zip";
    const zipPath = path.join(TEMP_DIR, batch + ".zip");
    const extractDir = path.join(TEMP_DIR, batch);

    console.log(batch);
    if (!fs.existsSync(zipPath)) {
      process.stdout.write("  Downloading...");
      const ok = await downloadToFile(zipUrl, zipPath);
      if (!ok) { console.log(" FAILED"); continue; }
      console.log(" done (" + Math.round(fs.statSync(zipPath).size / 1024 / 1024) + " MB)");
    } else {
      console.log("  ZIP cached");
    }

    process.stdout.write("  Extracting...");
    try {
      if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
      fs.mkdirSync(extractDir, { recursive: true });
      execSync('powershell -Command "Expand-Archive -Path \'' + zipPath + '\' -DestinationPath \'' + extractDir + '\' -Force"', { stdio: "pipe", timeout: 900000 });
      console.log(" done");
    } catch (e) { console.log(" FAILED"); continue; }

    // Scan ALL XMLs and match by EIN inside the XML
    process.stdout.write("  Scanning all XMLs by EIN content...");
    let batchFound = 0;
    let scanned = 0;
    function scanDir(dir) {
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const full = path.join(dir, item);
          if (fs.statSync(full).isDirectory()) { scanDir(full); continue; }
          if (!item.endsWith(".xml")) continue;
          scanned++;
          try {
            const xml = fs.readFileSync(full, "utf8");
            const einMatch = xml.match(/<EIN>(\d+)<\/EIN>/i);
            if (!einMatch) continue;
            const ein = einMatch[1].trim();
            if (!einSet.has(ein)) continue;
            if (websites.has(ein)) continue;
            const wsMatch = xml.match(/<WebsiteAddressTxt>([^<]+)<\/WebsiteAddressTxt>/i) || xml.match(/<WebSiteURL>([^<]+)<\/WebSiteURL>/i) || xml.match(/<WebsiteAddress>([^<]+)<\/WebsiteAddress>/i);
            if (wsMatch) { websites.set(ein, wsMatch[1].trim()); batchFound++; }
          } catch {}
          if (scanned % 5000 === 0) process.stdout.write(" " + scanned + "...");
        }
      } catch {}
    }
    scanDir(extractDir);
    console.log("\n  Scanned " + scanned + " XMLs, found " + batchFound + " new websites (total: " + websites.size + ")");

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
  console.log("Total websites: " + websites.size);
})();
