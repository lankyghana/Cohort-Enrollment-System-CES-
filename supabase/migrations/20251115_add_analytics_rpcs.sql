-- Migration: add analytics RPCs for admin dashboard

-- RPC: admin_get_metrics
-- Returns basic metrics: total_students, total_courses, total_revenue, total_enrollments, active_courses
CREATE OR REPLACE FUNCTION public.admin_get_metrics()
RETURNS TABLE(
  total_students bigint,
  total_courses bigint,
  total_enrollments bigint,
  total_revenue numeric,
  active_courses bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT count(*) FROM public.users) AS total_students,
    (SELECT count(*) FROM public.courses WHERE status = 'published') AS total_courses,
    (SELECT count(*) FROM public.enrollments WHERE payment_status = 'completed') AS total_enrollments,
    (SELECT coalesce(sum(amount),0) FROM public.payments WHERE status = 'success') AS total_revenue,
    (SELECT count(*) FROM public.courses WHERE status = 'published' AND (max_students IS NULL OR enrollment_count < max_students)) AS active_courses;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: admin_enrollments_by_month
-- Returns monthly enrollment counts for the past N months (param months integer, default 6)
CREATE OR REPLACE FUNCTION public.admin_enrollments_by_month(p_months integer DEFAULT 6)
RETURNS TABLE(month text, year integer, month_index integer, enrollments bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT to_char(d::date, 'Mon') AS month, extract(year from d)::int AS year, extract(month from d)::int AS month_index,
    coalesce((SELECT count(*) FROM public.enrollments e WHERE date_trunc('month', e.enrolled_at) = date_trunc('month', d) AND e.payment_status = 'completed'),0) AS enrollments
  FROM (
    SELECT (date_trunc('month', now()) - (i || ' months')::interval) as d
    FROM generate_series(0, p_months - 1) as s(i)
  ) q
  ORDER BY d ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anon/admin roles if desired; note: these RPCs should be callable by server/admin users only in production.
-- Example (run in psql or Supabase SQL editor):
-- GRANT EXECUTE ON FUNCTION public.admin_get_metrics() TO authenticated;
-- GRANT EXECUTE ON FUNCTION public.admin_enrollments_by_month(integer) TO authenticated;
