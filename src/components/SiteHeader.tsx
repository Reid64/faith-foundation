"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { isInternalRoute } from "@/lib/chrome";

const ABOUT_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/team", label: "Team" },
  { href: "/financial-transparency", label: "Financial Transparency" },
  { href: "/governance", label: "Governance" },
];

const NAV_LINKS = [
  { href: "/programs", label: "Programs" },
  { href: "/cornerstone", label: "Cornerstone" },
  { href: "/impact", label: "Impact" },
  { href: "/events", label: "Events" },
  { href: "/faithproof", label: "Transparency" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setAboutOpen(false);
  }, [pathname]);

  // Escape closes whichever menu is open and is the expected way out of a
  // dropdown for keyboard and screen-reader users. Without it the About menu
  // could only be dismissed by clicking its trigger again.
  useEffect(() => {
    if (!open && !aboutOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setAboutOpen(false);
      setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, aboutOpen]);

  const solid = scrolled || open;

  const aboutActive =
    pathname.startsWith("/about") ||
    pathname === "/team" ||
    pathname === "/financial-transparency" ||
    pathname === "/governance";

  // The FaithProof admin area is an internal tool with its own shell — it must
  // not carry the public marketing navigation. Placed after every hook so the
  // hook order stays identical on all routes.
  if (isInternalRoute(pathname)) return null;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-white transition-shadow duration-300 ${
        solid ? "shadow-[0_6px_24px_-14px_rgba(0,0,0,0.45)]" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-0 sm:px-8">
        <Link href="/" className="group flex items-center" aria-label="FAITH Foundation home">
          <Image
            src="/Images/faith-foundation-logo.webp"
            alt="FAITH Foundation logo"
            width={300}
            height={200}
            priority
            className="h-20 w-auto transition-transform duration-300 group-hover:scale-105 sm:h-24 lg:h-28"
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          <div
            className="relative"
            style={{ paddingBottom: "8px" }}
            onMouseEnter={() => {
              if (closeTimer.current) clearTimeout(closeTimer.current);
              setAboutOpen(true);
            }}
            onMouseLeave={() => {
              closeTimer.current = setTimeout(() => setAboutOpen(false), 120);
            }}
          >
            <button
              type="button"
              aria-expanded={aboutOpen}
              aria-haspopup="true"
              aria-controls="about-menu"
              onClick={() => setAboutOpen((v) => !v)}
              className={`relative inline-flex items-center gap-1 text-sm font-semibold tracking-wide transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:bg-green after:transition-all after:duration-300 hover:text-green ${
                aboutActive
                  ? "text-green after:w-full"
                  : "text-charcoal after:w-0 hover:after:w-full"
              }`}
            >
              About
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path d="M3 5l3 3 3-3" />
              </svg>
            </button>

            {aboutOpen && (
              <div
                id="about-menu"
                className="absolute left-0 top-full z-50 -mt-2 min-w-[200px] rounded-xl border border-black/10 bg-white py-2 shadow-lg"
              >
                {ABOUT_LINKS.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setAboutOpen(false)}
                      className={`block px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5 hover:text-green ${
                        active ? "text-green" : "text-charcoal"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            href="/team"
            className={`relative text-sm font-semibold tracking-wide transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:bg-green after:transition-all after:duration-300 hover:text-green ${
              pathname === "/team"
                ? "text-green after:w-full"
                : "text-charcoal after:w-0 hover:after:w-full"
            }`}
          >
            Team
          </Link>

          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-semibold tracking-wide transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:bg-green after:transition-all after:duration-300 hover:text-green ${
                  active
                    ? "text-green after:w-full"
                    : "text-charcoal after:w-0 hover:after:w-full"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {/* Apply sits beside Donate, not in the nav row: the two audiences
              the site serves are people who want to give and people who need
              help, and the second should not have to hunt through Programs. */}
          <Link
            href="/apply"
            className="rounded-full border-2 border-green px-5 py-2 text-sm font-bold text-green transition-all duration-300 hover:bg-green hover:text-white"
          >
            Apply
          </Link>
          <Link
            href="/donate"
            className="rounded-full bg-green px-6 py-2.5 text-sm font-bold text-white shadow-green ring-1 ring-gold/50 transition-all duration-300 hover:bg-green-dark hover:ring-2 hover:ring-gold hover:shadow-lg"
          >
            Donate
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-charcoal lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <span className="relative block h-5 w-6">
            <span
              className={`absolute left-0 block h-0.5 w-6 bg-current transition-all duration-300 ${
                open ? "top-2 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-2 block h-0.5 w-6 bg-current transition-all duration-300 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 block h-0.5 w-6 bg-current transition-all duration-300 ${
                open ? "top-2 -rotate-45" : "top-4"
              }`}
            />
          </span>
        </button>
      </div>

      {/* `invisible` when collapsed, not just `max-h-0`: height alone still
          leaves every link in the tab order, so a keyboard user tabbing from
          the menu button fell into ten links they could not see. visibility
          removes them from the tab order while keeping the height transition. */}
      <div
        id="mobile-menu"
        aria-hidden={!open}
        className={`overflow-hidden border-t border-black/10 bg-white transition-[max-height] duration-300 lg:hidden ${
          open ? "max-h-[36rem] visible" : "max-h-0 invisible"
        }`}
      >
        <nav aria-label="Mobile" className="flex flex-col px-6 py-4">
          <p className="pt-2 pb-1 text-xs font-bold uppercase tracking-widest text-charcoal/50">
            About
          </p>
          {ABOUT_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-b border-black/5 py-3 pl-3 text-sm font-semibold text-charcoal transition-colors hover:text-green"
            >
              {link.label}
            </Link>
          ))}
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-b border-black/5 py-3 text-sm font-semibold text-charcoal transition-colors hover:text-green"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/apply"
            className="mt-4 rounded-full border-2 border-green px-6 py-3 text-center text-sm font-bold text-green"
          >
            Apply
          </Link>
          <Link
            href="/donate"
            className="mt-2 rounded-full bg-green px-6 py-3 text-center text-sm font-bold text-white"
          >
            Donate
          </Link>
        </nav>
      </div>
    </header>
  );
}