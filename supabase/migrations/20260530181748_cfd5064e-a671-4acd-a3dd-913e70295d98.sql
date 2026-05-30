-- Lock down SECURITY DEFINER functions so signed-in users can't call them via the Data API.
-- has_role is invoked from RLS policies (runs as table owner, unaffected).
-- handle_new_user is invoked from an auth trigger (runs as owner, unaffected).

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;