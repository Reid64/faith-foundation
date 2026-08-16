import { corsPreflight, guard, jsonResponse } from "@/lib/apiResponse";
import { getPublicDocuments } from "@/lib/faithproof/public";

/**
 * GET /api/v1/public/documents
 *
 * Verified, publicly-flagged proof documents.
 *
 * `storage_path` is deliberately NOT returned. It is an internal bucket path,
 * not a public URL, and publishing it would advertise the storage layout for no
 * benefit. `external_url` is the link a reader is meant to follow.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const gate = guard(request);
  if ("limited" in gate) return gate.limited;

  const documents = await getPublicDocuments();

  return jsonResponse(
    {
      data: documents.map((d) => ({
        id: d.id,
        title: d.title,
        type: d.type,
        description: d.description,
        external_url: d.external_url,
        verified: d.verified,
        verified_at: d.verified_at,
      })),
      meta: {
        total: documents.length,
        generated_at: new Date().toISOString(),
      },
    },
    { headers: gate.headers }
  );
}

export function OPTIONS() {
  return corsPreflight();
}
