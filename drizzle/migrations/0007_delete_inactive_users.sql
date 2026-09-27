CREATE OR REPLACE FUNCTION public.delete_inactive_users()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ids uuid[]; n integer;
BEGIN
  SELECT coalesce(array_agg(id), '{}') INTO ids FROM auth.users
  WHERE coalesce(last_sign_in_at, created_at) < now() - interval '2 years';
  IF array_length(ids, 1) IS NULL THEN RETURN 0; END IF;
  DELETE FROM public.measurements WHERE user_id = ANY(ids);
  DELETE FROM public.categories WHERE user_id = ANY(ids);
  DELETE FROM auth.users WHERE id = ANY(ids);
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.delete_inactive_users() FROM PUBLIC, anon, authenticated;
SELECT cron.schedule('delete-inactive-users', '15 1 * * *', 'SELECT public.delete_inactive_users();');