-- ═══════════════════════════════════════════════════
-- FAITHPROOF — FIX RLS INFINITE RECURSION
-- ═══════════════════════════════════════════════════
--
-- WHY THIS MIGRATION EXISTS
--
-- 001 created policies on `profiles` whose USING clause selects FROM `profiles`:
--
--     CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT
--       USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid()
--                                              AND p.role = 'admin'));
--
-- Row Level Security applies to that inner SELECT too, so evaluating the policy
-- requires evaluating the policy. Postgres detects the cycle and aborts with:
--
--     infinite recursion detected in policy for relation "profiles"
--
-- Because every other table's policies also read `profiles` to resolve the
-- caller's role, the failure propagated to all six tables. Verified empirically
-- against this database after 001: SELECT count(*) failed on profiles,
-- transactions, vouchers, promises, proof_documents and audit_log, as both
-- `authenticated` and `anon`. The data layer was structurally complete and
-- functionally dead.
--
-- THE FIX
--
-- A SECURITY DEFINER function resolves the caller's role. It executes as its
-- owner (postgres), who owns `profiles` and therefore bypasses RLS on it, so
-- reading the role no longer re-enters the policy. This is the pattern Supabase
-- documents for exactly this situation.
--
-- `SET search_path = public` is required: a SECURITY DEFINER function without a
-- pinned search_path can be hijacked by a caller-controlled search_path.
--
-- Policy INTENT is unchanged from 001 — same roles, same visibility, same
-- public/internal split. Only the mechanism for reading the role changes.

-- ───────────────────────────────────────────────────
-- ROLE LOOKUP HELPER
-- ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

COMMENT ON FUNCTION public.current_user_role() IS
  'Returns the FaithProof role of the calling user, or NULL if they have no profile. SECURITY DEFINER so that reading profiles does not re-enter the RLS policies on profiles (see 002_fix_rls_recursion.sql).';

GRANT EXECUTE ON FUNCTION public.current_user_role() TO anon, authenticated, service_role;

-- ───────────────────────────────────────────────────
-- PROFILES
-- ───────────────────────────────────────────────────

-- "Users can read their own profile" (auth.uid() = id) does NOT recurse and is
-- left exactly as 001 created it.

DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- ───────────────────────────────────────────────────
-- TRANSACTIONS
-- ───────────────────────────────────────────────────

-- "Public can view public transactions" does not read profiles — left as-is.

DROP POLICY IF EXISTS "Internal users can view all transactions" ON transactions;
CREATE POLICY "Internal users can view all transactions"
  ON transactions FOR SELECT
  USING (public.current_user_role() IN ('admin', 'board', 'staff'));

DROP POLICY IF EXISTS "Admins can manage transactions" ON transactions;
CREATE POLICY "Admins can manage transactions"
  ON transactions FOR ALL
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- ───────────────────────────────────────────────────
-- VOUCHERS
-- ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "Internal users can view all vouchers" ON vouchers;
CREATE POLICY "Internal users can view all vouchers"
  ON vouchers FOR SELECT
  USING (public.current_user_role() IN ('admin', 'board', 'staff'));

DROP POLICY IF EXISTS "Admins can manage vouchers" ON vouchers;
CREATE POLICY "Admins can manage vouchers"
  ON vouchers FOR ALL
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- ───────────────────────────────────────────────────
-- PROMISES
-- ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins can manage promises" ON promises;
CREATE POLICY "Admins can manage promises"
  ON promises FOR ALL
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- ───────────────────────────────────────────────────
-- PROOF DOCUMENTS
-- ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "Internal users can view all documents" ON proof_documents;
CREATE POLICY "Internal users can view all documents"
  ON proof_documents FOR SELECT
  USING (public.current_user_role() IN ('admin', 'board', 'staff'));

DROP POLICY IF EXISTS "Admins can manage documents" ON proof_documents;
CREATE POLICY "Admins can manage documents"
  ON proof_documents FOR ALL
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- ───────────────────────────────────────────────────
-- AUDIT LOG
-- ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins and board can view audit log" ON audit_log;
CREATE POLICY "Admins and board can view audit log"
  ON audit_log FOR SELECT
  USING (public.current_user_role() IN ('admin', 'board'));

-- NOTE, deliberately NOT changed here: 001's "System can insert audit log
-- entries" is WITH CHECK (TRUE), which lets ANY caller — including anon —
-- insert arbitrary rows into the audit log. For an accountability product that
-- is a tamper surface worth closing in Phase 2 (route audit writes through the
-- service-role client and restrict this policy to service_role). Flagged in
-- governance rather than silently redefined, because Phase 2's write path is
-- not designed yet.
