"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowsIcon,
  CheckCircleIcon,
  GridIcon,
  ListIcon,
  ShieldIcon,
  TicketIcon,
} from "./icons";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: GridIcon },
  { href: "/admin/transactions", label: "Transactions", Icon: ArrowsIcon },
  { href: "/admin/vouchers", label: "Vouchers", Icon: TicketIcon },
  { href: "/admin/promises", label: "Promises", Icon: CheckCircleIcon },
  { href: "/admin/proof-vault", label: "Proof Vault", Icon: ShieldIcon },
  { href: "/admin/audit-log", label: "Audit Log", Icon: ListIcon },
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
                className={`flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm transition ${
                  active
                    ? "border-[#4A7C59] bg-[#1e293b] font-medium text-white"
                    : "border-transparent text-[#94a3b8] hover:bg-[#1e293b]/50 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
