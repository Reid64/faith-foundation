import {
  DONOR_FUNDS,
  ZEFFY_FUND_LABELS,
  type FundDesignation,
} from "./types";

/**
 * Turning what Zeffy says into the fund a gift belongs to.
 *
 * One implementation, shared by the Zapier webhook and by anything that reads
 * donation notification emails. Two copies of this logic would drift, and the
 * drift would show up as money in the wrong fund — which is the one class of
 * bug this organisation's whole public promise depends on not having.
 */

/**
 * Fragments that identify a fund, on top of the six exact form labels.
 *
 * Fallbacks for campaign names typed by hand or carried over from an older
 * form. The three retired programs appear ONLY so a historical replay lands on
 * the fund it was actually given to rather than silently becoming a General
 * Fund gift; nothing new is ever designated to them.
 */
const FUND_FRAGMENTS: Record<string, FundDesignation> = {
  "housing voucher": "housing_voucher",
  "down payment": "housing_voucher",
  housing: "housing_voucher",
  "veterans path": "veterans",
  veterans: "veterans",
  veteran: "veterans",
  "recovery housing": "recovery",
  recovery: "recovery",
  "second chance": "reentry",
  reentry: "reentry",
  "re-entry": "reentry",
  cornerstone: "cornerstone_communities",
  "general fund": "unrestricted",
  general: "unrestricted",
  unrestricted: "unrestricted",
  "where needed most": "unrestricted",

  // Retired programs — historical replays only.
  "single parent": "single_parent_stability",
  "emergency bridge": "emergency_bridge",
  emergency: "emergency_bridge",
  "financial literacy": "financial_literacy",
};

/** Every recognised phrase, longest first. */
const MATCHERS: [string, FundDesignation][] = Object.entries({
  ...FUND_FRAGMENTS,
  ...ZEFFY_FUND_LABELS,
}).sort((a, b) => b[0].length - a[0].length);

export type FundMatch = {
  fund: FundDesignation;
  /**
   * False when nothing in the text was recognised and the General Fund was
   * assumed. Callers should record this rather than presenting the fund as a
   * donor's choice — see `transactions.fund_backfilled`.
   */
  matched: boolean;
  /** The phrase that decided it, for the audit trail. */
  via: string | null;
};

/**
 * Match the longest recognised phrase, not the first.
 *
 * Order of definition used to decide this, which meant "Second Chance Reentry"
 * could be captured by the bare "reentry" fragment if someone added it above.
 * Sorting by length makes the specific label always win over the fragment
 * inside it, whatever order the table is written in.
 */
export function mapCampaignToFund(text: string | null | undefined): FundMatch {
  const lower = (text ?? "").toLowerCase().trim();
  if (!lower) return { fund: "unrestricted", matched: false, via: null };

  for (const [phrase, fund] of MATCHERS) {
    if (lower.includes(phrase)) return { fund, matched: true, via: phrase };
  }
  return { fund: "unrestricted", matched: false, via: null };
}

/** Is this a fund a donor could actually have chosen? */
export function isDonorFund(fund: string): fund is FundDesignation {
  return (DONOR_FUNDS as string[]).includes(fund);
}
