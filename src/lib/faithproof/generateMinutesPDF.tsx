import React from "react";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { supabaseAdmin } from "@/lib/supabase/service";

/**
 * Certified board minutes as a PDF, filed in the Proof Vault.
 *
 * This runs with the SERVICE ROLE on purpose. It reads profiles and signature
 * rows for every director, and writes to a private storage bucket and to
 * proof_documents — work that is triggered by an admin but is not scoped to one
 * person's visibility. The caller (certifyMinutes) has already checked that the
 * actor is an admin and that every board member has approved.
 *
 * The bucket is PRIVATE. These minutes are an internal corporate record; the
 * proof_documents row is written `is_public: false`, and nothing here produces
 * a public URL.
 */

const BUCKET = "board-minutes";

const styles = StyleSheet.create({
  page: { padding: 56, fontSize: 11, lineHeight: 1.5, color: "#111827" },
  brand: {
    fontSize: 9,
    letterSpacing: 2,
    color: "#013e37",
    textTransform: "uppercase",
  },
  org: { fontSize: 15, fontWeight: "bold", color: "#013e37", marginTop: 6 },
  meta: { fontSize: 9, color: "#6b7280", marginTop: 2 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#013e37",
    marginTop: 28,
  },
  rule: {
    borderBottomWidth: 2,
    borderBottomColor: "#013e37",
    marginVertical: 16,
  },
  thinRule: {
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    marginVertical: 12,
  },
  label: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#013e37",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  body: { fontSize: 11, marginBottom: 10 },
  minutes: { fontSize: 11, lineHeight: 1.6 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  cellName: { width: "32%", fontSize: 10 },
  cellRole: { width: "16%", fontSize: 10, color: "#6b7280" },
  cellWhen: { width: "26%", fontSize: 9, color: "#6b7280" },
  cellSig: { width: "26%" },
  sigImage: { height: 34, objectFit: "contain" },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#013e37",
    paddingBottom: 4,
  },
  headerCell: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#013e37",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  certification: { fontSize: 10, lineHeight: 1.6, marginTop: 6 },
  footNote: { fontSize: 8, color: "#6b7280", marginTop: 6 },
});

type MeetingRow = {
  id: string;
  meeting_date: string;
  type: string;
  attendees: string[] | null;
  ai_draft_minutes: string | null;
  actual_start: string | null;
  actual_end: string | null;
};

type ApprovalRow = {
  profile_id: string;
  approved_at: string;
  signature_data: string | null;
};

type ProfileRow = { id: string; full_name: string | null; email: string; role: string };

function dateLong(value: string): string {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return value;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function stamp(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Chicago",
      });
}

function duration(start: string | null, end: string | null): string {
  if (!start || !end) return "Not recorded";
  const ms = Date.parse(end) - Date.parse(start);
  if (!Number.isFinite(ms) || ms <= 0) return "Not recorded";
  const minutes = Math.round(ms / 60000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function MinutesDocument({
  meeting,
  approvals,
  profiles,
  certifiedOn,
}: {
  meeting: MeetingRow;
  approvals: ApprovalRow[];
  profiles: Map<string, ProfileRow>;
  certifiedOn: string;
}) {
  const attendees = meeting.attendees?.length
    ? meeting.attendees.join(", ")
    : "Not recorded";

  return (
    <Document
      title={`Certified Board Minutes — ${meeting.meeting_date}`}
      author="FAITH Foundation"
    >
      {/* ── Cover ─────────────────────────────────────────────────────── */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.brand}>FAITH Foundation</Text>
        <Text style={styles.org}>
          FOUNDATION FOR AFFORDABLE INSTRUCTION AND TENANCY HOPE
        </Text>
        <Text style={styles.meta}>EIN 33-2640449 · faithfoundationsf.org</Text>

        <Text style={styles.title}>CERTIFIED BOARD MEETING MINUTES</Text>
        <View style={styles.rule} />

        <Text style={styles.label}>Meeting</Text>
        <Text style={styles.body}>
          {meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)} meeting of the
          Board of Directors
        </Text>

        <Text style={styles.label}>Date</Text>
        <Text style={styles.body}>{dateLong(meeting.meeting_date)}</Text>

        <Text style={styles.label}>Duration</Text>
        <Text style={styles.body}>
          {duration(meeting.actual_start, meeting.actual_end)}
        </Text>

        <View style={styles.thinRule} />

        <Text style={styles.label}>Attendees</Text>
        <Text style={styles.body}>{attendees}</Text>

        <Text style={styles.footNote}>
          This document was produced by FaithProof, the accountability system of
          FAITH Foundation. Its approval record is reproduced in full on the
          final page.
        </Text>
      </Page>

      {/* ── Minutes ───────────────────────────────────────────────────── */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.label}>Minutes</Text>
        <View style={styles.thinRule} />
        <Text style={styles.minutes}>
          {meeting.ai_draft_minutes ?? "No minutes recorded."}
        </Text>
      </Page>

      {/* ── Approvals ─────────────────────────────────────────────────── */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>BOARD APPROVAL RECORD</Text>
        <View style={styles.rule} />

        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, { width: "32%" }]}>Name</Text>
          <Text style={[styles.headerCell, { width: "16%" }]}>Role</Text>
          <Text style={[styles.headerCell, { width: "26%" }]}>Approved</Text>
          <Text style={[styles.headerCell, { width: "26%" }]}>Signature</Text>
        </View>

        {approvals.length === 0 ? (
          <Text style={styles.body}>No approvals recorded.</Text>
        ) : (
          approvals.map((a) => {
            const p = profiles.get(a.profile_id);
            return (
              <View key={a.profile_id} style={styles.row}>
                <Text style={styles.cellName}>
                  {p?.full_name || p?.email || "Unknown"}
                </Text>
                <Text style={styles.cellRole}>{p?.role ?? "—"}</Text>
                <Text style={styles.cellWhen}>{stamp(a.approved_at)}</Text>
                <View style={styles.cellSig}>
                  {a.signature_data ? (
                    <Image src={a.signature_data} style={styles.sigImage} />
                  ) : (
                    <Text style={{ fontSize: 9, color: "#6b7280" }}>
                      No signature captured
                    </Text>
                  )}
                </View>
              </View>
            );
          })
        )}

        <View style={styles.rule} />

        <Text style={styles.label}>Certification</Text>
        <Text style={styles.certification}>
          These minutes are hereby certified as an accurate and complete record of
          the proceedings of the {dateLong(meeting.meeting_date)} {meeting.type}{" "}
          meeting of the Board of Directors of Foundation for Affordable
          Instruction and Tenancy Hope.
        </Text>

        <Text style={[styles.certification, { marginTop: 18 }]}>
          Certified by: Juan Valdez, Secretary
        </Text>
        <Text style={styles.certification}>Certification date: {certifiedOn}</Text>
        <Text style={styles.footNote}>
          Digital audit reference: {meeting.id}
        </Text>
        <Text style={styles.footNote}>
          Immutable audit trail maintained in the FaithProof accountability
          system. Each approval above records the approving director, the moment
          of approval, and the network address it was made from.
        </Text>
      </Page>
    </Document>
  );
}

