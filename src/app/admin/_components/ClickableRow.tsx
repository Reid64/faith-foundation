"use client";

import { useRouter } from "next/navigation";
import { TABLE_ROW_LINK } from "./ui";

/**
 * A table row that navigates when clicked.
 *
 * The click handler is a convenience for pointer users only. Every clickable
 * row ALSO renders a real <Link> around its first cell's value, which is what
 * keyboard and screen-reader users actually use — a bare `onClick` on a <tr>
 * is invisible to both.
 */
export function ClickableRow({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <tr
      className={TABLE_ROW_LINK}
      onClick={(event) => {
        // Let a real link inside the row handle its own navigation.
        if ((event.target as HTMLElement).closest("a")) return;
        router.push(href);
      }}
    >
      {children}
    </tr>
  );
}
