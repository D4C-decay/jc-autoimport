-- ============================================================
-- Supabase Auth integration
-- ------------------------------------------------------------
-- 1. Link public.users to auth.users through auth_id.
-- 2. Credentials, email verification and MFA move to Supabase Auth.
-- 3. Keep the local user row (and every FK) untouched.
--
-- Apply with `prisma migrate deploy` against Supabase. Do NOT use
-- `prisma migrate dev` there: Supabase does not provide a shadow database.
-- ============================================================

-- AlterTable
ALTER TABLE "users" DROP COLUMN "two_factor_enabled",
DROP COLUMN "two_factor_secret",
ADD COLUMN     "auth_id" UUID,
ALTER COLUMN "password_hash" DROP NOT NULL;

-- DropTable
DROP TABLE "refresh_tokens";

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_id_key" ON "users"("auth_id");

-- ============================================================
-- Triggers on auth.users (only exist on Supabase)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_first text;
  v_last  text;
BEGIN
  v_email := lower(coalesce(new.email, new.id::text || '@users.noreply.local'));
  v_first := coalesce(
    nullif(new.raw_user_meta_data->>'firstName', ''),
    nullif(new.raw_user_meta_data->>'first_name', ''),
    split_part(v_email, '@', 1)
  );
  v_last := coalesce(
    nullif(new.raw_user_meta_data->>'lastName', ''),
    nullif(new.raw_user_meta_data->>'last_name', ''),
    ''
  );

  -- A legacy row with the same email is linked instead of duplicated.
  UPDATE public.users
     SET auth_id = new.id,
         email_verified = new.email_confirmed_at IS NOT NULL,
         updated_at = now()
   WHERE email = v_email
     AND auth_id IS NULL;

  IF NOT FOUND THEN
    INSERT INTO public.users (
      id, auth_id, email, password_hash, first_name, last_name,
      role, is_active, email_verified, created_at, updated_at
    )
    VALUES (
      new.id::text, new.id, v_email, NULL, v_first, v_last,
      'CLIENT'::public."UserRole", true,
      new.email_confirmed_at IS NOT NULL, now(), now()
    )
    ON CONFLICT (auth_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_user_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    UPDATE public.users
       SET email = lower(coalesce(new.email, email)),
           email_verified = new.email_confirmed_at IS NOT NULL,
           updated_at = now()
     WHERE auth_id = new.id;
  EXCEPTION WHEN unique_violation THEN
    -- Another local row already owns that email: keep it and only sync the flag.
    UPDATE public.users
       SET email_verified = new.email_confirmed_at IS NOT NULL,
           updated_at = now()
     WHERE auth_id = new.id;
  END;

  RETURN new;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    EXECUTE 'DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users';
    EXECUTE 'CREATE TRIGGER on_auth_user_created
             AFTER INSERT ON auth.users
             FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()';

    EXECUTE 'DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users';
    EXECUTE 'CREATE TRIGGER on_auth_user_updated
             AFTER UPDATE OF email, email_confirmed_at ON auth.users
             FOR EACH ROW EXECUTE FUNCTION public.sync_user_from_auth()';
  END IF;
END;
$$;

-- ============================================================
-- Row Level Security: the browser never talks to Postgres.
-- The API connects as `postgres` (BYPASSRLS). If a future admin panel
-- uses supabase-js directly, add explicit policies then.
-- ============================================================

DO $$
DECLARE
  t record;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    FOR t IN
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', t.tablename);
    END LOOP;

    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated';
  END IF;
END;
$$;
