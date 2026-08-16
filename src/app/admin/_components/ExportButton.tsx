"use client";

import { useEffect, useState } from "react";
import { BTN_SECONDARY } from "./theme";
import type { ExportResult } from "@/lib/faithproof/csv";

/**
 * CSV export button.
 *
 * The server action returns the CSV as a string and the download is triggered
 * here with a Blob. A server action cannot set Content-Disposition on its own —
 * it is an RPC, not a route handler — so the header the brief describes is
 * produced client-side by the `download` attribute instead. Same result: a file
 * named faithproof-<table>-<date>.csv lands in the user's downloads.
 */
export function ExportButton({
  label,
  run,
}: {
  label: string;
  run: () => Promise<ExportResult>;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  async function go() {
    if (busy) return;
    setBusy(true);
    setNote(null);
    setFailed(false);

    const result = await run();
    if ("error" in result) {
      setFailed(true);
      setNote(result.error);
      setBusy(false);
      return;
    }

    const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setNote(
      result.rows === 0
        ? `${result.filename} downloaded — no rows yet, headers only.`
        : `${result.filename} downloaded (${result.rows} rows).`
    );
    setBusy(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={go}
        disabled={busy || !ready}
        className={BTN_SECONDARY}
      >
        {busy ? "Preparing..." : label}
      </button>
      {note ? (
        <p
          role="status"
          className="mt-2 text-xs"
          style={{ color: failed ? "#dc2626" : "#6b7280" }}
        >
          {note}
        </p>
      ) : null}
    </div>
  );
}
