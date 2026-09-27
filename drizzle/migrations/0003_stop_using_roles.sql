CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  insert into public.categories (value, label, sort_order, hidden, user_id)
    select value, label, sort_order, false, new.id from public.category_templates;
  return new;
end;
$function$;
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
COMMENT ON TABLE public.user_roles IS 'DEPRECATED: role system removed; safe to drop';