ALTER TABLE public.categories ADD CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.measurements ADD CONSTRAINT measurements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.measurements DROP CONSTRAINT measurements_category_same_user_fkey;
ALTER TABLE public.measurements ADD CONSTRAINT measurements_category_same_user_fkey FOREIGN KEY (category_id, user_id) REFERENCES public.categories(id, user_id) ON DELETE NO ACTION;
CREATE OR REPLACE FUNCTION public.delete_inactive_users()
 RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE n integer;
BEGIN
  DELETE FROM auth.users
  WHERE coalesce(last_sign_in_at, created_at) < now() - interval '2 years';
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.delete_inactive_users() FROM PUBLIC, anon, authenticated;