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
import { MAIL_CONFIGURED } from "@/lib/email";
import { CrmNav } from "../CrmNav";

export const metadata: Metadata = {
  title: "Email Templates | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await session.supabase
    .from("email_templates")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as {
    id: string;
    name: string;
    subject: string;
    type: string;
    created_at: string;
  }[];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Email Templates"
        description="Reusable templates with merge tags, used to send campaigns."
        action={
          <PrimaryLinkButton href="/admin/crm/templates/new">
            New Template
          </PrimaryLinkButton>
        }
      />
      <CrmNav />

      {/* Say plainly that mail cannot leave yet, rather than letting someone
          compose a campaign and discover it on send. */}
      {!MAIL_CONFIGURED ? (
        <p
          className="mb-6 rounded-lg px-4 py-3 text-sm"
          style={{
            backgroundColor: "#fffbeb",
            color: "#d97706",
            border: "1px solid #fde68a",
          }}
        >
          <strong>Email is not connected.</strong> ZOHO_SMTP_PASS is not set, so
          nothing will actually be delivered. You can still write and preview
          templates — every send attempt is recorded as failed with the reason,
          never as sent. See governance/faithproof-roadmap/SECRETS_PENDING.md.
        </p>
      ) : null}

      {error ? (
        <QueryError what="templates" message={error.message} />
      ) : rows.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<InfoIcon className="h-5 w-5" />}
            title="No templates yet"
            detail="Create one to start sending campaigns."
          />
        </Panel>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Subject</Th>
              <Th>Created</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr
                key={t.id}
                className="bg-white transition-colors even:bg-[#f8f8f7] hover:bg-[#f0fdf4]"
              >
                <Td className="font-medium">{t.name}</Td>
                <Td>
                  <Badge tone="blue">{t.type.replace(/_/g, " ")}</Badge>
                </Td>
                <Td muted>{t.subject}</Td>
                <Td muted className="whitespace-nowrap">
                  {formatDateOnly(t.created_at)}
                </Td>
                <Td>
                  <Link
                    href={`/admin/crm/templates/${t.id}/edit`}
                    className="text-sm font-medium hover:underline"
                    style={{ color: "#013e37" }}
                  >
                    Edit
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
