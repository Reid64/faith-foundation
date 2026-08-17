#!/usr/bin/env node
/**
 * ZEFFY EMAIL INSPECTOR — the missing first step of the donation poller.
 *
 * WHY THIS EXISTS. The poller at /api/cron/poll-donations has to parse Zeffy's
 * donation notification emails. Nobody has ever seen one in a form that can be
 * written against: the credentials live in Vercel as encrypted values that
 * `vercel env pull` returns empty, so the format is unknown. A parser written
 * against a guessed format is worse than no parser — it fails silently and the
 * money it drops is real.
 *
 * So: run this, and it prints the actual structure of a real Zeffy email.
 * That output is everything the parser needs.
 *
 * IT ONLY READS. No message is marked seen, moved, flagged or deleted — every
 * fetch uses BODY.PEEK, which is the IMAP way of saying "do not touch". You can
 * run it as many times as you like.
 *
 * NO DEPENDENCIES. Plain Node and TLS, so there is nothing to install.
 *
 * ── HOW TO RUN ────────────────────────────────────────────────────────────
 *
 *   ZOHO_IMAP_HOST=imap.zoho.com \
 *   ZOHO_IMAP_PORT=993 \
 *   ZOHO_IMAP_USER=donations@faithfoundationsf.org \
 *   ZOHO_IMAP_PASS='<app password>' \
 *   node scripts/zeffy-inspect.mjs
 *
 * On Windows PowerShell:
 *
 *   $env:ZOHO_IMAP_HOST="imap.zoho.com"; $env:ZOHO_IMAP_PORT="993"
 *   $env:ZOHO_IMAP_USER="donations@faithfoundationsf.org"
 *   $env:ZOHO_IMAP_PASS="<app password>"
 *   node scripts/zeffy-inspect.mjs
 *
 * Options:
 *   --all        list every sender in the mailbox, not just Zeffy
 *   --n <count>  how many matching messages to dump in full (default 2)
 *   --redact     mask donor names, emails and amounts in the output, so the
 *                result is safe to paste into a shared thread
 */

import tls from "node:tls";
import process from "node:process";

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const opt = (f, d) => {
  const i = args.indexOf(f);
  return i === -1 ? d : args[i + 1];
};

const HOST = process.env.ZOHO_IMAP_HOST;
const PORT = Number(process.env.ZOHO_IMAP_PORT || 993);
const USER = process.env.ZOHO_IMAP_USER;
const PASS = process.env.ZOHO_IMAP_PASS;
const DUMP = Number(opt("--n", "2"));
const REDACT = has("--redact");

if (!HOST || !USER || !PASS) {
  console.error(
    "Missing credentials. Set ZOHO_IMAP_HOST, ZOHO_IMAP_PORT, ZOHO_IMAP_USER\n" +
      "and ZOHO_IMAP_PASS — the same four values already in Vercel production.\n" +
      "Vercel stores them encrypted, so `vercel env pull` returns them empty;\n" +
      "read them from the Vercel dashboard or your password manager."
  );
  process.exit(1);
}

// ── A very small IMAP client ────────────────────────────────────────────────

let buffer = "";
let tagN = 0;
const pending = [];

const socket = tls.connect({ host: HOST, port: PORT, servername: HOST });
socket.setEncoding("utf8");

socket.on("data", (chunk) => {
  buffer += chunk;
  while (pending.length > 0) {
    const { tag, resolve } = pending[0];
    const re = new RegExp(`^${tag} (OK|NO|BAD)([^\\r\\n]*)\\r?\\n`, "m");
    const m = re.exec(buffer);
    if (!m) break;
    const end = m.index + m[0].length;
    const response = buffer.slice(0, end);
    buffer = buffer.slice(end);
    pending.shift();
    resolve({ status: m[1], detail: m[2].trim(), response });
  }
});

socket.on("error", (e) => {
  console.error(`\nConnection failed: ${e.message}`);
  console.error(
    "Check the host and port. Zoho is imap.zoho.com:993 for .com accounts and\n" +
      "imap.zoho.eu:993 for European ones."
  );
  process.exit(1);
});

