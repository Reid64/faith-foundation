"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/board", label: "Overview", exact: true },
  { href: "/admin/board/meetings", label: "Meetings" },
  { href: "/admin/board/votes", label: "Votes" },
  { href: "/admin/board/financials", label: "Financials" },
];

/** Secondary nav shown across every board portal page. */
export function BoardNav() {
  const pathname = usePathname();
  const current = pathname?.replace(/\/+$/, "") || "/admin/board";

  return (
    <nav
      aria-label="Board sections"
      className="mb-6 flex flex-wrap gap-1 rounded-xl p-1"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(1,62,55,0.1)",
      }}
    >
      {LINKS.map((l) => {
        const active = l.exact
          ? current === l.href
          : current === l.href || current.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className="rounded-lg px-4 py-2 text-sm font-medium transition"
            style={
              active
                ? { backgroundColor: "#013e37", color: "#ffefb3" }
                : { color: "#6b7280" }
            }
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
