import type { Metadata } from "next";
import Link from "next/link";
import {
  BankIcon,
  CheckCircleIcon,
  ClockIcon,
  DollarIcon,
  InfoIcon,
  TicketIcon,
} from "../_components/icons";
import {
  Badge,
  DarkPanel,
  EmptyState,
  PageHeader,
  Panel,
  PanelHeader,
  StatCard,
} from "../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import { formatCentsCompact, formatDateOnly } from "@/lib/faithproof/format";
import { VOTE_TONES } from "@/lib/faithproof/board";
import { BoardNav } from "./BoardNav";

export const metadata: Metadata = {
  title: "Board Portal | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

function todayISO(): string {
  const n = new Date();
  const p = (x: number) => String(x).padStart(2, "0");
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
}

export default async function BoardPage() {
  const session = await getSession();
  if (!session) return null;
  const sb = session.supabase;
  const today = todayISO();
  const yearStart = `${new Date().getFullYear()}-01-01`;

  const [meetings, passed, upcoming, recentVotes, donations, disbursed] =
    await Promise.all([
      sb.from("board_meetings").select("*", { count: "exact", head: true }),
      sb.from("board_votes").select("*", { count: "exact", head: true }).eq("result", "passed"),
      sb
        .from("board_meetings")
        .select("*")
        .gte("meeting_date", today)
        .order("meeting_date", { ascending: true })
        .limit(3),
      sb.from("board_votes").select("*").order("created_at", { ascending: false }).limit(5),
      sb
        .from("transactions")
        .select("amount_cents, type")
        .eq("status", "confirmed")
        .gte("transaction_date", yearStart),
      sb
        .from("vouchers")
        .select("*", { count: "exact", head: true })
        .eq("status", "disbursed"),
    ]);

  const rows = (donations.data ?? []) as { amount_cents: number; type: string }[];
  const received = rows
    .filter((r) => r.type === "donation" || r.type === "grant")
    .reduce((n, r) => n + (r.amount_cents ?? 0), 0);
  const spent = rows
    .filter((r) => r.type === "voucher_disbursement" || r.type === "expense" || r.type === "operational")
    .reduce((n, r) => n + (r.amount_cents ?? 0), 0);
  const overhead = rows
    .filter((r) => r.type === "operational")
    .reduce((n, r) => n + (r.amount_cents ?? 0), 0);
  const overheadPct = spent > 0 ? (overhead / spent) * 100 : 0;

  const upcomingRows = (upcoming.data ?? []) as {
    id: string;
    meeting_date: string;
    type: string;
    agenda: string | null;
  }[];
  const voteRows = (recentVotes.data ?? []) as {
    id: string;
    motion: string;
    result: string;
    meeting_id: string;
  }[];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Board Portal"
        description="Minutes, votes and financials for FAITH Foundation directors."
      />
      <BoardNav />

      <div
        className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        style={{ position: "relative", zIndex: 10 }}
      >
        <StatCard
          label="Total meetings"
          value={meetings.error ? "—" : (meetings.count ?? 0)}
          icon={<BankIcon className="h-4 w-4" />}
        />
        <StatCard
          label="Motions passed"
          value={passed.error ? "—" : (passed.count ?? 0)}
          icon={<CheckCircleIcon className="h-4 w-4" />}
        />
        <StatCard
          label="Received YTD"
          value={donations.error ? "—" : formatCentsCompact(received)}
          icon={<DollarIcon className="h-4 w-4" />}
        />
        <StatCard
          label="Vouchers disbursed"
          value={disbursed.error ? "—" : (disbursed.count ?? 0)}
          icon={<TicketIcon className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <DarkPanel>
          <PanelHeader
            icon={<ClockIcon className="h-5 w-5" />}
            iconColor="#fbbf24"
            title="Upcoming Meetings"
            subtext="Scheduled on or after today"
          />
          {upcomingRows.length === 0 ? (
            <EmptyState
              onDarkPanel
              icon={<InfoIcon className="h-5 w-5" />}
              title="No meetings scheduled"
              detail="Add one from the Meetings tab."
            />
          ) : (
            <ul style={{ borderColor: "rgba(255,239,179,0.1)" }} className="divide-y">
              {upcomingRows.map((m) => (
                <li key={m.id} className="py-3 first:pt-0">
                  <Link href={`/admin/board/meetings/${m.id}`} className="block">
                    <span className="text-sm font-medium" style={{ color: "#ffefb3" }}>
                      {formatDateOnly(m.meeting_date)} · {m.type}
                    </span>
                    <span
                      className="mt-0.5 block text-xs"
                      style={{ color: "rgba(255,239,179,0.6)" }}
                    >
                      {m.agenda ? m.agenda.slice(0, 90) : "No agenda recorded"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DarkPanel>

        <Panel className="p-6">
          <h2 className="mb-4" style={{ color: "#013e37", fontSize: 16, fontWeight: 600 }}>
            Recent Votes
          </h2>
          {voteRows.length === 0 ? (
            <EmptyState
              icon={<InfoIcon className="h-5 w-5" />}
              title="No votes recorded"
              detail="Votes are added from a meeting record."
            />
          ) : (
            <ul className="divide-y divide-[#f0f0ef]">
              {voteRows.map((v) => (
                <li key={v.id} className="py-3 first:pt-0">
                  <Link href={`/admin/board/meetings/${v.meeting_id}`} className="block">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm" style={{ color: "#374151" }}>
                        {v.motion.slice(0, 80)}
                      </span>
                      <Badge tone={VOTE_TONES[v.result] ?? "gray"}>{v.result}</Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="p-6">
          <h2 className="mb-4" style={{ color: "#013e37", fontSize: 16, fontWeight: 600 }}>
            Financial Snapshot
          </h2>
          <dl>
            {[
              ["Received YTD", formatCentsCompact(received)],
              ["Spent YTD", formatCentsCompact(spent)],
              ["Overhead rate", `${overheadPct.toFixed(1)}%`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5"
                style={{ borderBottom: "1px solid #f0f0ef" }}
              >
                <dt style={{ color: "#6b7280", fontSize: 13 }}>{label}</dt>
                <dd style={{ color: "#013e37", fontSize: 16, fontWeight: 700 }}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-relaxed" style={{ color: "#9ca3af" }}>
            Live from confirmed transactions — no separate data entry. Overhead
            is operational spend as a share of all spend.
          </p>
          <Link
            href="/admin/board/financials"
            className="mt-3 inline-block text-sm font-semibold"
            style={{ color: "#013e37" }}
          >
            Full financials →
          </Link>
        </Panel>
      </div>
    </div>
  );
}
