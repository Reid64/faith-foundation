-- ═══════════════════════════════════════════════════
-- PHASE 12 — BOARD PORTAL
-- ═══════════════════════════════════════════════════
--
-- Meeting minutes and voting records: the legal record of a 501(c)(3).
--
-- RLS restricts BOTH tables to admin and board. That is the real boundary —
-- hiding the nav item from staff hides a link, not a route and not the data.
-- The route layout performs the same check so a staff user gets a clear
-- redirect instead of an empty page.

CREATE TABLE board_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_date DATE NOT NULL,
  type TEXT NOT NULL DEFAULT 'regular',
  agenda TEXT,
  minutes TEXT,
  attendees TEXT[],
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE board_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES board_meetings(id) ON DELETE CASCADE,
  motion TEXT NOT NULL,
  result TEXT NOT NULL,
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  votes_abstain INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_board_meetings_date ON board_meetings (meeting_date DESC);
CREATE INDEX IF NOT EXISTS idx_board_votes_meeting ON board_votes (meeting_id);

ALTER TABLE board_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Board and admin can manage meetings" ON board_meetings FOR ALL
  USING (current_user_role() IN ('admin', 'board'))
  WITH CHECK (current_user_role() IN ('admin', 'board'));
CREATE POLICY "Board and admin can manage votes" ON board_votes FOR ALL
  USING (current_user_role() IN ('admin', 'board'))
  WITH CHECK (current_user_role() IN ('admin', 'board'));

CREATE TRIGGER trg_board_meetings_updated_at BEFORE UPDATE ON board_meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
