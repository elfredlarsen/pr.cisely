CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.categories (value, label, sort_order, hidden, user_id)
    select value, label, sort_order, false, new.id from public.category_templates;
  return new;
end;
$function$;

COMMENT ON COLUMN public.profiles.email IS 'DEPRECATED: unused duplicate of auth.users.email; read the email from auth.users instead.';

DROP INDEX IF EXISTS public.categories_user_id_idx;