function send(command, forLog) {
  const tag = `a${++tagN}`;
  return new Promise((resolve) => {
    pending.push({ tag, resolve });
    socket.write(`${tag} ${command}\r\n`);
    if (forLog) console.error(`> ${forLog}`);
  });
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const ids = (res) =>
  (res.response.match(/^\* SEARCH([^\r\n]*)/m)?.[1] ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

function redact(text) {
  if (!REDACT) return text;
  return text
    .replace(/[\w.+-]+@[\w.-]+\.\w+/g, "<email>")
    .replace(/\$\s?[\d,]+\.\d{2}/g, "$<amount>")
    .replace(/^(To|From|Cc|Reply-To):.*$/gim, "$1: <redacted>");
}

// ── Run ─────────────────────────────────────────────────────────────────────

(async () => {
  await wait(1500);
  buffer = "";

  const login = await send(`LOGIN "${USER}" "${PASS.replace(/"/g, '\\"')}"`, "LOGIN");
  if (login.status !== "OK") {
    console.error(`\nLogin refused: ${login.detail}`);
    console.error(
      "Zoho requires an APP PASSWORD when two-factor authentication is on — an\n" +
        "ordinary mailbox password is rejected. Zoho Mail → Settings → Security →\n" +
        "App Passwords."
    );
    process.exit(1);
  }
  console.error("Logged in.\n");

  const folders = await send('LIST "" "*"');
  console.log("═══ FOLDERS ═══");
  for (const line of folders.response.split(/\r?\n/)) {
    if (line.startsWith("* LIST")) {
      console.log("  " + line.replace(/^\* LIST \([^)]*\) "[^"]*" /, ""));
    }
  }

  const sel = await send("SELECT INBOX");
  const total = /(\d+) EXISTS/.exec(sel.response)?.[1] ?? "0";
  console.log(`\n═══ INBOX ═══\n  ${total} messages`);

  // Who sends here, and which of them look like Zeffy?
  const searches = {
    'FROM "zeffy"': null,
    'SUBJECT "donation"': null,
    'SUBJECT "Zeffy"': null,
    'TEXT "zeffy"': null,
  };
  console.log("\n═══ SEARCHES ═══");
  for (const term of Object.keys(searches)) {
    const r = await send(`SEARCH ${term}`);
    searches[term] = ids(r);
    console.log(`  ${term.padEnd(24)} ${searches[term].length} hit(s)`);
  }

  const candidates = [
    ...new Set([
      ...(searches['FROM "zeffy"'] ?? []),
      ...(searches['TEXT "zeffy"'] ?? []),
      ...(searches['SUBJECT "donation"'] ?? []),
    ]),
  ].sort((a, b) => Number(a) - Number(b));

  if (has("--all") || candidates.length === 0) {
    const all = ids(await send("SEARCH ALL"));
    const recent = all.slice(-25);
    if (recent.length) {
      const hdr = await send(
        `FETCH ${recent.join(",")} (BODY.PEEK[HEADER.FIELDS (FROM SUBJECT DATE)])`
      );
      console.log("\n═══ RECENT SENDERS (nothing matched Zeffy) ═══");
      console.log(
        redact(hdr.response)
          .split(/\r?\n/)
          .filter((l) => /^(From|Subject|Date):/i.test(l))
          .map((l) => "  " + l)
          .join("\n")
      );
    }
  }

  if (candidates.length === 0) {
    console.log(
      "\nNo Zeffy message found. Either the notification arrives from an address\n" +
        "that does not contain 'zeffy', or it is filed in a folder other than\n" +
        "INBOX — check the folder list above and re-run against it."
    );
    await send("LOGOUT");
    socket.end();
    return;
  }

  const toDump = candidates.slice(-DUMP);
  console.log(
    `\n═══ ${toDump.length} MOST RECENT ZEFFY MESSAGE(S), IN FULL ═══` +
      (REDACT ? "\n(redacted: names, emails and amounts are masked)" : "")
  );

  for (const id of toDump) {
    const full = await send(`FETCH ${id} (BODY.PEEK[])`);
    console.log(`\n──────── message ${id} ────────`);
    // Strip the IMAP framing so what prints is the raw RFC 822 message.
    const body = full.response
      .replace(/^\* \d+ FETCH \([^)]*\{\d+\}\r?\n/, "")
      .replace(/\r?\n\)\r?\n?a\d+ OK[\s\S]*$/, "");
    console.log(redact(body));
  }

  console.log(
    "\n═══ WHAT TO DO WITH THIS ═══\n" +
      "  Paste the output above (use --redact first if it is going anywhere\n" +
      "  shared). The parser needs five things from it: the amount, the donor\n" +
      "  name, the donor email, the date, the Zeffy reference number, and the\n" +
      "  designated fund — plus whether the body is plain text, HTML, or both,\n" +
      "  and whether it is base64 or quoted-printable encoded."
  );

  await send("LOGOUT");
  socket.end();
})().catch((e) => {
  console.error("Inspector failed:", e.message);
  process.exit(1);
});
