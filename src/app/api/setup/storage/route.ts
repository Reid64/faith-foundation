import { NextResponse } from "next/server";
import { getSession } from "@/lib/faithproof/session";
import { supabaseAdmin } from "@/lib/supabase/service";

/**
 * GET /api/setup/storage
 *
 * One-time creation of the private `board-minutes` bucket that certified
 * minutes PDFs are filed into.
 *
 * ADMIN ONLY, and deliberately so: it uses the service-role client, which
 * bypasses row level security entirely. An unauthenticated setup endpoint that
 * holds the service role is a back door, however harmless the operation looks.
 *
 * Safe to call more than once — an existing bucket is reported, not recreated.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BUCKET = "board-minutes";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  if (session.profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Only an administrator can run setup." },
      { status: 403 }
    );
  }

  const { data: existing } = await supabaseAdmin.storage.getBucket(BUCKET);
  if (existing) {
    return NextResponse.json({
      ok: true,
      bucket: BUCKET,
      created: false,
      note: "The bucket already exists. Nothing was changed.",
    });
  }

  const { error } = await supabaseAdmin.storage.createBucket(BUCKET, {
    // Private: board minutes are an internal corporate record. The Proof Vault
    // row for each PDF is written is_public:false to match.
    public: false,
    fileSizeLimit: 52428800,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, bucket: BUCKET, created: true });
}
