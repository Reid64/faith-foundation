-- ═══════════════════════════════════════════════════
-- PHASE 14 — VOLUNTEER MANAGEMENT
-- ═══════════════════════════════════════════════════
--
-- Decisions made here rather than left ambiguous, each one flagged in the
-- phase spec's build-time notes:
--
--   * hours_logged is NUMERIC(5,2), not bare DECIMAL. Bare DECIMAL in Postgres
--     accepts arbitrary precision, so two shifts could round differently and an
--     impact report would not reconcile.
--
--   * hours_logged is the AUTHORITATIVE figure for every report. checked_in_at
--     and checked_out_at are operational — they tell you who is on site right
--     now. Checking out fills hours_logged from the timestamps only when it is
--     still empty, so an hours figure a person entered is never overwritten by
--     a clock. One number feeds the reports; there is no second source.
--
--   * UNIQUE (event_id, contact_id): one shift per volunteer per event. Without
--     it a double click on "Add Volunteer" doubles that person's hours.
--
--   * WITH CHECK mirrors USING on every policy, so INSERT and UPDATE are
--     constrained the same way SELECT is.
--
--   * max_volunteers is NOT enforced in the database. The server action counts
--     existing shifts first, which is honest about being a check rather than a
--     guarantee — two simultaneous signups can still both pass it. Enforcing it
--     properly needs a constraint trigger with row locking; at FAITH
--     Foundation's volume the count is sufficient and the failure mode (one
--     volunteer over capacity) is visible on the roster.

CREATE TABLE volunteer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  max_volunteers INTEGER CHECK (max_volunteers IS NULL OR max_volunteers > 0),
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE volunteer_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES volunteer_events(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  hours_logged NUMERIC(5,2) CHECK (hours_logged IS NULL OR hours_logged >= 0),
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, contact_id)
);

CREATE TABLE volunteer_skills (
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (contact_id, skill)
);

CREATE INDEX IF NOT EXISTS idx_volunteer_events_date ON volunteer_events (date DESC);
CREATE INDEX IF NOT EXISTS idx_volunteer_shifts_event ON volunteer_shifts (event_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_shifts_contact ON volunteer_shifts (contact_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_shifts_checked_in ON volunteer_shifts (checked_in_at);

ALTER TABLE volunteer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internal users can manage volunteer_events" ON volunteer_events FOR ALL
  USING (current_user_role() IN ('admin', 'board', 'staff'))
  WITH CHECK (current_user_role() IN ('admin', 'board', 'staff'));

CREATE POLICY "Internal users can manage volunteer_shifts" ON volunteer_shifts FOR ALL
  USING (current_user_role() IN ('admin', 'board', 'staff'))
  WITH CHECK (current_user_role() IN ('admin', 'board', 'staff'));

CREATE POLICY "Internal users can manage volunteer_skills" ON volunteer_skills FOR ALL
  USING (current_user_role() IN ('admin', 'board', 'staff'))
  WITH CHECK (current_user_role() IN ('admin', 'board', 'staff'));
