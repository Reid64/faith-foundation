/**
 * Inline SVG icons for the FaithProof admin UI.
 *
 * All stroke-based and inheriting `currentColor`, so a parent's text colour
 * drives them. Default 16x16 to match the sidebar spec; pass `className` with a
 * size utility to override.
 */

type IconProps = {
  className?: string;
};

function Svg({
  className = "h-4 w-4",
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Dashboard — grid. */
export function GridIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Svg>
  );
}

/** Transactions — opposing arrows. */
export function ArrowsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 4v16" />
      <path d="M3.5 7.5 7 4l3.5 3.5" />
      <path d="M17 20V4" />
      <path d="M13.5 16.5 17 20l3.5-3.5" />
    </Svg>
  );
}

/** Vouchers — ticket. */
export function TicketIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 8.5V7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v1.5a2.5 2.5 0 0 0 0 5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3.5a2.5 2.5 0 0 0 0-5Z" />
      <path d="M14 6v12" strokeDasharray="2 2.5" />
    </Svg>
  );
}

/** Promises — check in a circle. */
export function CheckCircleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </Svg>
  );
}

/** Proof Vault — shield. */
export function ShieldIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3 5 6v5.5c0 4.2 2.9 7.6 7 9.5 4.1-1.9 7-5.3 7-9.5V6l-7-3Z" />
    </Svg>
  );
}

/** Proof Vault — shield with a check, for verified documents. */
export function ShieldCheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3 5 6v5.5c0 4.2 2.9 7.6 7 9.5 4.1-1.9 7-5.3 7-9.5V6l-7-3Z" />
      <path d="m9 12 2 2 4-4.5" />
    </Svg>
  );
}

/** Audit Log — list. */
export function ListIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </Svg>
  );
}

/** Requires Attention — warning triangle. */
export function WarningIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10.3 4.3 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9.5v4" />
      <path d="M12 17h.01" />
    </Svg>
  );
}

/** Recent Activity — clock. */
export function ClockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 1.8" />
    </Svg>
  );
}

/** Empty states — info. */
export function InfoIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 7.8h.01" />
    </Svg>
  );
}

/** All-clear — bare check. */
export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 6 9 17l-5-5" strokeWidth={2.4} />
    </Svg>
  );
}

/** Add buttons — plus. */
export function PlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" strokeWidth={2} />
    </Svg>
  );
}

/** External links. */
export function ExternalLinkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 14.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4.5" />
    </Svg>
  );
}

/** Back links. */
export function ArrowLeftIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </Svg>
  );
}

/** Money stat tile. */
export function DollarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3v18" />
      <path d="M16.5 7.5A3.5 3.5 0 0 0 13 5h-1.5a3 3 0 0 0 0 6h1a3 3 0 0 1 0 6H11a3.5 3.5 0 0 1-3.5-2.5" />
    </Svg>
  );
}
