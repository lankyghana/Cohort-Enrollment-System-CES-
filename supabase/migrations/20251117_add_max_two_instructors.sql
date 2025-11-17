-- Migration: enforce a maximum of two instructors in public.users
-- Adds a trigger that prevents inserting or updating a row with role='instructor'
-- when there are already two other instructor rows.
-- This mirrors the single-admin enforcement pattern.

CREATE OR REPLACE FUNCTION public.enforce_max_two_instructors()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  instr_count bigint;
BEGIN
  -- Only enforce when the new row's role is instructor
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND (NEW.role = 'instructor') THEN
    -- Count existing instructors excluding the row being inserted/updated
    SELECT count(*) INTO instr_count FROM public.users WHERE role = 'instructor' AND id IS DISTINCT FROM NEW.id;

    IF instr_count >= 2 THEN
      RAISE EXCEPTION 'max_instructors_reached: at most two instructor accounts are allowed';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS enforce_max_two_instructors_trigger ON public.users;

CREATE TRIGGER enforce_max_two_instructors_trigger
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.enforce_max_two_instructors();
