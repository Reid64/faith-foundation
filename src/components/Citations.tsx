/** Small inline citation pill linking to a source. The label is a short
 *  source abbreviation (e.g. "BJS", "NAR", "PPI") — never a number. */
export function Cite({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center ml-1 text-[10px] font-semibold bg-[#1B2A4A]/10 text-[#1B2A4A] px-1.5 py-0.5 rounded-full hover:bg-[#C8A951]/30 transition-colors no-underline align-super"
    >
      {label}
    </a>
  );
}
