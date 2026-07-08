const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const TEMP_DIR = path.join(process.cwd(), "temp_990");
const ZIP = path.join(TEMP_DIR, "2025_TEOS_XML_11B.zip");
const EXTRACT = path.join(TEMP_DIR, "peek");

if (!fs.existsSync(EXTRACT)) fs.mkdirSync(EXTRACT, { recursive: true });
console.log("Extracting first few files...");
execSync('powershell -Command "Expand-Archive -Path \'' + ZIP + '\' -DestinationPath \'' + EXTRACT + '\' -Force"', { stdio: "pipe", timeout: 900000 });

function listFiles(dir, depth) {
  if (depth > 3) return;
  const items = fs.readdirSync(dir);
  let count = 0;
  for (const item of items) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      console.log("  DIR: " + item);
      listFiles(full, depth + 1);
    } else {
      if (count < 5) console.log("  FILE: " + item + " (" + Math.round(fs.statSync(full).size / 1024) + " KB)");
      count++;
    }
  }
  console.log("  ... " + count + " total files in " + dir);
}

listFiles(EXTRACT, 0);

// Show expected OBJECT_IDs for comparison
const indexCsv = fs.readFileSync(path.join(TEMP_DIR, "index_2025.csv"), "utf8");
const lines = indexCsv.split("\n");
let shown = 0;
for (const line of lines) {
  if (line.includes("2025_TEOS_XML_11B") && shown < 5) {
    const cols = line.split(",");
    console.log("Expected OBJECT_ID: " + cols[8]);
    shown++;
  }
}
