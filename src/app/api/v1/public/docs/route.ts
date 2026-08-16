/**
 * GET /api/v1/public/docs
 *
 * HTML documentation for the public API. A route handler rather than a page so
 * the whole API namespace lives in one place, and so it carries `noindex` — it
 * is developer documentation, not a marketing page competing in search.
 */
export const dynamic = "force-dynamic";

const BASE = "https://www.faithfoundationsf.org/api/v1/public";

type Endpoint = {
  path: string;
  summary: string;
  params?: [string, string][];
  example: string;
};

const ENDPOINTS: Endpoint[] = [
  {
    path: "/stats",
    summary:
      "Headline transparency figures — the same numbers shown on the FaithProof page.",
    example: `{
  "data": {
    "total_donations_cents": 20000,
    "total_donations_formatted": "$200.00",
    "vouchers_disbursed": 0,
    "promises_kept": 0,
    "overhead_rate": 0,
    "program_rate": 0
  },
  "meta": { "generated_at": "2026-08-16T00:00:00.000Z" }
}`,
  },
  {
    path: "/transactions",
    summary:
      "Confirmed, publicly flagged transactions. Donor names are never included.",
    params: [
      ["page", "Page number. Default 1."],
      ["per_page", "Rows per page. Default 20, maximum 100."],
      ["fund", "Fund designation, e.g. housing_voucher."],
      ["type", "donation, grant, expense, voucher_disbursement, operational."],
      ["date_from", "YYYY-MM-DD, inclusive."],
      ["date_to", "YYYY-MM-DD, inclusive."],
    ],
    example: `{
  "data": [
    {
      "id": "…",
      "date": "2026-08-01",
      "type": "donation",
      "fund": "housing_voucher",
      "amount_cents": 20000,
      "amount_formatted": "$200.00",
      "description": "ACH gift"
    }
  ],
  "meta": { "total": 1, "page": 1, "per_page": 20, "total_pages": 1 }
}`,
  },
  {
    path: "/promises",
    summary: "Public promises with their status and proof link.",
    params: [
      ["page", "Page number. Default 1."],
      ["per_page", "Rows per page. Default 20, maximum 100."],
      ["status", "active, in_progress, fulfilled, missed, revised."],
    ],
    example: `{
  "data": [
    {
      "id": "…",
      "title": "Publish our first annual impact summary",
      "status": "active",
      "target_date": "2026-11-24",
      "fulfilled_date": null,
      "proof_url": null
    }
  ],
  "meta": { "total": 1, "page": 1, "per_page": 20, "total_pages": 1 }
}`,
  },
  {
    path: "/documents",
    summary:
      "Verified public documents. Internal storage paths are never returned — follow external_url.",
    example: `{
  "data": [
    {
      "id": "…",
      "title": "IRS Determination Letter",
      "type": "irs_determination",
      "external_url": "https://…",
      "verified": true,
      "verified_at": "2026-08-01T00:00:00.000Z"
    }
  ],
  "meta": { "total": 1 }
}`,
  },
  {
    path: "/funds",
    summary:
      "Money in and out per fund, from the public ledger only. Not a complete accounting balance.",
    example: `{
  "data": [
    {
      "fund": "housing_voucher",
      "label": "Housing Voucher",
      "total_in_cents": 20000,
      "total_in_formatted": "$200.00",
      "total_out_cents": 0,
      "total_out_formatted": "$0.00",
      "balance_cents": 20000,
      "balance_formatted": "$200.00",
      "share_of_giving_pct": 100
    }
  ],
  "meta": { "total_in_cents": 20000 }
}`,
  },
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function section(e: Endpoint): string {
  const params = e.params
    ? `<table>
        <thead><tr><th>Parameter</th><th>Meaning</th></tr></thead>
        <tbody>${e.params
          .map(
            ([name, meaning]) =>
              `<tr><td><code>${escapeHtml(name)}</code></td><td>${escapeHtml(meaning)}</td></tr>`
          )
          .join("")}</tbody>
      </table>`
    : `<p class="muted">No query parameters.</p>`;

  return `<section id="${escapeHtml(e.path.slice(1))}">
    <h2><span class="verb">GET</span> <code>${escapeHtml(e.path)}</code></h2>
    <p>${escapeHtml(e.summary)}</p>
    ${params}
    <h3>Example response</h3>
    <pre>${escapeHtml(e.example)}</pre>
    <p class="try"><a href="${escapeHtml(BASE + e.path)}">Try it →</a></p>
  </section>`;
}

const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, follow">
<title>FAITH Foundation Public API — v1</title>
<style>
  :root { --navy:#16243F; --gold:#C9A227; --cream:#FAF8F1; --ink:#16243F; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--cream); color:var(--ink);
         font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
         line-height:1.6; }
  .wrap { max-width: 52rem; margin: 0 auto; padding: 3rem 1.25rem 5rem; }
  header { border-bottom: 3px solid var(--gold); padding-bottom: 1.5rem; margin-bottom: 2rem; }
  h1 { font-size: 2rem; margin: 0 0 .5rem; }
  h2 { font-size: 1.15rem; margin: 0 0 .5rem; }
  h3 { font-size: .8rem; text-transform: uppercase; letter-spacing:.08em;
       color: rgba(22,36,63,.6); margin: 1.25rem 0 .5rem; }
  .lede { font-size: 1.05rem; color: rgba(22,36,63,.75); margin: 0; }
  section { background:#fff; border:1px solid rgba(22,36,63,.1); border-radius:14px;
            padding: 1.5rem; margin-bottom: 1.25rem; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .9em;
         background: rgba(22,36,63,.06); padding: .1rem .35rem; border-radius: 4px; }
  pre { background: var(--navy); color: #eef2f7; padding: 1rem; border-radius: 10px;
        overflow-x: auto; font-size: .82rem; line-height:1.5; }
  pre code { background: none; padding: 0; }
  .verb { display:inline-block; background: var(--navy); color: var(--cream);
          font-size:.7rem; font-weight:700; letter-spacing:.1em; padding:.15rem .45rem;
          border-radius:4px; vertical-align: middle; }
  table { width:100%; border-collapse: collapse; margin-top:.5rem; }
  th, td { text-align:left; padding:.45rem .5rem; border-bottom:1px solid rgba(22,36,63,.08);
           font-size:.9rem; vertical-align: top; }
  th { font-size:.72rem; text-transform:uppercase; letter-spacing:.08em; color:rgba(22,36,63,.55); }
  .muted { color: rgba(22,36,63,.55); font-size:.9rem; }
  .note { background:#fff; border-left:5px solid var(--gold); border-radius:10px;
          padding:1.25rem 1.5rem; margin-bottom:1.25rem; }
  a { color: var(--navy); }
  .try a { font-weight:600; text-decoration: none; border-bottom:2px solid var(--gold); }
  footer { margin-top:2.5rem; font-size:.85rem; color:rgba(22,36,63,.55); }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>FAITH Foundation Public API</h1>
    <p class="lede">Version 1 — read-only access to everything FAITH Foundation
    publishes about its finances, promises and proof documents.</p>
  </header>

  <div class="note">
    <p><strong>No authentication.</strong> Every endpoint below returns data that
    is already published on <a href="https://www.faithfoundationsf.org/faithproof">faithfoundationsf.org/faithproof</a>.
    Nothing private is reachable here: names of donors and voucher recipients are
    never returned, by design.</p>
    <p><strong>Base URL:</strong> <code>${BASE}</code></p>
    <p><strong>Rate limit:</strong> 100 requests per hour per IP address.
    Exceeding it returns <code>429</code> with a <code>Retry-After</code> header.
    Responses are cached at the edge for 60 seconds.</p>
    <p><strong>Envelope:</strong> every success is
    <code>{ "data": …, "meta": … }</code>; every error is
    <code>{ "error": "…" }</code>. Amounts are integer cents, with a formatted
    companion field. This shape is a contract — a breaking change would ship as
    <code>/api/v2/</code>, not as an edit to v1.</p>
    <p><strong>CORS:</strong> <code>Access-Control-Allow-Origin: *</code>, so
    partner organisations can call these endpoints directly from a browser.</p>
  </div>

  ${ENDPOINTS.map(section).join("\n")}

  <footer>
    <p>Questions, or need something this API does not expose?
    <a href="https://www.faithfoundationsf.org/contact">Get in touch</a>.</p>
  </footer>
</div>
</body>
</html>`;

export async function GET() {
  return new Response(HTML, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
