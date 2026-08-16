import type { Metadata } from "next";
import { ActionButton } from "../../_components/ActionButton";
import { InfoIcon } from "../../_components/icons";
import {
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  PrimaryLinkButton,
  QueryError,
  TableWrap,
  Td,
  Th,
} from "../../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import { formatCents } from "@/lib/faithproof/format";
import { FUND_LABELS, type FundDesignation } from "@/lib/faithproof/types";
import {
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_TYPE_ORDER,
  ACCOUNT_TYPE_TONES,
  cents,
  type Account,
  type AccountBalance,
} from "@/lib/faithproof/accounting";
import { AccountingNav } from "../AccountingNav";
import { toggleAccountActive } from "../actions";

export const metadata: Metadata = {
  title: "Chart of Accounts | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const session = await getSession();
  if (!session) return null;

  const [{ data, error }, { data: balanceRows }] = await Promise.all([
    session.supabase.from("accounts").select("*").order("code"),
    session.supabase.from("account_balances").select("account_id, balance_cents"),
  ]);

  const accounts = (data ?? []) as Account[];
  const balances = new Map(
    ((balanceRows ?? []) as Pick<AccountBalance, "account_id" | "balance_cents">[]).map(
      (b) => [b.account_id, cents(b.balance_cents)]
    )
  );

  /**
   * Children are nested under their parent, and the chart is grouped by
   * account type in statement order. A sub-account listed away from its parent
   * is how a chart of accounts stops being readable.
   */
  const childrenOf = new Map<string, Account[]>();
  for (const a of accounts) {
    if (!a.parent_id) continue;
    childrenOf.set(a.parent_id, [...(childrenOf.get(a.parent_id) ?? []), a]);
  }

  function flatten(a: Account, depth: number): { account: Account; depth: number }[] {
    return [
      { account: a, depth },
      ...(childrenOf.get(a.id) ?? []).flatMap((c) => flatten(c, depth + 1)),
    ];
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Chart of Accounts"
        description={`${accounts.length} account${accounts.length === 1 ? "" : "s"}. Balances are derived from the ledger, never stored.`}
        action={
          <PrimaryLinkButton href="/admin/accounting/accounts/new">
            Add Account
          </PrimaryLinkButton>
        }
      />
      <AccountingNav />

      {error ? (
        <QueryError what="the chart of accounts" message={error.message} />
      ) : accounts.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<InfoIcon className="h-5 w-5" />}
            title="No accounts"
            detail="The default chart is seeded by migration 012."
          />
        </Panel>
      ) : (
        <div className="space-y-8">
          {ACCOUNT_TYPE_ORDER.map((type) => {
            const roots = accounts.filter((a) => a.type === type && !a.parent_id);
            if (roots.length === 0) return null;
            const rows = roots.flatMap((r) => flatten(r, 0));
            const subtotal = rows.reduce(
              (n, r) => n + (balances.get(r.account.id) ?? 0),
              0
            );

            return (
              <section key={type}>
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <h2 style={{ color: "#013e37", fontSize: 16, fontWeight: 700 }}>
                    {ACCOUNT_TYPE_LABELS[type]}
                  </h2>
                  <span
                    className="text-sm tabular-nums"
                    style={{ color: "#6b7280" }}
                  >
                    Subtotal {formatCents(subtotal)}
                  </span>
                </div>
                <TableWrap>
                  <thead>
                    <tr>
                      <Th>Code</Th>
                      <Th>Name</Th>
                      <Th>Type</Th>
                      <Th>Fund</Th>
                      <Th>Balance</Th>
                      <Th>Active</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ account: a, depth }) => (
                      <tr key={a.id}>
                        <Td className="whitespace-nowrap font-medium tabular-nums">
                          {a.code}
                        </Td>
                        <Td>
                          <span style={{ paddingLeft: depth * 20 }}>
                            {depth > 0 ? "↳ " : ""}
                            {a.name}
                          </span>
                          {a.is_restricted ? (
                            <span className="ml-2">
                              <Badge tone="amber">restricted</Badge>
                            </span>
                          ) : null}
                        </Td>
                        <Td>
                          <Badge tone={ACCOUNT_TYPE_TONES[a.type] ?? "gray"}>
                            {ACCOUNT_TYPE_LABELS[a.type] ?? a.type}
                          </Badge>
                        </Td>
                        <Td muted>
                          {a.fund
                            ? (FUND_LABELS[a.fund as FundDesignation] ?? a.fund)
                            : "—"}
                        </Td>
                        <Td className="tabular-nums">
                          {formatCents(balances.get(a.id) ?? 0)}
                        </Td>
                        <Td>
                          <ActionButton
                            action={toggleAccountActive.bind(null, a.id, !a.is_active)}
                            label={a.is_active ? "Deactivate" : "Activate"}
                            variant={a.is_active ? "secondary" : "success"}
                          />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </TableWrap>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
