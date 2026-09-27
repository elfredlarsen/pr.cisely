CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.apply_retention_all()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE n integer;
BEGIN
  DELETE FROM public.measurements m
  USING public.profiles p
  WHERE p.id = m.user_id
    AND p.retention_days IS NOT NULL
    AND p.retention_days > 0
    AND m.ended_at < now() - make_interval(days => p.retention_days);
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_retention_all() FROM PUBLIC, anon, authenticated;