import {
  corsPreflight,
  guard,
  jsonResponse,
  readPaging,
} from "@/lib/apiResponse";
import { getPublicPromises } from "@/lib/faithproof/public";

/**
 * GET /api/v1/public/promises
 *
 * Public promises with their status and proof link.
 *
 * getPublicPromises() returns every public promise; paging happens here rather
 * than in the query. That is fine at this volume — the whole point of a
 * promises page is that there are few enough of them to read — and it keeps one
 * implementation of the public filter.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const gate = guard(request);
  if ("limited" in gate) return gate.limited;

  const url = new URL(request.url);
  const { page, perPage } = readPaging(url);

  const all = await getPublicPromises();
  const status = url.searchParams.get("status");
  const filtered = status ? all.filter((p) => p.status === status) : all;

  const start = (page - 1) * perPage;
  const rows = filtered.slice(start, start + perPage);

  return jsonResponse(
    {
      data: rows.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        status: p.status,
        target_date: p.target_date,
        fulfilled_date: p.fulfilled_date,
        proof_url: p.proof_url,
      })),
      meta: {
        total: filtered.length,
        page,
        per_page: perPage,
        total_pages: Math.max(1, Math.ceil(filtered.length / perPage)),
        generated_at: new Date().toISOString(),
      },
    },
    { headers: gate.headers }
  );
}

export function OPTIONS() {
  return corsPreflight();
}
