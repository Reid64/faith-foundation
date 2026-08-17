/**
 * FaithProof row and enum types.
 *
 * Hand-written rather than generated, so they must be kept in step with
 * supabase/migrations/*.sql. Every union below is the exact label list of the
 * corresponding Postgres enum — a value not in these lists will be rejected by
 * the database, not by TypeScript, so widen these only alongside a migration.
 */

export const TRANSACTION_TYPES = [
  "donation",
  "grant",
  "expense",
  "voucher_disbursement",
  "operational",
] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_STATUSES = [
  "pending",
  "confirmed",
  "reconciled",
  "voided",
] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const FUND_DESIGNATIONS = [
  "housing_voucher",
  "veterans",
  "recovery",
  "reentry",
  "operational",
  "unrestricted",
  // NOTE: 'financial_literacy' is also a valid enum label in the database, but
  // Financial Literacy was retired as a public program on 2026-08-14. It is
  // deliberately omitted from this list so it cannot be selected for NEW
  // records, while existing rows carrying it still render correctly via
  // FUND_LABELS below. Removing the label from the enum itself would break
  // those rows, so the enum is left alone.
  "financial_literacy",
  // Added in Phase 9 so historical Zeffy campaigns map without data loss.
  // single_parent_stability and emergency_bridge name RETIRED programs and are
  // excluded from SELECTABLE_FUNDS below, like financial_literacy.
  "single_parent_stability",
  "emergency_bridge",
  "cornerstone_communities",
] as const;
export type FundDesignation = (typeof FUND_DESIGNATIONS)[number];

/** Funds offered when creating a new record — excludes the retired program. */
const RETIRED_FUNDS: FundDesignation[] = [
  "financial_literacy",
  "single_parent_stability",
  "emergency_bridge",
];

export const SELECTABLE_FUNDS: FundDesignation[] = FUND_DESIGNATIONS.filter(
  (f) => !RETIRED_FUNDS.includes(f)
);

/**
 * THE SIX FUNDS A DONOR CAN ACTUALLY CHOOSE.
 *
 * Verified against the live Zeffy donation form on 2026-08-17. Earlier
 * documentation said ten. Ten is the size of the database enum, not the number
 * of options a donor is offered — the two had been conflated, and the ledger
 * inherited the confusion.
 *
 * The enum keeps all ten deliberately: three name programs retired on
 * 2026-08-14 and must stay so historical rows still render, and `operational`
 * is an internal designation for administrative money that has never appeared
 * on a donation form. So there are three different lists and they are not
 * interchangeable:
 *
 *   DONOR_FUNDS       — the six. Use wherever a GIFT is being designated.
 *   SELECTABLE_FUNDS  — the six plus `operational`, for internal records such
 *                       as expenses and grants, which are not donor gifts.
 *   FUND_DESIGNATIONS — all ten, for rendering rows that already exist.
 *
 * Order matches the Zeffy form, General Fund first.
 */
export const DONOR_FUNDS: FundDesignation[] = [
  "unrestricted",
  "housing_voucher",
  "veterans",
  "recovery",
  "reentry",
  "cornerstone_communities",
];

/**
 * The exact wording each fund carries on the Zeffy form, lowercased.
 *
 * This is the string a donor actually read before giving, so it is what an
 * email parser must match and what a receipt should echo back. If a fund is
 * renamed on the live form, rename it here in the same commit.
 */
export const ZEFFY_FUND_LABELS: Record<string, FundDesignation> = {
  "general fund": "unrestricted",
  "housing voucher program": "housing_voucher",
  "veterans path home": "veterans",
  "recovery housing": "recovery",
  "second chance reentry": "reentry",
  "cornerstone communities": "cornerstone_communities",
};

export const VOUCHER_STATUSES = [
  "pending",
  "approved",
  "disbursed",
  "expired",
  "cancelled",
] as const;
export type VoucherStatus = (typeof VOUCHER_STATUSES)[number];

