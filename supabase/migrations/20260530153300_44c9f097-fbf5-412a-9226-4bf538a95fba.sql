
-- Fix mutable search_path on touch_updated_at
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Restrict EXECUTE on SECURITY DEFINER functions
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
-- authenticated must still call has_role (used by RLS policies); RLS evaluates as the policy owner, not the caller, so leave authenticated grant in place? Actually has_role is called via policy expressions which run as the querying user. We need authenticated to be able to evaluate it.
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
