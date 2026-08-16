import type { Metadata } from "next";
import Link from "next/link";
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
import { formatDateOnly } from "@/lib/faithproof/format";
import {
  CONTACT_TYPES,
  CONTACT_TYPE_LABELS,
  CONTACT_TYPE_TONES,
  contactName,
  stageLabel,
  type Contact,
  type ContactType,
} from "@/lib/faithproof/crm";
import { CrmNav } from "../CrmNav";
import { ClickableRow } from "../../_components/ClickableRow";

export const metadata: Metadata = {
  title: "Contacts | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const PER_PAGE = 25;

export default async function ContactsPage({
  searchParams,
}: {
  searchParams?: {
    type?: string;
    stage?: string;
    q?: string;
    page?: string;
  };
}) {
  const session = await getSession();
  if (!session) return null;

  const type = searchParams?.type ?? "";
  const stage = searchParams?.stage ?? "";
  const q = (searchParams?.q ?? "").trim();
  const page = Math.max(1, Number(searchParams?.page ?? 1) || 1);
  const from = (page - 1) * PER_PAGE;

  let query = session.supabase
    .from("contacts")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, from + PER_PAGE - 1);

  if (type) query = query.eq("type", type);
  if (stage) query = query.eq("pipeline_stage", stage);
  if (q) {
    // Escape commas — PostgREST uses them as the `or()` separator, so an
    // unescaped comma in a search box silently becomes a second filter.
    const safe = q.replace(/[,()]/g, " ");
    query = query.or(
      `first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,email.ilike.%${safe}%`
    );
  }

  const { data, count, error } = await query;
  const rows = (data ?? []) as Contact[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PER_PAGE));

  const qs = (over: Record<string, string>) => {
    const p = new URLSearchParams();
    const merged = { type, stage, q, ...over };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/admin/crm/contacts?${s}` : "/admin/crm/contacts";
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Contacts"
        description={`${count ?? 0} contact${count === 1 ? "" : "s"} on record.`}
        action={
          <PrimaryLinkButton href="/admin/crm/contacts/new">
            Add Contact
          </PrimaryLinkButton>
        }
      />
      <CrmNav />

      <form
        method="get"
        className="mb-6 flex flex-wrap items-end gap-4 rounded-xl p-4"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(1,62,55,0.1)",
        }}
      >
        <div className="min-w-[10rem] flex-1">
          <label
            htmlFor="type"
            className="block text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#6b7280" }}
          >
            Type
          </label>
          <select
            id="type"
            name="type"
            defaultValue={type}
            className="mt-1.5 w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#111827]"
          >
            <option value="">All types</option>
            {CONTACT_TYPES.map((t) => (
              <option key={t} value={t}>
                {CONTACT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[10rem] flex-1">
          <label
            htmlFor="stage"
            className="block text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#6b7280" }}
          >
            Pipeline stage
          </label>
          <input
            id="stage"
            name="stage"
            defaultValue={stage}
            placeholder="e.g. active_donor"
            className="mt-1.5 w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#111827]"
          />
        </div>
        <div className="min-w-[12rem] flex-[2]">
          <label
            htmlFor="q"
            className="block text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#6b7280" }}
          >
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Name or email"
            className="mt-1.5 w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#111827]"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg px-5 py-2 text-sm font-semibold"
          style={{ backgroundColor: "#013e37", color: "#ffefb3" }}
        >
          Filter
        </button>
        {type || stage || q ? (
          <Link
            href="/admin/crm/contacts"
            className="self-center text-sm font-medium"
            style={{ color: "#6b7280" }}
          >
            Reset
          </Link>
        ) : null}
      </form>

      {error ? (
        <QueryError what="contacts" message={error.message} />
      ) : rows.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<InfoIcon className="h-5 w-5" />}
            title="No contacts match"
            detail="Add a contact, or clear the filters above."
          />
        </Panel>
      ) : (
        <>
          <TableWrap>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Stage</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Updated</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <ClickableRow key={c.id} href={`/admin/crm/contacts/${c.id}`}>
                  <Td className="whitespace-nowrap font-medium">
                    <Link
                      href={`/admin/crm/contacts/${c.id}`}
                      className="hover:underline"
                      style={{ color: "#013e37" }}
                    >
                      {contactName(c)}
                    </Link>
                  </Td>
                  <Td>
                    <Badge tone={CONTACT_TYPE_TONES[c.type as ContactType] ?? "gray"}>
                      {CONTACT_TYPE_LABELS[c.type as ContactType] ?? c.type}
                    </Badge>
                  </Td>
                  <Td muted>{stageLabel(c.pipeline_stage)}</Td>
                  <Td muted>{c.email || "—"}</Td>
                  <Td muted>{c.phone || "—"}</Td>
                  <Td muted className="whitespace-nowrap">
                    {formatDateOnly(c.updated_at)}
                  </Td>
                </ClickableRow>
              ))}
            </tbody>
          </TableWrap>

          {totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-between text-sm">
              {page > 1 ? (
                <Link href={qs({ page: String(page - 1) })} style={{ color: "#013e37", fontWeight: 600 }}>
                  ← Previous
                </Link>
              ) : (
                <span style={{ color: "#d1d5db" }}>← Previous</span>
              )}
              <span style={{ color: "#6b7280" }}>
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={qs({ page: String(page + 1) })} style={{ color: "#013e37", fontWeight: 600 }}>
                  Next →
                </Link>
              ) : (
                <span style={{ color: "#d1d5db" }}>Next →</span>
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
