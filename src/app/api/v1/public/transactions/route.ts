import {
  corsPreflight,
  formatDollars,
  guard,
  jsonResponse,
  readDate,
  readPaging,
} from "@/lib/apiResponse";
import { getPublicLedger } from "@/lib/faithproof/public";
import {
  FUND_DESIGNATIONS,
  TRANSACTION_TYPES,
  type FundDesignation,
  type TransactionType,
} from "@/lib/faithproof/types";

/**
 * GET /api/v1/public/transactions
 *
 * Confirmed, publicly-flagged transactions only — enforced by getPublicLedger,
 * which is the same code path the website uses.
 *
 * Donor names are never selected. The public page deliberately omits them, and
 * an API is far easier to scrape than a web page, so the column list stays
 * explicit and narrow.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const gate = guard(request);
  if ("limited" in gate) return gate.limited;

  const url = new URL(request.url);
  const { page, perPage } = readPaging(url);

  // An unrecognised filter value is rejected rather than silently ignored: a
  // caller filtering by a typo should be told, not handed the whole ledger.
  const fundParam = url.searchParams.get("fund");
  if (fundParam && !FUND_DESIGNATIONS.includes(fundParam as FundDesignation)) {
    return jsonResponse(
      {
        error: "Unknown fund.",
        detail: `Valid values: ${FUND_DESIGNATIONS.join(", ")}`,
      },
      { status: 400, headers: gate.headers }
    );
  }

  const typeParam = url.searchParams.get("type");
  if (typeParam && !TRANSACTION_TYPES.includes(typeParam as TransactionType)) {
    return jsonResponse(
      {
        error: "Unknown type.",
        detail: `Valid values: ${TRANSACTION_TYPES.join(", ")}`,
      },
      { status: 400, headers: gate.headers }
    );
  }

  const { rows, total, error } = await getPublicLedger({
    page,
    perPage,
    fund: fundParam ?? undefined,
    type: typeParam ?? undefined,
    from: readDate(url, "date_from"),
    to: readDate(url, "date_to"),
  });

  if (error) {
    return jsonResponse(
      { error: "Could not read the public ledger." },
      { status: 503, headers: gate.headers }
    );
  }

  return jsonResponse(
    {
      data: rows.map((t) => ({
        id: t.id,
        date: t.transaction_date,
        type: t.type,
        fund: t.fund,
        amount_cents: t.amount_cents,
        amount_formatted: formatDollars(t.amount_cents),
        description: t.description,
      })),
      meta: {
        total,
        page,
        per_page: perPage,
        total_pages: Math.max(1, Math.ceil(total / perPage)),
        generated_at: new Date().toISOString(),
      },
    },
    { headers: gate.headers }
  );
}

export function OPTIONS() {
  return corsPreflight();
}
