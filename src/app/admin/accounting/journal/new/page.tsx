import type { Metadata } from "next";
import { BackLink, DetailHeading } from "../../../_components/detail";
import { formCardStyle } from "../../../_components/theme";
import { getSession } from "@/lib/faithproof/session";
import { todayISODate } from "@/lib/faithproof/transitions";
import type { Account } from "@/lib/faithproof/accounting";
import { createJournalEntry } from "../../actions";
import { JournalEntryForm } from "./JournalEntryForm";

export const metadata: Metadata = {
  title: "New Journal Entry | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function NewJournalEntryPage() {
  const session = await getSession();
  if (!session) return null;

  // Inactive accounts stay in the ledger but are not offered for new entries.
  const { data } = await session.supabase
    .from("accounts")
    .select("id, code, name")
    .eq("is_active", true)
    .order("code");

  const accounts = ((data ?? []) as Pick<Account, "id" | "code" | "name">[]).map(
    (a) => ({ id: a.id, label: `${a.code} — ${a.name}` })
  );

  return (
    <div className="mx-auto max-w-4xl">
      <BackLink href="/admin/accounting/journal" label="Back to Journal" />
      <DetailHeading
        title="New Journal Entry"
        subtitle="Debits must equal credits. Nothing is written until they do."
      />
      <div style={formCardStyle}>
        <JournalEntryForm
          action={createJournalEntry}
          accounts={accounts}
          today={todayISODate()}
        />
      </div>
    </div>
  );
}
