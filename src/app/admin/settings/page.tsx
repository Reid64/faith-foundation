import type { Metadata } from "next";
import { PageHeader, Panel, Badge } from "../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import {
  exportAuditLog,
  exportTransactions,
  exportVouchers,
  updateSetting,
} from "./actions";
import {
  ExportButton,
  ResetPasswordButton,
  SettingToggle,
} from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const ORG = [
  ["Legal name", "Foundation for Affordable Instruction and Tenancy Hope"],
  ["EIN", "33-2640449"],
  ["Address", "209 Surecast Drive, Suite 105, Burnet, Texas 78611"],
  ["Website", "faithfoundationsf.org"],
  ["Phone", "888-497-6620"],
  ["Email", "info@faithfoundationsf.org"],
];

const TOGGLES: { key: string; label: string; description: string }[] = [
  {
    key: "show_accountability_pulse",
    label: "Show Accountability Pulse",
    description: "The live stewardship snapshot of funds received and directed.",
  },
  {
    key: "show_open_ledger",
    label: "Show Open Mission Ledger",
    description: "The public table of confirmed transactions.",
  },
  {
    key: "show_promises",
    label: "Show Promises vs Performance",
    description: "Public commitments and whether they were kept.",
  },
  {
    key: "show_proof_vault",
    label: "Show Proof Vault",
    description: "Verified, publicly readable documents.",
  },
  {
    key: "show_nothing_hidden",
    label: "Show Nothing Hidden Disclosure",
    description: "The programs-versus-overhead breakdown.",
  },
];

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h2 style={{ color: "#013e37", fontSize: 16, fontWeight: 600 }}>
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-0.5" style={{ color: "#6b7280", fontSize: 13 }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return null;

  const { data: settingsRows } = await session.supabase
    .from("settings")
    .select("key, value");

  const current = new Map<string, boolean>();
  for (const row of settingsRows ?? []) {
    current.set((row as { key: string }).key, (row as { value: unknown }).value === true);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Settings"
        description="Organization details, your account, what the public page shows, and data exports."
      />

      <div className="space-y-6">
        {/* CARD 1 — Organization */}
        <Panel className="p-6">
          <SectionHeading
            title="Organization Info"
            subtitle="Read-only. These values also appear in the site's structured data and footer."
          />
          <dl>
            {ORG.map(([label, value]) => (
              <div
                key={label}
                className="flex flex-wrap items-center justify-between gap-4 py-2.5"
                style={{ borderBottom: "1px solid #f0f0ef" }}
              >
                <dt style={{ color: "#6b7280", fontSize: 13 }}>{label}</dt>
                <dd
                  className="text-right"
                  style={{ color: "#374151", fontSize: 14, fontWeight: 500 }}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </Panel>

        {/* CARD 2 — Account */}
        <Panel className="p-6">
          <SectionHeading title="Account" />
          <div
            className="flex flex-wrap items-center justify-between gap-4 py-2.5"
            style={{ borderBottom: "1px solid #f0f0ef" }}
          >
            <dt style={{ color: "#6b7280", fontSize: 13 }}>Signed in as</dt>
            <dd style={{ color: "#374151", fontSize: 14, fontWeight: 500 }}>
              {session.email}
            </dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 py-2.5">
            <dt style={{ color: "#6b7280", fontSize: 13 }}>Role</dt>
            <dd>
              <Badge tone={session.isAdmin ? "green" : "gray"}>
                {session.profile?.role ?? "no profile"}
              </Badge>
            </dd>
          </div>
          <ResetPasswordButton email={session.email} />
        </Panel>

        {/* CARD 3 — Public transparency */}
        <Panel className="p-6">
          <SectionHeading
            title="Public Transparency Settings"
            subtitle="Control what appears on your public /faithproof page. Changes save immediately."
          />
          {!session.isAdmin ? (
            <p
              className="mb-3 rounded-lg px-3 py-2 text-xs"
              style={{
                backgroundColor: "#fffbeb",
                color: "#d97706",
                border: "1px solid #fde68a",
              }}
            >
              Only administrators can change these. Your role is{" "}
              {session.profile?.role ?? "unknown"}, so saving will be refused.
            </p>
          ) : null}
          {TOGGLES.map((t) => (
            <SettingToggle
              key={t.key}
              settingKey={t.key}
              label={t.label}
              description={t.description}
              initial={current.get(t.key) ?? true}
              save={updateSetting}
            />
          ))}
        </Panel>

        {/* CARD 4 — Data export */}
        <Panel className="p-6">
          <SectionHeading
            title="Data Export"
            subtitle="Download the underlying records as CSV. Exports respect your role — you receive exactly the rows you are allowed to read."
          />
          <div className="flex flex-wrap gap-3">
            <ExportButton
              label="Export All Transactions (CSV)"
              run={exportTransactions}
            />
            <ExportButton
              label="Export All Vouchers (CSV)"
              run={exportVouchers}
            />
            <ExportButton
              label="Export Audit Log (CSV)"
              run={exportAuditLog}
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
