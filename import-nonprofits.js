const fs = require("fs");
const https = require("https");

const OUTPUT = "nonprofit-leads-501c3.csv";
const BMF_BASE = "https://www.irs.gov/pub/irs-soi";
const STATES = ["al","ak","az","ar","ca","co","ct","de","fl","ga","hi","id","il","in","ia","ks","ky","la","me","md","ma","mi","mn","ms","mo","mt","ne","nv","nh","nj","nm","ny","nc","nd","oh","ok","or","pa","ri","sc","sd","tn","tx","ut","vt","va","wa","wv","wi","wy","dc","pr"];
const HEADERS = ["EIN","NAME","ICO","STREET","CITY","STATE","ZIP","GROUP","SUBSECTION","AFFILIATION","CLASSIFICATION","RULING","DEDUCTIBILITY","FOUNDATION","ACTIVITY","ORGANIZATION","STATUS","TAX_PERIOD","ASSET_CD","INCOME_CD","FILING_REQD_CD","PF_FILING_REQD_CD","ACCT_PD","ASSET_AMT","INCOME_AMT","REVENUE_AMT","NTEE_CD","SORT_NAME"];
const MIN_REV = 100000;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

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

function download(url) {
  return new Promise((resolve, reject) => {
    const doGet = (u) => {
      https.get(u, r => {
        if (r.statusCode === 301 || r.statusCode === 302) return doGet(r.headers.location);
        if (r.statusCode === 404) return resolve(null);
        if (r.statusCode !== 200) return reject(new Error("HTTP " + r.statusCode));
        let body = "";
        r.on("data", c => body += c);
        r.on("end", () => resolve(body));
      }).on("error", reject);
    };
    doGet(url);
  });
}

function parseLine(line) {
  const row = {};
  const vals = parseCSVLine(line);
  HEADERS.forEach((h, i) => row[h] = (vals[i] || "").trim());
  return row;
}

function isTargetNonprofit(row) {
  const sub = (row.SUBSECTION || "").trim();
  if (sub !== "3" && sub !== "03") return false;
  const foundation = (row.FOUNDATION || "").trim().padStart(2, "0");
  if (foundation === "02" || foundation === "04") return false;
  const rev = parseFloat(row.REVENUE_AMT || "0");
  if (rev < MIN_REV) return false;
  return true;
}

(async () => {
  const outHeaders = "ein,name,street,city,state,zip,ntee_code,revenue,assets,ruling_date";
  const lines = [outHeaders];
  let total = 0;

  console.log("Importing ALL 501(c)(3) nonprofits from IRS BMF...");
  console.log("Minimum revenue: $" + MIN_REV.toLocaleString());
  console.log("No NTEE filter, no revenue cap\n");

  for (let si = 0; si < STATES.length; si++) {
    const st = STATES[si];
    const url = BMF_BASE + "/eo_" + st + ".csv";
    process.stdout.write("(" + (si+1) + "/" + STATES.length + ") " + st.toUpperCase() + "...");
    const csv = await download(url);
    if (!csv) { console.log(" skipped (404)"); continue; }
    const rows = csv.split("\n");
    let count = 0;
    for (const row of rows) {
      if (!row.trim()) continue;
      const parsed = parseLine(row);
      if (!isTargetNonprofit(parsed)) continue;
      const rev = parseFloat(parsed.REVENUE_AMT || "0");
      const assets = parseFloat(parsed.ASSET_AMT || "0");
      const wrap = v => String(v).includes(",") ? '"' + v + '"' : v;
      lines.push([parsed.EIN, wrap(parsed.NAME), wrap(parsed.STREET), wrap(parsed.CITY), parsed.STATE, parsed.ZIP, parsed.NTEE_CD, rev, assets, parsed.RULING].join(","));
      count++;
    }
    total += count;
    console.log(" " + count + " nonprofits (total: " + total + ")");
    await sleep(500);
  }

  fs.writeFileSync(OUTPUT, lines.join("\n"));
  console.log("\n=== COMPLETE ===");
  console.log("Total nonprofits: " + total);
  console.log("Output: " + OUTPUT);
})();
