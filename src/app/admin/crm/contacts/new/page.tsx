import type { Metadata } from "next";
import { BackLink, DetailHeading } from "../../../_components/detail";
import { formCardStyle } from "../../../_components/theme";
import { getSession } from "@/lib/faithproof/session";
import { ContactForm } from "../ContactForm";
import { createContact } from "../actions";

export const metadata: Metadata = {
  title: "Add Contact | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function NewContactPage() {
  const session = await getSession();
  if (!session) return null;

  const { data: profiles } = await session.supabase
    .from("profiles")
    .select("id, full_name, email")
    .order("email");

  const assignees = (profiles ?? []).map(
    (p: { id: string; full_name: string | null; email: string }) => ({
      id: p.id,
      label: p.full_name || p.email,
    })
  );

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/admin/crm/contacts" label="Back to Contacts" />
      <DetailHeading
        title="Add Contact"
        subtitle="Donors, applicants, volunteers, board members and partners all live here."
      />
      <div style={formCardStyle}>
        <ContactForm
          action={createContact}
          successHref="/admin/crm/contacts"
          cancelHref="/admin/crm/contacts"
          submitLabel="Create Contact"
          assignees={assignees}
        />
      </div>
    </div>
  );
}
