const fs = require("fs");
const https = require("https");
const { execSync } = require("child_process");
const path = require("path");

const INPUT = "foundation-directory-full.csv";
const OUTPUT = "foundations-with-websites.csv";
const ZIP_BASE = "https://apps.irs.gov/pub/epostcard/990/xml/2025";
const TEMP_DIR = path.join(process.cwd(), "temp_990");
const BATCHES = ["2025_TEOS_XML_11B", "2025_TEOS_XML_05A"];

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

  const raw = fs.readFileSync(INPUT, "utf8");
  const lines = raw.split("\n");
  const headers = lines[0].split(",");
  const einIdx = headers.indexOf("ein");
  const einSet = new Set();
  for (let i = 1; i < lines.length; i++) {
    const ein = (lines[i].split(",")[einIdx] || "").replace(/[^0-9]/g, "");
    if (ein.length >= 8) einSet.add(ein);
  }

  const websites = new Map();
  if (fs.existsSync(OUTPUT)) {
    const ex = fs.readFileSync(OUTPUT, "utf8").split("\n");
    for (let i = 1; i < ex.length; i++) {
      const cols = ex[i].split(",");
      const ein = (cols[0] || "").replace(/[^0-9]/g, "");
      const ws = (cols[cols.length - 1] || "").trim();
      if (ein && ws) websites.set(ein, ws);
    }
  }
  console.log("Existing websites: " + websites.size + "\n");

  for (const batch of BATCHES) {
    const zipUrl = ZIP_BASE + "/" + batch + ".zip";
    const zipPath = path.join(TEMP_DIR, batch + ".zip");
    const extractDir = path.join(TEMP_DIR, batch);

    console.log("=== " + batch + " ===");

    if (!fs.existsSync(zipPath)) {
      process.stdout.write("Downloading...");
      const ok = await downloadToFile(zipUrl, zipPath);
      if (!ok) { console.log(" FAILED"); continue; }
      console.log(" done (" + Math.round(fs.statSync(zipPath).size / 1024 / 1024) + " MB)");
    }

    if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
    fs.mkdirSync(extractDir, { recursive: true });

    // Use tar first, then Expand-Archive as fallback
    process.stdout.write("Extracting with tar...");
    let extracted = false;
    try {
      execSync('tar -xf "' + zipPath + '" -C "' + extractDir + '"', { stdio: "pipe", timeout: 900000 });
      extracted = true;
      console.log(" done");
    } catch {
      console.log(" tar failed, trying Expand-Archive...");
      try {
        execSync('powershell -Command "Expand-Archive -LiteralPath \'' + zipPath + '\' -DestinationPath \'' + extractDir + '\' -Force"', { stdio: "pipe", timeout: 900000 });
        extracted = true;
        console.log("  done");
      } catch (e2) { console.log("  BOTH FAILED"); continue; }
    }

    // Show directory structure
    console.log("Directory structure:");
    function showDir(dir, prefix) {
      const items = fs.readdirSync(dir);
      let xmlCount = 0;
      for (const item of items) {
        const full = path.join(dir, item);
        if (fs.statSync(full).isDirectory()) {
          console.log(prefix + "DIR: " + item + "/");
          showDir(full, prefix + "  ");
        } else if (item.endsWith(".xml")) {
          xmlCount++;
          if (xmlCount <= 2) console.log(prefix + "XML: " + item);
        }
      }
      if (xmlCount > 2) console.log(prefix + "... " + xmlCount + " XMLs total");
      if (xmlCount === 0) console.log(prefix + "(no XMLs, " + items.length + " files)");
    }
    showDir(extractDir, "  ");

    // Scan ALL XMLs recursively, match by EIN in content
    console.log("\nScanning...");
    let scanned = 0;
    let batchFound = 0;
    function scanAll(dir) {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const full = path.join(dir, item);
        if (fs.statSync(full).isDirectory()) { scanAll(full); continue; }
        if (!item.endsWith(".xml")) continue;
        scanned++;
        try {
          const xml = fs.readFileSync(full, "utf8");
          const einMatch = xml.match(/<EIN>(\d+)<\/EIN>/i);
          if (!einMatch) continue;
          const ein = einMatch[1];
          if (!einSet.has(ein) || websites.has(ein)) continue;
          const wsMatch = xml.match(/<WebsiteAddressTxt>([^<]+)<\/WebsiteAddressTxt>/i) || xml.match(/<WebSiteURL>([^<]+)<\/WebSiteURL>/i) || xml.match(/<WebsiteAddress>([^<]+)<\/WebsiteAddress>/i);
          if (wsMatch) { websites.set(ein, wsMatch[1].trim()); batchFound++; }
        } catch {}
        if (scanned % 5000 === 0) console.log("  scanned " + scanned + " XMLs, " + batchFound + " new websites...");
      }
    }
    scanAll(extractDir);
    console.log("Batch done: scanned " + scanned + " XMLs, found " + batchFound + " new websites (total: " + websites.size + ")\n");

    fs.rmSync(extractDir, { recursive: true, force: true });
    // Keep ZIP this time - don't delete
  }

  const outLines = [headers.join(",") + ",website_990"];
  for (let i = 1; i < lines.length; i++) {
    const e = (lines[i].split(",")[einIdx] || "").replace(/[^0-9]/g, "");
    outLines.push(lines[i] + "," + (websites.get(e) || ""));
  }
  fs.writeFileSync(OUTPUT, outLines.join("\n"));
  console.log("=== FINAL ===");
  console.log("Total websites: " + websites.size);
  console.log("Output: " + OUTPUT);
})();