export const PROMISE_STATUSES = [
  "active",
  "in_progress",
  "fulfilled",
  "missed",
  "revised",
] as const;
export type PromiseStatus = (typeof PROMISE_STATUSES)[number];

export const DOCUMENT_TYPES = [
  "irs_determination",
  "audit",
  "tax_return",
  "board_minutes",
  "financial_statement",
  "grant_award",
  "donor_receipt",
  "policy",
  "other",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const USER_ROLES = ["admin", "board", "staff", "public"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// ── Human-readable labels ───────────────────────────────────────────────────

/**
 * Display names.
 *
 * The six donor-facing funds are named EXACTLY as the Zeffy form names them,
 * because a donor who gave to "Veterans Path Home" should not have to work out
 * that the receipt saying "Veterans" means the same thing. `operational` is
 * marked internal so it is never mistaken for something a donor chose.
 */
export const FUND_LABELS: Record<FundDesignation, string> = {
  unrestricted: "General Fund",
  housing_voucher: "Housing Voucher Program",
  veterans: "Veterans Path Home",
  recovery: "Recovery Housing",
  reentry: "Second Chance Reentry",
  cornerstone_communities: "Cornerstone Communities",
  operational: "Operational (internal)",
  financial_literacy: "Financial Literacy (retired)",
  single_parent_stability: "Single Parent Stability (retired)",
  emergency_bridge: "Emergency Bridge (retired)",
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  donation: "Donation",
  grant: "Grant",
  expense: "Expense",
  voucher_disbursement: "Voucher Disbursement",
  operational: "Operational",
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  irs_determination: "IRS Determination Letter",
  audit: "Audit",
  tax_return: "Tax Return (990)",
  board_minutes: "Board Minutes",
  financial_statement: "Financial Statement",
  grant_award: "Grant Award",
  donor_receipt: "Donor Receipt",
  policy: "Policy",
  other: "Other",
};

export const PROMISE_STATUS_LABELS: Record<PromiseStatus, string> = {
  active: "Active",
  in_progress: "In Progress",
  fulfilled: "Fulfilled",
  missed: "Missed",
  revised: "Revised",
};

// ── Row shapes ──────────────────────────────────────────────────────────────

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount_cents: number;
  fund: FundDesignation;
  /**
   * True when the fund was inferred or defaulted rather than stated by the
   * donor. Shown as "unverified" in the admin so a default is never mistaken
   * for a designation. See migration 015.
   */
  fund_backfilled: boolean;
  description: string | null;
  donor_name: string | null;
  donor_email: string | null;
  donor_anonymous: boolean;
  reference_number: string | null;
  zeffy_transaction_id: string | null;
  zeffy_campaign: string | null;
  transaction_date: string;
  confirmed_at: string | null;
  confirmed_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  is_public: boolean;
};

export type Voucher = {
  id: string;
  voucher_number: string;
  status: VoucherStatus;
  amount_cents: number;
  fund: FundDesignation;
  recipient_name: string | null;
  recipient_anonymous: boolean;
  program: string | null;
  approved_at: string | null;
  disbursed_at: string | null;
  approved_by: string | null;
  transaction_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Promise_ = {
  id: string;
  title: string;
  description: string | null;
  status: PromiseStatus;
  target_date: string | null;
  fulfilled_date: string | null;
  proof_url: string | null;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProofDocument = {
  id: string;
  title: string;
  type: DocumentType;
  description: string | null;
  storage_path: string | null;
  external_url: string | null;
  is_public: boolean;
  verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditLogEntry = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_value: unknown;
  new_value: unknown;
  ip_address: string | null;
  created_at: string;
  /** Populated by PostgREST embedding on audit_log.actor_id → profiles.id. */
  actor?: { full_name: string | null; email: string } | null;
};

/** What every FaithProof server action returns on failure. */
export type ActionResult = { error: string } | void;
