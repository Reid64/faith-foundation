# faith-foundation — SCHEMA REGISTRY

> **Regenerated 2026-08-18 from the live database.** This replaces the FORGE 2.0
> scaffolding of 2026-06-12, which claimed 0 tables against 15 applied
> migrations and had been carrying a drift notice ever since.

## How this was produced, and what you can trust

| Section | Source | Live? |
| --- | --- | --- |
| Tables, views, columns, types, defaults, enums, PKs, FKs | PostgREST schema description of the running project, read with the service role | **Yes** |
| RPC functions | Same | **Yes** |
| Indexes, RLS policies | Parsed from `supabase/migrations/*.sql` | No — repo source of truth |
| Row counts | Not collected | n/a |

Indexes and policies are not exposed over PostgREST, so they are read from the
migrations rather than invented. Where the two could disagree — a policy changed
by hand in the dashboard, say — the migrations are what this file reports, and
that limitation is stated here rather than hidden.

**Read-only.** Nothing was created, altered or dropped to produce this document.

## Database

- **Tables:** 27
- **Views:** 3 (`account_balances`, `cornerstone_milestones_public`, `cornerstone_projects_public`)
- **Enum types:** 16
- **RPC functions exposed:** 7
- **Migrations applied:** 15
- **RLS policies (from migrations):** 52
- **Indexes (from migrations):** 23

### The role helper

Policies in this project must never subquery `profiles` directly — that
recurses through `profiles`' own policies. They call the
`current_user_role()` SECURITY DEFINER helper introduced in migration 002:

```sql
USING (current_user_role() IN ('admin','board','staff'))
WITH CHECK (current_user_role() IN ('admin','board','staff'))
```

## Tables

### `accounts`