/**
 * Render, store and register the certified PDF.
 *
 * Throws on failure — the caller treats a thrown error as "nothing was
 * certified", which is the only safe reading.
 */
export async function generateAndSaveMinutesPDF(
  meetingId: string,
  actorId: string
): Promise<string> {
  const { data: meetingRow, error: meetingError } = await supabaseAdmin
    .from("board_meetings")
    .select(
      "id, meeting_date, type, attendees, ai_draft_minutes, actual_start, actual_end"
    )
    .eq("id", meetingId)
    .maybeSingle();

  if (meetingError) throw new Error(meetingError.message);
  if (!meetingRow) throw new Error("That meeting no longer exists.");

  const meeting = meetingRow as MeetingRow;

  const [{ data: approvalRows }, { data: profileRows }] = await Promise.all([
    supabaseAdmin
      .from("meeting_approvals")
      .select("profile_id, approved_at, signature_data")
      .eq("meeting_id", meetingId)
      .order("approved_at", { ascending: true }),
    supabaseAdmin.from("profiles").select("id, full_name, email, role"),
  ]);

  const approvals = (approvalRows ?? []) as ApprovalRow[];
  const profiles = new Map(
    ((profileRows ?? []) as ProfileRow[]).map((p) => [p.id, p])
  );

  const certifiedOn = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Chicago",
  });

  const buffer = await renderToBuffer(
    <MinutesDocument
      meeting={meeting}
      approvals={approvals}
      profiles={profiles}
      certifiedOn={certifiedOn}
    />
  );

  const path = `${meetingId}.pdf`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    // The most likely cause by far is the bucket not existing yet.
    throw new Error(
      `${uploadError.message}. If the storage bucket is missing, call /api/setup/storage once as an administrator.`
    );
  }

  // One document per meeting: re-certifying replaces the record rather than
  // filing a second copy of the same minutes in the Proof Vault.
  const title = `Board Meeting Minutes — ${dateLong(meeting.meeting_date)}`;

  const { data: existing } = await supabaseAdmin
    .from("proof_documents")
    .select("id")
    .eq("storage_path", path)
    .maybeSingle();

  const record = {
    title,
    type: "board_minutes",
    description: `Certified minutes with the full board approval record. Audit reference ${meetingId}.`,
    storage_path: path,
    is_public: false,
    verified: true,
    verified_by: actorId,
    verified_at: new Date().toISOString(),
  };

  if (existing) {
    await supabaseAdmin
      .from("proof_documents")
      .update(record)
      .eq("id", (existing as { id: string }).id);
  } else {
    await supabaseAdmin
      .from("proof_documents")
      .insert({ ...record, created_by: actorId });
  }

  await supabaseAdmin.from("audit_log").insert({
    actor_id: actorId,
    action: "minutes.pdf_generated",
    entity_type: "board_meetings",
    entity_id: meetingId,
    new_value: { storage_path: path, approvals: approvals.length },
  });

  return path;
}
