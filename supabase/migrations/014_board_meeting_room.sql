-- ═══════════════════════════════════════════════════
-- PHASE 19 — BOARD MEETING ROOM
-- ═══════════════════════════════════════════════════
--
-- Video meetings, AI-drafted minutes, and digitally signed board approval.
--
-- meeting_approvals is the legally interesting table: it records who approved a
-- set of minutes, when, from what address, and with what drawn signature. Three
-- separate policies rather than one FOR ALL, because the operations genuinely
-- differ:
--
--   SELECT  admin + board — the whole board must see who has signed.
--   INSERT  admin + board — a director signs for themselves.
--   UPDATE  admin only   — an approval is a record of an act, not a draft. A
--                          director cannot quietly rewrite their own signature
--                          or its timestamp after the fact.
--
-- There is deliberately NO DELETE policy. Nobody, including an admin, can
-- remove an approval through the application — the same reasoning that makes
-- audit_log append-only. Removing one requires the service role, which leaves
-- its own trail.
--
-- UNIQUE (meeting_id, profile_id) makes signing idempotent: a double submit is
-- refused by the database rather than recorded as two approvals.

ALTER TABLE board_meetings ADD COLUMN IF NOT EXISTS jitsi_room_name TEXT;
ALTER TABLE board_meetings ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMPTZ;
ALTER TABLE board_meetings ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMPTZ;
ALTER TABLE board_meetings ADD COLUMN IF NOT EXISTS actual_start TIMESTAMPTZ;
ALTER TABLE board_meetings ADD COLUMN IF NOT EXISTS actual_end TIMESTAMPTZ;
ALTER TABLE board_meetings ADD COLUMN IF NOT EXISTS recording_url TEXT;
ALTER TABLE board_meetings ADD COLUMN IF NOT EXISTS transcript_text TEXT;
ALTER TABLE board_meetings ADD COLUMN IF NOT EXISTS ai_draft_minutes TEXT;
ALTER TABLE board_meetings ADD COLUMN IF NOT EXISTS minutes_status TEXT NOT NULL DEFAULT 'draft';

-- The status drives which banner and which actions the minutes page offers, so
-- an unexpected value would silently disable the approval workflow.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'board_meetings_minutes_status_check'
  ) THEN
    ALTER TABLE board_meetings
      ADD CONSTRAINT board_meetings_minutes_status_check
      CHECK (minutes_status IN ('draft', 'under_review', 'approved', 'certified'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_board_meetings_scheduled_start
  ON board_meetings (scheduled_start);

CREATE TABLE IF NOT EXISTS meeting_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES board_meetings(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id),
  approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  signature_data TEXT,
  ip_address TEXT,
  user_agent TEXT,
  UNIQUE(meeting_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_meeting_approvals_meeting
  ON meeting_approvals (meeting_id);

ALTER TABLE meeting_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Board can read approvals"
  ON meeting_approvals FOR SELECT
  USING (current_user_role() IN ('admin', 'board'));

CREATE POLICY "Board can insert approvals"
  ON meeting_approvals FOR INSERT
  WITH CHECK (current_user_role() IN ('admin', 'board'));

CREATE POLICY "Admin can update approvals"
  ON meeting_approvals FOR UPDATE
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');