1 RLS policy, 0 indexes (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `code` | text | yes |  |  |
| `name` | text | yes |  |  |
| `type` | account_type (enum) | yes |  | enum: `asset`, `liability`, `equity`, `revenue`, `expense` |
| `subtype` | text |  |  |  |
| `is_restricted` | boolean | yes | `false` |  |
| `fund` | fund_designation (enum) |  |  | enum: `housing_voucher`, `financial_literacy`, `veterans`, `recovery`, `reentry`, `operational`, `unrestricted`, `single_parent_stability`, `emergency_bridge`, `cornerstone_communities` |
| `parent_id` | uuid |  |  | FK → `accounts.id` |
| `is_active` | boolean | yes | `true` |  |
| `created_at` | timestamp with time zone | yes | `now()` |  |

Policies: `Internal users can manage accounts` (012_fund_accounting.sql)

### `audit_log`

4 RLS policies, 0 indexes (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `actor_id` | uuid |  |  | FK → `profiles.id` |
| `action` | text | yes |  |  |
| `entity_type` | text | yes |  |  |
| `entity_id` | uuid |  |  |  |
| `old_value` | jsonb |  |  |  |
| `new_value` | jsonb |  |  |  |
| `ip_address` | text |  |  |  |
| `created_at` | timestamp with time zone | yes | `now()` |  |

Policies: `Admins and board can view audit log` (001_faithproof_foundation.sql), `System can insert audit log entries` (001_faithproof_foundation.sql), `Admins and board can view audit log` (002_fix_rls_recursion.sql), `Authenticated users can insert audit log entries` (004_fix_audit_log_rls.sql)

### `board_meetings`

1 RLS policy, 2 indexes (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `meeting_date` | date | yes |  |  |
| `type` | text | yes | `regular` |  |
| `agenda` | text |  |  |  |
| `minutes` | text |  |  |  |
| `attendees` | text[] |  |  |  |
| `created_by` | uuid |  |  | FK → `profiles.id` |
| `created_at` | timestamp with time zone | yes | `now()` |  |
| `updated_at` | timestamp with time zone | yes | `now()` |  |
| `jitsi_room_name` | text |  |  |  |
| `scheduled_start` | timestamp with time zone |  |  |  |
| `scheduled_end` | timestamp with time zone |  |  |  |
| `actual_start` | timestamp with time zone |  |  |  |
| `actual_end` | timestamp with time zone |  |  |  |
| `recording_url` | text |  |  |  |
| `transcript_text` | text |  |  |  |
| `ai_draft_minutes` | text |  |  |  |
| `minutes_status` | text | yes | `draft` |  |

Policies: `Board and admin can manage meetings` (009_board_portal.sql)

### `board_votes`

1 RLS policy, 1 index (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `meeting_id` | uuid | yes |  | FK → `board_meetings.id` |
| `motion` | text | yes |  |  |
| `result` | text | yes |  |  |
| `votes_for` | int32 |  | `0` |  |
| `votes_against` | int32 |  | `0` |  |
| `votes_abstain` | int32 |  | `0` |  |
| `notes` | text |  |  |  |
| `created_at` | timestamp with time zone | yes | `now()` |  |

Policies: `Board and admin can manage votes` (009_board_portal.sql)

### `campaign_tags`

1 RLS policy, 1 index (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `contact_id` | uuid | yes |  | FK → `contacts.id` |
| `campaign` | text | yes |  |  |
| `tagged_at` | timestamp with time zone | yes | `now()` |  |
| `tagged_by` | uuid |  |  | FK → `profiles.id` |

Policies: `Internal users can manage campaign_tags` (007_crm_schema.sql)

### `contact_transactions`

1 RLS policy, 0 indexes (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `contact_id` | uuid | yes |  | **PK**; FK → `contacts.id` |
| `transaction_id` | uuid | yes |  | **PK**; FK → `transactions.id` |

Policies: `Internal users can manage contact_transactions` (007_crm_schema.sql)

### `contact_vouchers`

1 RLS policy, 0 indexes (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `contact_id` | uuid | yes |  | **PK**; FK → `contacts.id` |
| `voucher_id` | uuid | yes |  | **PK**; FK → `vouchers.id` |

Policies: `Internal users can manage contact_vouchers` (007_crm_schema.sql)

### `contacts`

1 RLS policy, 2 indexes (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `type` | contact_type (enum) | yes |  | enum: `donor`, `applicant`, `volunteer`, `board`, `partner` |
| `first_name` | text | yes |  |  |
| `last_name` | text | yes |  |  |
| `email` | text |  |  |  |
| `phone` | text |  |  |  |
| `sms_consent` | boolean | yes | `false` |  |
| `sms_consent_date` | timestamp with time zone |  |  |  |
| `address_line1` | text |  |  |  |
| `address_line2` | text |  |  |  |
| `city` | text |  |  |  |
| `state` | text |  | `TX` |  |
| `zip` | text |  |  |  |
| `source` | text |  |  |  |
| `notes` | text |  |  |  |
| `pipeline_stage` | text |  |  |  |
| `assigned_to` | uuid |  |  | FK → `profiles.id` |
| `is_active` | boolean | yes | `true` |  |
| `created_by` | uuid |  |  | FK → `profiles.id` |
| `created_at` | timestamp with time zone | yes | `now()` |  |
| `updated_at` | timestamp with time zone | yes | `now()` |  |

Policies: `Internal users can manage contacts` (007_crm_schema.sql)

### `cornerstone_milestones`

1 RLS policy, 1 index (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `project_id` | uuid | yes |  | FK → `cornerstone_projects.id` |
| `title` | text | yes |  |  |
| `description` | text |  |  |  |
| `target_date` | date |  |  |  |
| `completed_date` | date |  |  |  |
| `is_public` | boolean | yes | `true` |  |
| `created_at` | timestamp with time zone | yes | `now()` |  |

Policies: `Internal users can manage cornerstone_milestones` (013_cornerstone.sql)

### `cornerstone_projects`

1 RLS policy, 0 indexes (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `name` | text | yes |  |  |
| `location` | text |  |  |  |
| `phase` | int32 | yes | `1` |  |
| `phase_status` | cornerstone_phase_status (enum) | yes | `not_started` | enum: `not_started`, `in_progress`, `complete` |
| `land_acquired` | boolean | yes | `false` |  |
| `land_source` | text |  |  |  |
| `site_address` | text |  |  |  |
| `target_homes` | int32 |  |  |  |
| `homes_placed` | int32 | yes | `0` |  |
| `public_notes` | text |  |  |  |
| `internal_notes` | text |  |  |  |
| `created_by` | uuid |  |  | FK → `profiles.id` |
| `created_at` | timestamp with time zone | yes | `now()` |  |
| `updated_at` | timestamp with time zone | yes | `now()` |  |

Policies: `Internal users can manage cornerstone_projects` (013_cornerstone.sql)

### `email_sends`

1 RLS policy, 1 index (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `template_id` | uuid |  |  | FK → `email_templates.id` |
| `contact_id` | uuid |  |  | FK → `contacts.id` |
| `subject` | text | yes |  |  |
| `body_html` | text | yes |  |  |
| `status` | email_status (enum) | yes | `pending` | enum: `pending`, `sent`, `failed`, `bounced` |
| `sent_at` | timestamp with time zone |  |  |  |
| `error_text` | text |  |  |  |
| `created_by` | uuid |  |  | FK → `profiles.id` |
| `created_at` | timestamp with time zone | yes | `now()` |  |

Policies: `Internal users can manage email_sends` (008_mail_schema.sql)

### `email_templates`

1 RLS policy, 0 indexes (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `name` | text | yes |  |  |
| `subject` | text | yes |  |  |
| `body_html` | text | yes |  |  |
| `type` | template_type (enum) | yes | `custom` | enum: `donor_receipt`, `impact_report`, `volunteer_welcome`, `application_update`, `board_report`, `custom` |
| `created_by` | uuid |  |  | FK → `profiles.id` |
| `created_at` | timestamp with time zone | yes | `now()` |  |
| `updated_at` | timestamp with time zone | yes | `now()` |  |

Policies: `Internal users can manage templates` (008_mail_schema.sql)

### `grants`

1 RLS policy, 3 indexes (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `name` | text | yes |  |  |
| `funder` | text | yes |  |  |
| `amount_cents` | int32 |  |  |  |
| `status` | grant_status (enum) | yes | `prospect` | enum: `prospect`, `researching`, `applied`, `awarded`, `reporting`, `closed`, `declined` |
| `program` | text |  |  |  |
| `fund` | fund_designation (enum) |  |  | enum: `housing_voucher`, `financial_literacy`, `veterans`, `recovery`, `reentry`, `operational`, `unrestricted`, `single_parent_stability`, `emergency_bridge`, `cornerstone_communities` |
| `application_deadline` | date |  |  |  |
| `award_date` | date |  |  |  |
| `reporting_deadline` | date |  |  |  |
| `reporting_period` | text |  |  |  |
| `application_notes` | text |  |  |  |
| `award_notes` | text |  |  |  |
| `reporting_notes` | text |  |  |  |
| `contact_name` | text |  |  |  |
| `contact_email` | text |  |  |  |
| `transaction_id` | uuid |  |  | FK → `transactions.id` |
| `created_by` | uuid |  |  | FK → `profiles.id` |
| `created_at` | timestamp with time zone | yes | `now()` |  |
| `updated_at` | timestamp with time zone | yes | `now()` |  |

Policies: `Internal users can manage grants` (010_grants.sql)

### `interactions`

1 RLS policy, 1 index (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `contact_id` | uuid | yes |  | FK → `contacts.id` |
| `type` | interaction_type (enum) | yes | `note` | enum: `note`, `call`, `email`, `meeting`, `donation`, `application`, `volunteer_shift` |
| `subject` | text |  |  |  |
| `body` | text |  |  |  |
| `occurred_at` | timestamp with time zone | yes | `now()` |  |
| `created_by` | uuid |  |  | FK → `profiles.id` |
| `created_at` | timestamp with time zone | yes | `now()` |  |

Policies: `Internal users can manage interactions` (007_crm_schema.sql)

### `journal_entries`

1 RLS policy, 2 indexes (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `date` | date | yes |  |  |
| `description` | text | yes |  |  |
| `reference` | text |  |  |  |
| `created_by` | uuid |  |  | FK → `profiles.id` |
| `created_at` | timestamp with time zone | yes | `now()` |  |

Policies: `Internal users can manage journal_entries` (012_fund_accounting.sql)

### `journal_lines`

1 RLS policy, 3 indexes (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `entry_id` | uuid | yes |  | FK → `journal_entries.id` |
| `account_id` | uuid | yes |  | FK → `accounts.id` |
| `debit_cents` | int32 | yes | `0` |  |
| `credit_cents` | int32 | yes | `0` |  |
| `memo` | text |  |  |  |
| `fund` | fund_designation (enum) |  |  | enum: `housing_voucher`, `financial_literacy`, `veterans`, `recovery`, `reentry`, `operational`, `unrestricted`, `single_parent_stability`, `emergency_bridge`, `cornerstone_communities` |

Policies: `Internal users can manage journal_lines` (012_fund_accounting.sql)

### `meeting_approvals`

3 RLS policies, 1 index (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `meeting_id` | uuid | yes |  | FK → `board_meetings.id` |
| `profile_id` | uuid | yes |  | FK → `profiles.id` |
| `approved_at` | timestamp with time zone | yes | `now()` |  |
| `signature_data` | text |  |  |  |
| `ip_address` | text |  |  |  |
| `user_agent` | text |  |  |  |

Policies: `Board can read approvals` (014_board_meeting_room.sql), `Board can insert approvals` (014_board_meeting_room.sql), `Admin can update approvals` (014_board_meeting_room.sql)

### `profiles`

6 RLS policies, 0 indexes (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes |  | **PK** |
| `email` | text | yes |  |  |
| `full_name` | text |  |  |  |
| `role` | user_role (enum) | yes | `staff` | enum: `admin`, `board`, `staff`, `public` |
| `created_at` | timestamp with time zone | yes | `now()` |  |
| `updated_at` | timestamp with time zone | yes | `now()` |  |

Policies: `Users can read their own profile` (001_faithproof_foundation.sql), `Admins can read all profiles` (001_faithproof_foundation.sql), `Admins can update profiles` (001_faithproof_foundation.sql), `Admins can read all profiles` (002_fix_rls_recursion.sql), `Admins can read all profiles` (002_fix_rls_recursion.sql), `Admins can update profiles` (002_fix_rls_recursion.sql)

### `promises`

3 RLS policies, 0 indexes (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `title` | text | yes |  |  |
| `description` | text |  |  |  |
| `status` | promise_status (enum) | yes | `active` | enum: `active`, `fulfilled`, `in_progress`, `missed`, `revised` |
| `target_date` | date |  |  |  |
| `fulfilled_date` | date |  |  |  |
| `proof_url` | text |  |  |  |
| `is_public` | boolean | yes | `true` |  |
| `created_by` | uuid |  |  | FK → `profiles.id` |
| `created_at` | timestamp with time zone | yes | `now()` |  |
| `updated_at` | timestamp with time zone | yes | `now()` |  |

Policies: `Public can view public promises` (001_faithproof_foundation.sql), `Admins can manage promises` (001_faithproof_foundation.sql), `Admins can manage promises` (002_fix_rls_recursion.sql)

### `proof_documents`

5 RLS policies, 0 indexes (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `title` | text | yes |  |  |
| `type` | document_type (enum) | yes |  | enum: `irs_determination`, `audit`, `tax_return`, `board_minutes`, `financial_statement`, `grant_award`, `donor_receipt`, `policy`, `other` |
| `description` | text |  |  |  |
| `storage_path` | text |  |  |  |
| `external_url` | text |  |  |  |
| `is_public` | boolean | yes | `false` |  |
| `verified` | boolean | yes | `false` |  |
| `verified_by` | uuid |  |  | FK → `profiles.id` |
| `verified_at` | timestamp with time zone |  |  |  |
| `created_by` | uuid |  |  | FK → `profiles.id` |
| `created_at` | timestamp with time zone | yes | `now()` |  |
| `updated_at` | timestamp with time zone | yes | `now()` |  |

Policies: `Public can view public verified documents` (001_faithproof_foundation.sql), `Internal users can view all documents` (001_faithproof_foundation.sql), `Admins can manage documents` (001_faithproof_foundation.sql), `Internal users can view all documents` (002_fix_rls_recursion.sql), `Admins can manage documents` (002_fix_rls_recursion.sql)

### `settings`

2 RLS policies, 0 indexes (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `key` | text | yes |  | **PK** |
| `value` | jsonb | yes |  |  |
| `updated_by` | uuid |  |  | FK → `profiles.id` |
| `updated_at` | timestamp with time zone | yes | `now()` |  |

Policies: `Admins can manage settings` (005_settings_table.sql), `Anyone can read settings` (005_settings_table.sql)

### `tasks`

1 RLS policy, 1 index (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `contact_id` | uuid | yes |  | FK → `contacts.id` |
| `title` | text | yes |  |  |
| `description` | text |  |  |  |
| `due_date` | date |  |  |  |
| `priority` | task_priority (enum) | yes | `medium` | enum: `low`, `medium`, `high`, `urgent` |
| `status` | task_status (enum) | yes | `pending` | enum: `pending`, `in_progress`, `completed`, `cancelled` |
| `assigned_to` | uuid |  |  | FK → `profiles.id` |
| `completed_at` | timestamp with time zone |  |  |  |
| `created_by` | uuid |  |  | FK → `profiles.id` |
| `created_at` | timestamp with time zone | yes | `now()` |  |

Policies: `Internal users can manage tasks` (007_crm_schema.sql)

### `transactions`

5 RLS policies, 0 indexes (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `type` | transaction_type (enum) | yes |  | enum: `donation`, `grant`, `expense`, `voucher_disbursement`, `operational` |
| `status` | transaction_status (enum) | yes | `pending` | enum: `pending`, `confirmed`, `reconciled`, `voided` |
| `amount_cents` | int32 | yes |  |  |
| `fund` | fund_designation (enum) | yes |  | enum: `housing_voucher`, `financial_literacy`, `veterans`, `recovery`, `reentry`, `operational`, `unrestricted`, `single_parent_stability`, `emergency_bridge`, `cornerstone_communities` |
| `description` | text |  |  |  |
| `donor_name` | text |  |  |  |
| `donor_anonymous` | boolean | yes | `false` |  |
| `reference_number` | text |  |  |  |
| `transaction_date` | date | yes |  |  |
| `confirmed_at` | timestamp with time zone |  |  |  |
| `confirmed_by` | uuid |  |  | FK → `profiles.id` |
| `created_by` | uuid |  |  | FK → `profiles.id` |
| `created_at` | timestamp with time zone | yes | `now()` |  |
| `updated_at` | timestamp with time zone | yes | `now()` |  |
| `is_public` | boolean | yes | `false` |  |
| `zeffy_transaction_id` | text |  |  |  |
| `zeffy_campaign` | text |  |  |  |
| `donor_email` | text |  |  |  |
| `fund_backfilled` | boolean | yes | `false` |  |

Policies: `Public can view public transactions` (001_faithproof_foundation.sql), `Internal users can view all transactions` (001_faithproof_foundation.sql), `Admins can manage transactions` (001_faithproof_foundation.sql), `Internal users can view all transactions` (002_fix_rls_recursion.sql), `Admins can manage transactions` (002_fix_rls_recursion.sql)

### `volunteer_events`

1 RLS policy, 1 index (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `name` | text | yes |  |  |
| `description` | text |  |  |  |
| `date` | date | yes |  |  |
| `start_time` | time without time zone |  |  |  |
| `end_time` | time without time zone |  |  |  |
| `location` | text |  |  |  |
| `max_volunteers` | int32 |  |  |  |
| `status` | text | yes | `scheduled` |  |
| `created_by` | uuid |  |  | FK → `profiles.id` |
| `created_at` | timestamp with time zone | yes | `now()` |  |

Policies: `Internal users can manage volunteer_events` (011_volunteers.sql)

### `volunteer_shifts`

1 RLS policy, 3 indexes (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `event_id` | uuid | yes |  | FK → `volunteer_events.id` |
| `contact_id` | uuid | yes |  | FK → `contacts.id` |
| `hours_logged` | numeric |  |  |  |
| `checked_in_at` | timestamp with time zone |  |  |  |
| `checked_out_at` | timestamp with time zone |  |  |  |
| `notes` | text |  |  |  |
| `created_at` | timestamp with time zone | yes | `now()` |  |

Policies: `Internal users can manage volunteer_shifts` (011_volunteers.sql)

### `volunteer_skills`

1 RLS policy, 0 indexes (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `contact_id` | uuid | yes |  | **PK**; FK → `contacts.id` |
| `skill` | text | yes |  | **PK** |
| `created_at` | timestamp with time zone | yes | `now()` |  |

Policies: `Internal users can manage volunteer_skills` (011_volunteers.sql)

### `vouchers`

5 RLS policies, 0 indexes (from migrations).

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | uuid | yes | `gen_random_uuid()` | **PK** |
| `voucher_number` | text | yes |  |  |
| `status` | voucher_status (enum) | yes | `pending` | enum: `pending`, `approved`, `disbursed`, `expired`, `cancelled` |
| `amount_cents` | int32 | yes |  |  |
| `fund` | fund_designation (enum) | yes | `housing_voucher` | enum: `housing_voucher`, `financial_literacy`, `veterans`, `recovery`, `reentry`, `operational`, `unrestricted`, `single_parent_stability`, `emergency_bridge`, `cornerstone_communities` |
| `recipient_name` | text |  |  |  |
| `recipient_anonymous` | boolean | yes | `true` |  |
| `program` | text |  |  |  |
| `approved_at` | timestamp with time zone |  |  |  |
| `disbursed_at` | timestamp with time zone |  |  |  |
| `approved_by` | uuid |  |  | FK → `profiles.id` |
| `transaction_id` | uuid |  |  | FK → `transactions.id` |
| `notes` | text |  |  |  |
| `created_at` | timestamp with time zone | yes | `now()` |  |
| `updated_at` | timestamp with time zone | yes | `now()` |  |

Policies: `Public can view anonymized disbursed vouchers` (001_faithproof_foundation.sql), `Internal users can view all vouchers` (001_faithproof_foundation.sql), `Admins can manage vouchers` (001_faithproof_foundation.sql), `Internal users can view all vouchers` (002_fix_rls_recursion.sql), `Admins can manage vouchers` (002_fix_rls_recursion.sql)

## Views

### `account_balances`

| Column | Type |
| --- | --- |
| `account_id` | uuid |
| `code` | text |
| `name` | text |
| `type` | account_type (enum) |
| `fund` | fund_designation (enum) |
| `is_restricted` | boolean |
| `is_active` | boolean |
| `debit_cents` | int64 |
| `credit_cents` | int64 |
| `balance_cents` | int64 |

### `cornerstone_milestones_public`

| Column | Type |
| --- | --- |
| `id` | uuid |
| `project_id` | uuid |
| `title` | text |
| `description` | text |
| `target_date` | date |
| `completed_date` | date |

### `cornerstone_projects_public`

| Column | Type |
| --- | --- |
| `id` | uuid |
| `name` | text |
| `location` | text |
| `phase` | int32 |
| `phase_status` | cornerstone_phase_status (enum) |
| `land_acquired` | boolean |
| `target_homes` | int32 |
| `homes_placed` | int32 |
| `public_notes` | text |
| `updated_at` | timestamp with time zone |

## The six funds — and why the enum has ten

**Corrected 2026-08-18.** Earlier documentation said this organisation has
TEN funds. It does not. Zeffy's live donation form offers exactly **six**,
verified against the form itself:

| On the Zeffy form | Enum value | Revenue account | Restricted? |
| --- | --- | --- | --- |
| General Fund | `unrestricted` | 4000 | No |
| Housing Voucher Program | `housing_voucher` | 4100 | Yes |
| Veterans Path Home | `veterans` | 4200 | Yes |
| Recovery Housing | `recovery` | 4210 | Yes |
| Second Chance Reentry | `reentry` | 4220 | Yes |
| Cornerstone Communities | `cornerstone_communities` | 4230 | Yes |

Ten was the size of the `fund_designation` enum, not the number of choices a
donor is offered, and the two had been conflated. The enum keeps all ten
deliberately:

- `financial_literacy`, `single_parent_stability`, `emergency_bridge` name
  programmes retired on 2026-08-14. Historical rows still carry them, so
  dropping the labels would be data loss dressed up as tidying.
- `operational` is an internal designation for administrative money. It has
  never appeared on a donation form and must never be offered as a gift
  designation.

The six are enforced in the application as `DONOR_FUNDS`
(`src/lib/faithproof/types.ts`), which every gift-designation control reads
from. `SELECTABLE_FUNDS` is the six plus `operational`, for internal records
such as expenses. Accounts 4210, 4220 and 4230 were added by migration 015 —
before it those three funds shared account 4600 and could not be told apart
on the revenue side.

## Enum types

- `account_type` — `asset`, `liability`, `equity`, `revenue`, `expense`
- `contact_type` — `donor`, `applicant`, `volunteer`, `board`, `partner`
- `cornerstone_phase_status` — `not_started`, `in_progress`, `complete`
- `document_type` — `irs_determination`, `audit`, `tax_return`, `board_minutes`, `financial_statement`, `grant_award`, `donor_receipt`, `policy`, `other`
- `email_status` — `pending`, `sent`, `failed`, `bounced`
- `fund_designation` — `housing_voucher`, `financial_literacy`, `veterans`, `recovery`, `reentry`, `operational`, `unrestricted`, `single_parent_stability`, `emergency_bridge`, `cornerstone_communities`
- `grant_status` — `prospect`, `researching`, `applied`, `awarded`, `reporting`, `closed`, `declined`
- `interaction_type` — `note`, `call`, `email`, `meeting`, `donation`, `application`, `volunteer_shift`
- `promise_status` — `active`, `fulfilled`, `in_progress`, `missed`, `revised`
- `task_priority` — `low`, `medium`, `high`, `urgent`
- `task_status` — `pending`, `in_progress`, `completed`, `cancelled`
- `template_type` — `donor_receipt`, `impact_report`, `volunteer_welcome`, `application_update`, `board_report`, `custom`
- `transaction_status` — `pending`, `confirmed`, `reconciled`, `voided`
- `transaction_type` — `donation`, `grant`, `expense`, `voucher_disbursement`, `operational`
- `user_role` — `admin`, `board`, `staff`, `public`
- `voucher_status` — `pending`, `approved`, `disbursed`, `expired`, `cancelled`

## RPC functions (callable over PostgREST)

- `account_id_for_code()`
- `cash_code_for_fund()`
- `create_journal_entry()`
- `current_user_role()`
- `post_journal_pair()`
- `program_expense_code_for_fund()`
- `revenue_code_for()`

Defined in migrations: `account_id_for_code`, `assert_entry_balances`, `auto_journal_on_transaction_confirm`, `auto_journal_on_voucher_disbursed`, `cash_code_for_fund`, `create_journal_entry`, `current_user_role`, `handle_new_user`, `journal_line_fund_default`, `post_journal_pair`, `program_expense_code_for_fund`, `revenue_code_for`, `reverse_journal_on_transaction_void`, `update_updated_at`, `with`

## Indexes (from migrations)

- `idx_contacts_email` on `contacts` — 007_crm_schema.sql
- `idx_contacts_type` on `contacts` — 007_crm_schema.sql
- `idx_interactions_contact` on `interactions` — 007_crm_schema.sql
- `idx_tasks_due` on `tasks` — 007_crm_schema.sql
- `idx_campaign_tags_campaign` on `campaign_tags` — 007_crm_schema.sql
- `idx_email_sends_contact` on `email_sends` — 008_mail_schema.sql
- `idx_board_meetings_date` on `board_meetings` — 009_board_portal.sql
- `idx_board_votes_meeting` on `board_votes` — 009_board_portal.sql
- `idx_grants_status` on `grants` — 010_grants.sql
- `idx_grants_reporting_deadline` on `grants` — 010_grants.sql
- `idx_grants_application_deadline` on `grants` — 010_grants.sql
- `idx_volunteer_events_date` on `volunteer_events` — 011_volunteers.sql
- `idx_volunteer_shifts_event` on `volunteer_shifts` — 011_volunteers.sql
- `idx_volunteer_shifts_contact` on `volunteer_shifts` — 011_volunteers.sql
- `idx_volunteer_shifts_checked_in` on `volunteer_shifts` — 011_volunteers.sql
- `idx_journal_entries_reference` on `journal_entries` — 012_fund_accounting.sql
- `idx_journal_lines_entry` on `journal_lines` — 012_fund_accounting.sql
- `idx_journal_lines_account` on `journal_lines` — 012_fund_accounting.sql
- `idx_journal_entries_date` on `journal_entries` — 012_fund_accounting.sql
- `idx_cornerstone_milestones_project` on `cornerstone_milestones` — 013_cornerstone.sql
- `idx_board_meetings_scheduled_start` on `board_meetings` — 014_board_meeting_room.sql
- `idx_meeting_approvals_meeting` on `meeting_approvals` — 014_board_meeting_room.sql
- `idx_journal_lines_fund` on `journal_lines` — 015_fund_designation_through_ledger.sql

## RLS policies (from migrations)

| Policy | Table | Migration |
| --- | --- | --- |
| `Users can read their own profile` | `profiles` | 001_faithproof_foundation.sql |
| `Admins can read all profiles` | `profiles` | 001_faithproof_foundation.sql |
| `Admins can update profiles` | `profiles` | 001_faithproof_foundation.sql |
| `Public can view public transactions` | `transactions` | 001_faithproof_foundation.sql |
| `Internal users can view all transactions` | `transactions` | 001_faithproof_foundation.sql |
| `Admins can manage transactions` | `transactions` | 001_faithproof_foundation.sql |
| `Public can view anonymized disbursed vouchers` | `vouchers` | 001_faithproof_foundation.sql |
| `Internal users can view all vouchers` | `vouchers` | 001_faithproof_foundation.sql |
| `Admins can manage vouchers` | `vouchers` | 001_faithproof_foundation.sql |
| `Public can view public promises` | `promises` | 001_faithproof_foundation.sql |
| `Admins can manage promises` | `promises` | 001_faithproof_foundation.sql |
| `Public can view public verified documents` | `proof_documents` | 001_faithproof_foundation.sql |
| `Internal users can view all documents` | `proof_documents` | 001_faithproof_foundation.sql |
| `Admins can manage documents` | `proof_documents` | 001_faithproof_foundation.sql |
| `Admins and board can view audit log` | `audit_log` | 001_faithproof_foundation.sql |
| `System can insert audit log entries` | `audit_log` | 001_faithproof_foundation.sql |
| `Admins can read all profiles` | `profiles` | 002_fix_rls_recursion.sql |
| `Admins can read all profiles` | `profiles` | 002_fix_rls_recursion.sql |
| `Admins can update profiles` | `profiles` | 002_fix_rls_recursion.sql |
| `Internal users can view all transactions` | `transactions` | 002_fix_rls_recursion.sql |
| `Admins can manage transactions` | `transactions` | 002_fix_rls_recursion.sql |
| `Internal users can view all vouchers` | `vouchers` | 002_fix_rls_recursion.sql |
| `Admins can manage vouchers` | `vouchers` | 002_fix_rls_recursion.sql |
| `Admins can manage promises` | `promises` | 002_fix_rls_recursion.sql |
| `Internal users can view all documents` | `proof_documents` | 002_fix_rls_recursion.sql |
| `Admins can manage documents` | `proof_documents` | 002_fix_rls_recursion.sql |
| `Admins and board can view audit log` | `audit_log` | 002_fix_rls_recursion.sql |
| `Authenticated users can insert audit log entries` | `audit_log` | 004_fix_audit_log_rls.sql |
| `Admins can manage settings` | `settings` | 005_settings_table.sql |
| `Anyone can read settings` | `settings` | 005_settings_table.sql |
| `Internal users can manage contacts` | `contacts` | 007_crm_schema.sql |
| `Internal users can manage interactions` | `interactions` | 007_crm_schema.sql |
| `Internal users can manage tasks` | `tasks` | 007_crm_schema.sql |
| `Internal users can manage campaign_tags` | `campaign_tags` | 007_crm_schema.sql |
| `Internal users can manage contact_transactions` | `contact_transactions` | 007_crm_schema.sql |
| `Internal users can manage contact_vouchers` | `contact_vouchers` | 007_crm_schema.sql |
| `Internal users can manage templates` | `email_templates` | 008_mail_schema.sql |
| `Internal users can manage email_sends` | `email_sends` | 008_mail_schema.sql |
| `Board and admin can manage meetings` | `board_meetings` | 009_board_portal.sql |
| `Board and admin can manage votes` | `board_votes` | 009_board_portal.sql |
| `Internal users can manage grants` | `grants` | 010_grants.sql |
| `Internal users can manage volunteer_events` | `volunteer_events` | 011_volunteers.sql |
| `Internal users can manage volunteer_shifts` | `volunteer_shifts` | 011_volunteers.sql |
| `Internal users can manage volunteer_skills` | `volunteer_skills` | 011_volunteers.sql |
| `Internal users can manage accounts` | `accounts` | 012_fund_accounting.sql |
| `Internal users can manage journal_entries` | `journal_entries` | 012_fund_accounting.sql |
| `Internal users can manage journal_lines` | `journal_lines` | 012_fund_accounting.sql |
| `Internal users can manage cornerstone_projects` | `cornerstone_projects` | 013_cornerstone.sql |
| `Internal users can manage cornerstone_milestones` | `cornerstone_milestones` | 013_cornerstone.sql |
| `Board can read approvals` | `meeting_approvals` | 014_board_meeting_room.sql |
| `Board can insert approvals` | `meeting_approvals` | 014_board_meeting_room.sql |
| `Admin can update approvals` | `meeting_approvals` | 014_board_meeting_room.sql |

## Migrations

- 001_faithproof_foundation.sql
- 002_fix_rls_recursion.sql
- 003_fix_handle_new_user_search_path.sql
- 004_fix_audit_log_rls.sql
- 005_settings_table.sql
- 006_zeffy_webhook_fields.sql
- 007_crm_schema.sql
- 008_mail_schema.sql
- 009_board_portal.sql
- 010_grants.sql
- 011_volunteers.sql
- 012_fund_accounting.sql
- 013_cornerstone.sql
- 014_board_meeting_room.sql
- 015_fund_designation_through_ledger.sql

## Known drift, recorded rather than fixed

- `board_meetings.jitsi_room_name` still exists and is still written on
  creation, but nothing reads it — the room name has been derived server-side as
  `private-meeting-<id>` since Phase 21. Dropping a populated column is a
  migration, and none was in scope.
