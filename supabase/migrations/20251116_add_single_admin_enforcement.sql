-- Migration: Enforce single admin account
-- Prevent more than one user having role = 'admin'

-- Function to enforce only one admin
CREATE OR REPLACE FUNCTION public.enforce_single_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- On insert: if new role is admin and any other admin exists, block
  IF TG_OP = 'INSERT' THEN
    IF NEW.role = 'admin' THEN
      IF EXISTS (SELECT 1 FROM public.users WHERE role = 'admin') THEN
        RAISE EXCEPTION 'Only one admin account is allowed';
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- On update: if role is being set to admin (and it wasn't admin before), ensure no other admin exists
    IF NEW.role = 'admin' AND (OLD.role IS DISTINCT FROM NEW.role) THEN
      IF EXISTS (SELECT 1 FROM public.users WHERE role = 'admin' AND id <> NEW.id) THEN
        RAISE EXCEPTION 'Only one admin account is allowed';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if present, then create a new one
DROP TRIGGER IF EXISTS enforce_single_admin_trigger ON public.users;

CREATE TRIGGER enforce_single_admin_trigger
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.enforce_single_admin();

-- Notes:
-- This prevents creating a second admin at the DB level. If you need
-- to provision an admin programmatically, use a service role key and
-- temporarily disable the trigger or use a migration that sets the role.
