-- ═══════════════════════════════════════════════════
-- FAITHPROOF — FIX handle_new_user() SEARCH PATH
-- ═══════════════════════════════════════════════════
--
-- WHY THIS MIGRATION EXISTS
--
-- 001 created:
--
--     CREATE FUNCTION handle_new_user() ... SECURITY DEFINER
--     -- body: INSERT INTO profiles (...)
--     CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users ...
--
-- with no `SET search_path`. SECURITY DEFINER changes which privileges the
-- function runs with; it does NOT change the search_path, which is inherited
-- from the caller. Supabase's auth service connects as `supabase_auth_admin`,
-- and that role is configured with:
--
--     search_path=auth
--
-- So the unqualified `profiles` in the function body was resolved against the
-- `auth` schema only, was not found, and the trigger aborted — taking the whole
-- INSERT INTO auth.users with it. Every attempt to create an account failed
-- with GoTrue's opaque "Database error creating new user".
--
-- This was total: no user could ever be created, so /login could never
-- authenticate anybody and /admin was permanently unreachable. Confirmed
-- against this project by calling auth.admin.createUser() with the service-role
-- key and by reading pg_roles.rolconfig / pg_proc.proconfig.
--
-- It did not show up in the earlier direct-SQL test because that test inserted
-- as `postgres`, whose search_path is `"$user", public, extensions` — public is
-- on it, so the same trigger succeeded. The bug only appears via the real
-- signup path.
--
-- THE FIX
--
-- Pin the search_path and schema-qualify every reference, so resolution no
-- longer depends on who is calling. `SET search_path = ''` plus fully-qualified
-- names is the strictest form and is what Supabase now documents.
--
-- Behaviour is otherwise identical to 001: same columns, same default role.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'staff'::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Creates a FaithProof profile row whenever a Supabase auth user is created. search_path is pinned and all names are schema-qualified because the auth service calls this with search_path=auth (see 003_fix_handle_new_user_search_path.sql).';

-- Same class of latent problem: a function with a mutable search_path. This one
-- only assigns NEW.updated_at so it cannot currently misresolve, but pinning it
-- costs nothing and clears the Supabase security advisor's
-- `function_search_path_mutable` warning.
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
