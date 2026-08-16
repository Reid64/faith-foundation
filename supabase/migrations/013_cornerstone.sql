-- ═══════════════════════════════════════════════════
-- PHASE 16 — CORNERSTONE COMMUNITIES TRACKER
-- ═══════════════════════════════════════════════════
--
-- Four decisions worth stating:
--
--   1. NO PUBLIC POLICY ON THE BASE TABLES. Row level security decides which
--      ROWS a role may read; it cannot hide a COLUMN. internal_notes must never
--      reach a visitor, so the public site reads two definer views that select
--      the public columns only. Granting anon SELECT on cornerstone_projects
--      would have published internal_notes to anyone who asked PostgREST for
--      it — the page would have looked fine and the data would still be out.
--
--   2. phase and phase_status are CONSTRAINED. The spec left both free-form;
--      an out-of-range phase would break the four-step stepper on both the
--      admin and the public page.
--
--   3. homes_placed DEFAULTS TO 0 AND STAYS 0 until a home is actually placed.
--      The public page reads honestly at zero rather than as anticipation.
--
--   4. The public view exposes only projects that have actually started —
--      phase_status <> 'not_started' OR homes_placed > 0 — so an empty pipeline
--      shows the empty state instead of implying work underway.
--
-- NAMING: the modular home partner is never named in this schema, in
-- public_notes, or in any copy this feeds. "Modular home partner" or "housing
-- partner" only.

CREATE TYPE cornerstone_phase_status AS ENUM ('not_started', 'in_progress', 'complete');

CREATE TABLE cornerstone_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  phase INTEGER NOT NULL DEFAULT 1 CHECK (phase BETWEEN 1 AND 4),
  phase_status cornerstone_phase_status NOT NULL DEFAULT 'not_started',
  land_acquired BOOLEAN NOT NULL DEFAULT false,
  land_source TEXT,
  site_address TEXT,
  target_homes INTEGER CHECK (target_homes IS NULL OR target_homes > 0),
  homes_placed INTEGER NOT NULL DEFAULT 0 CHECK (homes_placed >= 0),
  public_notes TEXT,
  internal_notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cornerstone_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES cornerstone_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  completed_date DATE,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cornerstone_milestones_project
  ON cornerstone_milestones (project_id);

CREATE TRIGGER trg_cornerstone_projects_updated_at
  BEFORE UPDATE ON cornerstone_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE cornerstone_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cornerstone_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internal users can manage cornerstone_projects" ON cornerstone_projects FOR ALL
  USING (current_user_role() IN ('admin', 'board', 'staff'))
  WITH CHECK (current_user_role() IN ('admin', 'board', 'staff'));

CREATE POLICY "Internal users can manage cornerstone_milestones" ON cornerstone_milestones FOR ALL
  USING (current_user_role() IN ('admin', 'board', 'staff'))
  WITH CHECK (current_user_role() IN ('admin', 'board', 'staff'));

-- ── Public views ────────────────────────────────────────────────────────────
--
-- Definer views on purpose: they read the base tables past RLS, and expose
-- nothing but the columns and rows a visitor is meant to see. internal_notes is
-- absent from both by construction, not by convention.

CREATE VIEW cornerstone_projects_public AS
SELECT
  id,
  name,
  location,
  phase,
  phase_status,
  land_acquired,
  target_homes,
  homes_placed,
  public_notes,
  updated_at
FROM cornerstone_projects
WHERE phase_status <> 'not_started' OR homes_placed > 0;

CREATE VIEW cornerstone_milestones_public AS
SELECT
  m.id,
  m.project_id,
  m.title,
  m.description,
  m.target_date,
  m.completed_date
FROM cornerstone_milestones m
JOIN cornerstone_projects p ON p.id = m.project_id
WHERE m.is_public = true
  AND (p.phase_status <> 'not_started' OR p.homes_placed > 0);

GRANT SELECT ON cornerstone_projects_public TO anon, authenticated;
GRANT SELECT ON cornerstone_milestones_public TO anon, authenticated;
