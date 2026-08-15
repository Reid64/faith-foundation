import { Badge, type BadgeTone } from "./ui";
import { humanizeEnum } from "@/lib/faithproof/format";
import type {
  DocumentType,
  PromiseStatus,
  TransactionStatus,
  TransactionType,
  VoucherStatus,
} from "@/lib/faithproof/types";
import {
  DOCUMENT_TYPE_LABELS,
  PROMISE_STATUS_LABELS,
  TRANSACTION_TYPE_LABELS,
} from "@/lib/faithproof/types";

/**
 * Enum → badge colour maps, in one place so a status can never be amber on one
 * page and grey on another.
 *
 * Each map is keyed by the full enum, so adding a label to a Postgres enum
 * without updating these becomes a TypeScript error rather than an
 * invisible fallback to grey.
 */

const TRANSACTION_STATUS_TONES: Record<TransactionStatus, BadgeTone> = {
  pending: "amber",
  confirmed: "green",
  reconciled: "blue",
  voided: "gray",
};

const TRANSACTION_TYPE_TONES: Record<TransactionType, BadgeTone> = {
  donation: "green",
  expense: "red",
  voucher_disbursement: "purple",
  grant: "blue",
  operational: "gray",
};

const VOUCHER_STATUS_TONES: Record<VoucherStatus, BadgeTone> = {
  pending: "amber",
  approved: "blue",
  disbursed: "green",
  expired: "gray",
  cancelled: "red",
};

const PROMISE_STATUS_TONES: Record<PromiseStatus, BadgeTone> = {
  active: "blue",
  fulfilled: "green",
  in_progress: "amber",
  missed: "red",
  revised: "gray",
};

export function TransactionStatusBadge({
  status,
}: {
  status: TransactionStatus;
}) {
  return (
    <Badge tone={TRANSACTION_STATUS_TONES[status] ?? "gray"}>
      {humanizeEnum(status)}
    </Badge>
  );
}

export function TransactionTypeBadge({ type }: { type: TransactionType }) {
  return (
    <Badge tone={TRANSACTION_TYPE_TONES[type] ?? "gray"}>
      {TRANSACTION_TYPE_LABELS[type] ?? humanizeEnum(type)}
    </Badge>
  );
}

export function VoucherStatusBadge({ status }: { status: VoucherStatus }) {
  return (
    <Badge tone={VOUCHER_STATUS_TONES[status] ?? "gray"}>
      {humanizeEnum(status)}
    </Badge>
  );
}

export function PromiseStatusBadge({ status }: { status: PromiseStatus }) {
  return (
    <Badge tone={PROMISE_STATUS_TONES[status] ?? "gray"}>
      {PROMISE_STATUS_LABELS[status] ?? humanizeEnum(status)}
    </Badge>
  );
}

export function DocumentTypeBadge({ type }: { type: DocumentType }) {
  return (
    <Badge tone="blue">{DOCUMENT_TYPE_LABELS[type] ?? humanizeEnum(type)}</Badge>
  );
}
