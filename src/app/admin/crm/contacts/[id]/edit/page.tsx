import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink, DetailHeading } from "../../../../_components/detail";
import { formCardStyle } from "../../../../_components/theme";
import { QueryError } from "../../../../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import type { Contact } from "@/lib/faithproof/crm";
import { ContactForm } from "../../ContactForm";
import { updateContact } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Contact | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function EditContactPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const [{ data, error }, { data: profiles }] = await Promise.all([
    session.supabase
      .from("contacts")
      .select("*")
      .eq("id", params.id)
      .maybeSingle<Contact>(),
    session.supabase.from("profiles").select("id, full_name, email").order("email"),
  ]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <BackLink href={`/admin/crm/contacts/${params.id}`} label="Back to contact" />
        <QueryError what="this contact" message={error.message} />
      </div>
    );
  }
  if (!data) notFound();

  const assignees = (profiles ?? []).map(
    (p: { id: string; full_name: string | null; email: string }) => ({
      id: p.id,
      label: p.full_name || p.email,
    })
  );

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href={`/admin/crm/contacts/${data.id}`} label="Back to contact" />
      <DetailHeading title="Edit Contact" />
      <div style={formCardStyle}>
        <ContactForm
          action={updateContact.bind(null, data.id)}
          successHref={`/admin/crm/contacts/${data.id}`}
          cancelHref={`/admin/crm/contacts/${data.id}`}
          submitLabel="Save Changes"
          contact={data}
          assignees={assignees}
        />
      </div>
    </div>
  );
}
