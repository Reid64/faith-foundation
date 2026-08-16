import type { Metadata } from "next";
import { BackLink, DetailHeading } from "../../../_components/detail";
import { formCardStyle } from "../../../_components/theme";
import { getSession } from "@/lib/faithproof/session";
import type { Account } from "@/lib/faithproof/accounting";
import { AccountForm } from "../AccountForm";
import { createAccount } from "../../actions";

export const metadata: Metadata = {
  title: "Add Account | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function NewAccountPage() {
  const session = await getSession();
  if (!session) return null;

  const { data } = await session.supabase
    .from("accounts")
    .select("id, code, name")
    .order("code");

  const parents = ((data ?? []) as Pick<Account, "id" | "code" | "name">[]).map(
    (a) => ({ id: a.id, label: `${a.code} — ${a.name}` })
  );

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/admin/accounting/accounts" label="Back to Chart of Accounts" />
      <DetailHeading
        title="Add Account"
        subtitle="New accounts join the chart immediately; existing entries are untouched."
      />
      <div style={formCardStyle}>
        <AccountForm action={createAccount} parents={parents} />
      </div>
    </div>
  );
}
