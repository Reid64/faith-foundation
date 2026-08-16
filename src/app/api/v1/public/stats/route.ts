import {
  corsPreflight,
  formatDollars,
  guard,
  jsonResponse,
} from "@/lib/apiResponse";
import { getPublicStats } from "@/lib/faithproof/public";

/**
 * GET /api/v1/public/stats
 *
 * The same figures the /faithproof page shows, from the same helper. Reusing
 * getPublicStats() rather than re-querying keeps one implementation of the
 * public filters — a second copy is a second place for a filter to drift and
 * start publishing rows that should be private.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const gate = guard(request);
  if ("limited" in gate) return gate.limited;

  const stats = await getPublicStats();

  return jsonResponse(
    {
      data: {
        total_donations_cents: stats.confirmedGiftsCents,
        total_donations_formatted: formatDollars(stats.confirmedGiftsCents),
        vouchers_disbursed: stats.vouchersDisbursed,
        promises_kept: stats.promisesKept,
        overhead_rate: Number(stats.overheadPct.toFixed(2)),
        program_rate: Number(stats.programPct.toFixed(2)),
      },
      meta: {
        generated_at: new Date().toISOString(),
        source: "https://www.faithfoundationsf.org/faithproof",
      },
    },
    { headers: gate.headers }
  );
}

export function OPTIONS() {
  return corsPreflight();
}
