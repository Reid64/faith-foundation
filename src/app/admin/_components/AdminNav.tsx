"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowsIcon,
  BankIcon,
  CheckCircleIcon,
  GridIcon,
  GearIcon,
  HandIcon,
  ListIcon,
  ShieldIcon,
  TicketIcon,
  TrophyIcon,
  UsersIcon,
} from "./icons";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: GridIcon },
  { href: "/admin/crm", label: "CRM", Icon: UsersIcon },
  { href: "/admin/transactions", label: "Transactions", Icon: ArrowsIcon },
  { href: "/admin/vouchers", label: "Vouchers", Icon: TicketIcon },
  { href: "/admin/promises", label: "Promises", Icon: CheckCircleIcon },
  { href: "/admin/grants", label: "Grants", Icon: TrophyIcon },
  { href: "/admin/volunteers", label: "Volunteers", Icon: HandIcon },
  { href: "/admin/proof-vault", label: "Proof Vault", Icon: ShieldIcon },
  { href: "/admin/board", label: "Board", Icon: BankIcon },
  { href: "/admin/audit-log", label: "Audit Log", Icon: ListIcon },
  { href: "/admin/settings", label: "Settings", Icon: GearIcon },
];

/**
 * Sidebar navigation.
 *
 * A client component purely so it can read `usePathname()` for the active
 * state — the layout that renders it stays a server component and keeps doing
 * the auth check on the server.
 */
export function AdminNav() {
  const pathname = usePathname();

  // `trailingSlash: true` means routes arrive as "/admin/vouchers/", so compare
  // on a normalised path. Dashboard matches only itself; every other entry also
  // matches its child routes so /admin/transactions/new keeps Transactions lit.
  const current = pathname?.replace(/\/+$/, "") || "/admin";

  return (
    <nav aria-label="FaithProof sections" className="flex-1 px-3 py-4">
      <ul className="space-y-0.5">
        {NAV.map(({ href, label, Icon }) => {
          const active =
            href === "/admin"
              ? current === "/admin"
              : current === href || current.startsWith(`${href}/`);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md border-l-[3px] px-3 py-2 text-sm transition ${
                  active
                    ? "border-[#ffefb3] bg-[rgba(255,239,179,0.15)] font-medium text-[#ffefb3]"
                    : "border-transparent text-[rgba(255,239,179,0.6)] hover:bg-[rgba(255,239,179,0.08)] hover:text-[#ffefb3]"
                }`}
              >
                <Icon
                  className="h-4 w-4 shrink-0"
                  style={{ color: active ? "#ffefb3" : "rgba(255,239,179,0.5)" }}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
