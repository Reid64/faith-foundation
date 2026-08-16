import {
  corsPreflight,
  formatDollars,
  guard,
  jsonResponse,
} from "@/lib/apiResponse";
import { getLedgerTotals } from "@/lib/faithproof/public";
import { FUND_LABELS, type FundDesignation } from "@/lib/faithproof/types";

/**
 * GET /api/v1/public/funds
 *
 * Money in and money out per fund, from the public ledger only.
 *
 * These are NOT the accounting fund balances. The ledger behind /admin/accounting
 * includes transactions that are confirmed but not flagged public; this endpoint
 * reports exactly what the website publishes, which is the number a partner can
 * check against the page. Saying so in `meta` is part of the contract.
 */
export const dynamic = "force-dynamic";

const INFLOW = new Set(["donation", "grant"]);
const OUTFLOW = new Set(["voucher_disbursement", "expense", "operational"]);

export async function GET(request: Request) {
  const gate = guard(request);
  if ("limited" in gate) return gate.limited;

  const rows = await getLedgerTotals();

  const totals = new Map<string, { in: number; out: number }>();
  for (const row of rows) {
    const entry = totals.get(row.fund) ?? { in: 0, out: 0 };
    if (INFLOW.has(row.type)) entry.in += row.amount_cents ?? 0;
    if (OUTFLOW.has(row.type)) entry.out += row.amount_cents ?? 0;
    totals.set(row.fund, entry);
  }

  const totalIn = Array.from(totals.values()).reduce((n, v) => n + v.in, 0);

  const data = Array.from(totals.entries())
    .map(([fund, v]) => ({
      fund,
      label: FUND_LABELS[fund as FundDesignation] ?? fund,
      total_in_cents: v.in,
      total_in_formatted: formatDollars(v.in),
      total_out_cents: v.out,
      total_out_formatted: formatDollars(v.out),
      balance_cents: v.in - v.out,
      balance_formatted: formatDollars(v.in - v.out),
      share_of_giving_pct:
        totalIn > 0 ? Number(((v.in / totalIn) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.total_in_cents - a.total_in_cents);

  return jsonResponse(
    {
      data,
      meta: {
        total_in_cents: totalIn,
        total_in_formatted: formatDollars(totalIn),
        scope:
          "Publicly flagged, confirmed transactions only — the same rows shown on /faithproof. Not a complete accounting fund balance.",
        generated_at: new Date().toISOString(),
      },
    },
    { headers: gate.headers }
  );
}

export function OPTIONS() {
  return corsPreflight();
}
