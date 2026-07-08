const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");
const TEMP_DIR = path.join(process.cwd(), "temp_990");
const ZIP = path.join(TEMP_DIR, "2025_TEOS_XML_05A.zip");
const EXTRACT = path.join(TEMP_DIR, "peek");
if (fs.existsSync(EXTRACT)) fs.rmSync(EXTRACT, { recursive: true, force: true });
fs.mkdirSync(EXTRACT, { recursive: true });
console.log("Extracting...");
execSync('powershell -Command "Expand-Archive -Path \'' + ZIP + '\' -DestinationPath \'' + EXTRACT + '\' -Force"', { stdio: "pipe", timeout: 900000 });
function listDir(dir, depth) {
  if (depth > 4) return;
  const items = fs.readdirSync(dir);
  let xmlCount = 0;
  let otherCount = 0;
  for (let i = 0; i < items.length; i++) {
    const full = path.join(dir, items[i]);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      console.log("  ".repeat(depth) + "DIR: " + items[i]);
      listDir(full, depth + 1);
    } else if (items[i].endsWith(".xml")) {
      xmlCount++;
      if (xmlCount <= 3) console.log("  ".repeat(depth) + "XML: " + items[i] + " (" + Math.round(stat.size/1024) + " KB)");
    } else {
      otherCount++;
      if (otherCount <= 3) console.log("  ".repeat(depth) + "OTHER: " + items[i] + " (" + Math.round(stat.size/1024) + " KB)");
    }
  }
  if (xmlCount > 3) console.log("  ".repeat(depth) + "... " + xmlCount + " total XMLs");
  if (otherCount > 3) console.log("  ".repeat(depth) + "... " + otherCount + " total other files");
}
listDir(EXTRACT, 0);
