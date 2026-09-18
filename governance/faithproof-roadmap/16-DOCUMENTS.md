# Phase 16 — Document Generation Engine

## Objective
One-click generation of branded PDF documents: voucher award letters, denial letters, donor receipts, board resolutions, impact reports. All logged to audit trail.

## Library
Use @react-pdf/renderer for PDF generation in Next.js server actions.

## Document Types

### Voucher Award Letter
Recipient name and address
FAITH Foundation letterhead (logo, address, EIN)
Award details: voucher number, amount, program, conditions
Signature block — the officer holding signing authority (see note 7)
Generated from voucher record

### Denial Letter
Applicant name and address
Letterhead
Respectful denial language with reason
Appeal process explanation
Signature block — the officer holding signing authority (see note 7)

### Donor Impact Receipt
Donor name and address
Letterhead
Giving summary: all confirmed donations in period, totals by fund
Impact statement: how their designated fund was used
Tax deductibility statement with EIN 33-2640449
Signature block — the officer holding signing authority (see note 7)

### Board Resolution
Resolution number and date
Meeting reference
Resolution text (entered by admin)
Board member signature lines
Attestation by Juan Valdez as Secretary

### Annual Impact Report
Cover page with FAITH Foundation branding
Year in review stats: donations received, vouchers disbursed, families served
Fund-by-fund breakdown
Promises kept section
Board certification

## Pages

### /admin/documents/generate — Document Generator
Select document type
Select record to generate from (voucher, contact, meeting, or date range)
Preview rendered PDF
Download button
"Save to Proof Vault" button — saves to proof_documents table

## Database
Add generated_document_path TEXT to vouchers, contacts, applications tables
New table: generated_documents (id, type, record_id, record_type, storage_path, generated_by, generated_at)

## Build-time notes (added at spec creation, not part of the original brief)

1. **A tax receipt is a legal document — every figure must come from confirmed
   data.** Donor receipts state deductible amounts under EIN 33-2640449. Only
   `status = 'confirmed'` transactions may be summed; including pending rows
   would overstate a donor's deduction. The receipt should also carry the
   standard no-goods-or-services statement.
2. **Anonymity must survive into PDFs.** `donor_anonymous` and
   `recipient_anonymous` mean the name was discarded at write time (stored
   NULL), so award letters and receipts must handle a missing name rather than
   render "null" — and must never reintroduce a name from another source.
3. **"Save to Proof Vault" writes to `proof_documents`, whose public policy is
   `is_public AND verified`.** Default generated documents to
   `is_public = false, verified = false`. An award or denial letter naming a
   family must never land on the public transparency page.
4. **Signature blocks are printed names, not signatures.** Rendering a name
   under a signature line is a name block; do not describe the output as signed
   or executed.
5. **Storage bucket must be private** with signed URLs — same reasoning as the
   applicant documents in Phase 13.
6. **@react-pdf/renderer is heavy.** Keep it out of client bundles: import only
   inside server actions or route handlers. Shared dependency with Phase 12.

7. **DO NOT HARD-CODE A SIGNATORY — added 2026-09-18.** This spec originally
   named "Ron Landers" on the award letter, denial letter and donor receipt.
   That officer resigned on 2026-09-18 and the office of President and Executive
   Director is **vacant**; the name has been removed from this spec so that
   building Phase 16 later cannot put a resigned officer's name on an outgoing
   legal document. When this phase is built, read the signatory from the board
   roster (`src/lib/board.ts`) or from a setting, never from a literal in the
   template — and handle the case where the office is vacant rather than
   rendering a blank or a placeholder. A document that must carry the
   President's name cannot be generated while the office is unfilled; refuse to
   generate it and say why. The Board Resolution template is unaffected: its
   attestation is by the Secretary, which is filled.
